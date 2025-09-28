// getNativeAskar.ts
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// ⚠️ ESM/TS 환경 호환: koffi default import / CJS 둘 다 대비
// (tsconfig "module": "NodeNext" 등일 때도 동작)
import _koffi from "koffi";
const koffi: typeof _koffi = (_koffi as any).default ?? _koffi;

import type { NativeMethods } from "./NativeBindingInterface";
import { nativeBindings } from "./bindings";
import {
  ByteBufferStruct,
  SecretBufferStruct,
  EncryptedBufferStruct,
  AeadParamsStruct,
} from "../ffi/structures";

// TODO(rename): when lib is changed
const LIBNAME = "aries_askar";
const ENV_VAR = "LIB_ASKAR_PATH";

type Platform = "darwin" | "linux" | "win32";

type ExtensionMap = Record<Platform, { prefix?: string; extension: string }>;

const extensions: ExtensionMap = {
  darwin: { prefix: "lib", extension: ".dylib" },
  linux: { prefix: "lib", extension: ".so" },
  win32: { extension: ".dll" },
};

const libPaths: Record<Platform, string[]> = {
  darwin: ["/usr/local/lib/", "/usr/lib/", "/opt/homebrew/opt/"],
  linux: ["/usr/lib/", "/usr/local/lib/"],
  win32: ["C:\\Windows\\System32\\"],
};

// Alias for a simple function to check if the path exists
const doesPathExist = fs.existsSync;

function getLibraryPath(): string {
  const platform = os.platform();
  if (platform !== "linux" && platform !== "win32" && platform !== "darwin") {
    throw new Error(
      `Unsupported platform: ${platform}. linux, win32 and darwin are supported.`
    );
  }

  const pathFromEnvironment = process.env[ENV_VAR];
  const platformPaths = [...libPaths[platform]];

  // node-pre-gyp 등으로 내려온 바이너리를 우선 탐색
  platformPaths.unshift(path.join(__dirname, "../../native"));

  // 환경변수 경로가 있다면 최우선
  if (pathFromEnvironment) platformPaths.unshift(pathFromEnvironment);

  const candidates = platformPaths.map((p) =>
    path.join(
      p,
      `${extensions[platform].prefix ?? ""}${LIBNAME}${
        extensions[platform].extension
      }`
    )
  );

  const found = candidates.find(doesPathExist);
  if (!found) {
    throw new Error(
      `Could not find ${LIBNAME} with these paths: ${candidates.join(" ")}`
    );
  }
  return found;
}

/**
 * ffi-napi 시절의 시그니처 문자열을 koffi가 이해할 수 있도록 가볍게 정규화합니다.
 * - SAL 어노테이션(_Out_, _Inout_ 등) 제거
 * - 'pointer' → 'void *'
 * - 'string' → 'const char *' (읽기 전용 C 문자열로 가정)
 * - 중복 공백 정리
 *
 * 필요 시, 여기서 ByteBuffer/SecretBuffer 같은 사용자 정의 타입명을
 * 프로젝트의 실제 typedef/struct명과 일치시키세요.
 */
function normalizePrototype(proto: string): string {
  return (
    proto
      // SAL-like annotations 제거
      .replace(
        /\b_(In|Out|Inout|Outptr|In_reads|Out_writes|In_opt|Out_opt)\b[_\w()]*/gi,
        ""
      )
      // pointer → void *
      .replace(/\bpointer\b/gi, "void *")
      // string → const char *
      .replace(/\bstring\b/gi, "const char *")
      // Microsoft style int8 → int8_t (선호)
      .replace(/\bint8\b/g, "int8_t")
      .replace(/\buint8\b/g, "uint8_t")
      .replace(/\bint32\b/g, "int32_t")
      .replace(/\buint32\b/g, "uint32_t")
      .replace(/\bint64\b/g, "int64_t")
      .replace(/\buint64\b/g, "uint64_t")
      // size_t 는 유지
      .replace(/\s+/g, " ")
      .trim()
  );
}

/**
 * Koffi에 필요한 커스텀 타입들을 등록합니다.
 * structures.ts에서 이미 정의된 구조체들을 활용합니다.
 *
 * Note: structures.ts에서 import한 구조체들이 자동으로 등록되므로
 * 별도의 등록 과정이 필요하지 않습니다.
 */
function registerCommonStructsOnce() {
  // structures.ts에서 import한 구조체들이 자동으로 등록됩니다:
  // - ByteBufferStruct
  // - SecretBufferStruct
  // - EncryptedBufferStruct
  // - AeadParamsStruct
  // bindings.ts에서 콜백 타입들을 void *로 직접 정의했으므로
  // 별도의 타입 등록이 필요하지 않습니다.
  // 필요 시 다른 typedef/alias 도 추가
  // 예: koffi.alias('CallbackId', 'uint32_t')
  //     koffi.alias('ErrorCode', 'uint32_t')
}

/**
 * nativeBindings 객체를 순회하며 lib.func() 로 모두 바인딩합니다.
 * - 키: 함수 별칭 (NativeMethods의 프로퍼티명)
 * - 값: C 프로토타입 문자열 (반드시 C 함수명 포함)
 */
function bindAllFunctions(lib: any): NativeMethods {
  const out: Record<string, unknown> = {};

  for (const [alias, proto] of Object.entries(nativeBindings)) {
    if (typeof proto !== "string") {
      throw new Error(
        `Invalid prototype for ${alias}: expected string, got ${typeof proto}`
      );
    }

    const normalized = normalizePrototype(proto);

    try {
      // lib.func()는 프로토타입 문자열 안의 C 함수명으로 심볼을 찾습니다.
      // alias는 JS에서의 메서드명일 뿐이므로, 반환 객체의 키로만 사용합니다.
      const fn = lib.func(normalized);
      out[alias] = fn;
    } catch (e) {
      throw new Error(
        `Failed to bind "${alias}" with prototype "${normalized}". ` +
          `Original proto: "${proto}". ` +
          `Error: ${(e as Error).message}`
      );
    }
  }

  return out as unknown as NativeMethods;
}

let nativeAskar: NativeMethods | undefined;

export const getNativeAskar = (): NativeMethods => {
  if (nativeAskar) return nativeAskar;

  registerCommonStructsOnce();

  const libPath = getLibraryPath();
  const lib = koffi.load(libPath);

  nativeAskar = bindAllFunctions(lib);
  return nativeAskar;
};
