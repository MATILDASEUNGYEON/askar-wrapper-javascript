import {
  KdfMethod,
  LogLevel,
  Store,
  StoreKeyMethod,
  askar,
  registerAskar,
} from "@openwallet-foundation/askar-shared";
import { NodeJSAskar } from "../../src/NodeJSAskar";

export const getRawKey = () =>
  // 실제 프로젝트 키는 노출금지! 테스트용 시드 예시
  Store.generateRawKey(Buffer.from("00000000000000000000000000000My1"));

export const testStoreUri = process.env.URI || "sqlite://:memory:";

export const setupWallet = async () => {
  const key = getRawKey();

  const result = await Store.provision({
    recreate: true,
    uri: testStoreUri,
    keyMethod: new StoreKeyMethod(KdfMethod.Raw),
    passKey: key,
  });

  return result;
};

export const setup = () => {
  registerAskar({ askar: new NodeJSAskar() });
  askar.setDefaultLogger(); // ← no arguments
};

// 보기좋게 키를 마스킹
const mask = (s: string | Buffer, visible = 6) => {
  const str = Buffer.isBuffer(s) ? s.toString("utf8") : s;
  if (!str) return "<empty>";
  return str.length <= visible
    ? str
    : `${str.slice(0, visible)}…(${str.length})`;
};

// CLI 실행용 엔트리 포인트
async function main() {
  try {
    setup();

    const key = getRawKey();
    console.log("🔑 Using raw key:", mask(key));
    console.log("🗄️  Target URI  :", testStoreUri);

    const handleOrStore = await setupWallet();

    // 반환 타입이 구현에 따라 숫자 핸들이거나 Store 래퍼일 수 있으므로 안전하게 표기
    const typeDesc =
      typeof handleOrStore === "number"
        ? `handle=${handleOrStore}`
        : handleOrStore && typeof handleOrStore === "object"
        ? "Store object"
        : String(handleOrStore);

    console.log(`✅ Provision succeeded (${typeDesc})`);
    console.log("   You can now use the store (sessions, scans, etc.)");
    process.exitCode = 0;
  } catch (e) {
    console.error("❌ Provision failed");
    console.error(e);
    process.exitCode = 1;
  }
}

// CommonJS/ESM 환경 모두에서 동작하도록 가드
// (ts-node/빌드 후 node 실행 모두 지원)
const isMain =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isMain) {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  main();
}

// 기존 유틸도 유지
export const base64url = (str: string) =>
  Buffer.from(str).toString("base64url");
