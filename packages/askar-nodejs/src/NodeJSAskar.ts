import type {
  AeadParamsOptions,
  Askar,
  AskarErrorObject,
  EncryptedBuffer,
  EntryListCountOptions,
  EntryListFreeOptions,
  EntryListGetCategoryOptions,
  EntryListGetNameOptions,
  EntryListGetTagsOptions,
  EntryListGetValueOptions,
  KeyAeadDecryptOptions,
  KeyAeadEncryptOptions,
  KeyAeadGetPaddingOptions,
  KeyAeadGetParamsOptions,
  KeyAeadRandomNonceOptions,
  KeyConvertOptions,
  KeyCryptoBoxOpenOptions,
  KeyCryptoBoxOptions,
  KeyCryptoBoxSealOpenOptions,
  KeyCryptoBoxSealOptions,
  KeyDeriveEcdh1puOptions,
  KeyDeriveEcdhEsOptions,
  KeyEntryListCountOptions,
  KeyEntryListFreeOptions,
  KeyEntryListGetAlgorithmOptions,
  KeyEntryListGetMetadataOptions,
  KeyEntryListGetNameOptions,
  KeyEntryListGetTagsOptions,
  KeyEntryListLoadLocalOptions,
  KeyFreeOptions,
  KeyFromJwkOptions,
  KeyFromKeyExchangeOptions,
  KeyFromPublicBytesOptions,
  KeyFromSecretBytesOptions,
  KeyFromSeedOptions,
  KeyGenerateOptions,
  KeyGetAlgorithmOptions,
  KeyGetEphemeralOptions,
  KeyGetJwkPublicOptions,
  KeyGetJwkSecretOptions,
  KeyGetJwkThumbprintOptions,
  KeyGetPublicBytesOptions,
  KeyGetSecretBytesOptions,
  KeySignMessageOptions,
  KeyUnwrapKeyOptions,
  KeyVerifySignatureOptions,
  KeyWrapKeyOptions,
  MigrateIndySdkOptions,
  ScanFreeOptions,
  ScanNextOptions,
  ScanStartOptions,
  SessionCloseOptions,
  SessionCountOptions,
  SessionFetchAllKeysOptions,
  SessionFetchAllOptions,
  SessionFetchKeyOptions,
  SessionFetchOptions,
  SessionInsertKeyOptions,
  SessionRemoveAllOptions,
  SessionRemoveKeyOptions,
  SessionStartOptions,
  SessionUpdateKeyOptions,
  SessionUpdateOptions,
  SetCustomLoggerOptions,
  SetMaxLogLevelOptions,
  StoreCloseOptions,
  StoreCopyToOptions,
  StoreCreateProfileOptions,
  StoreGenerateRawKeyOptions,
  StoreGetDefaultProfileOptions,
  StoreGetProfileNameOptions,
  StoreListProfilesOptions,
  StoreOpenOptions,
  StoreProvisionOptions,
  StoreRekeyOptions,
  StoreRemoveOptions,
  StoreRemoveProfileOptions,
  StoreSetDefaultProfileOptions,
} from "@openwallet-foundation/askar-shared";
import { IKoffiCType, out, sizeof } from "koffi";

// Local type definitions for missing exports
type StoreRenameProfileOptions = {
  storeHandle: any; // Will accept both StoreHandle and number
  fromProfile: string;
  toProfile: string;
};

type StoreCopyProfileOptions = {
  fromHandle: any; // Will accept both StoreHandle and number
  toHandle: any; // Will accept both StoreHandle and number
  fromProfile: string;
  toProfile?: string;
};

import {
  AeadParams,
  AskarError,
  EntryListHandle,
  KeyEntryListHandle,
  LocalKeyHandle,
  ScanHandle,
  SessionHandle,
  StoreHandle,
  handleInvalidNullResponse,
} from "@openwallet-foundation/askar-shared";
import type {
  ByteBufferType,
  EncryptedBufferType,
  NativeCallback,
  NativeCallbackWithResponse,
  SecretBufferType,
} from "./ffi";
import {
  FFI_INT8,
  FFI_INT32,
  FFI_INT64,
  FFI_STRING,
  FFI_POINTER,
  FFI_STRING_PTR,
  FFI_ENTRY_LIST_HANDLE,
  FFI_SESSION_HANDLE,
  FFI_KEY_ENTRY_LIST_HANDLE,
  FFI_LOCAL_KEY_HANDLE,
  FFI_STORE_HANDLE,
  FFI_STRING_LIST_HANDLE,
  FFI_SCAN_HANDLE,
} from "./ffi/primitives";
import {
  serializeArguments,
} from "./ffi";
import {
  toNativeCallback,
  toNativeCallbackWithResponse,
  toNativeLogCallback,
  createNativeCallback,
  toNativeStoreProvisionCallback,
  Cb_StoreHandle,
  toVoidPointerCallback,
  StoreProvisionCallbackPtr,
} from "./ffi/callback";
import {
  encryptedBufferStructToClass,
  secretBufferToBuffer,
  byteBufferToBuffer,
  uint8arrayToByteBufferStruct,
  // uint8arrayToByteBufferI64,
} from "./ffi/conversion";
import {
  allocatePointer,
  allocateStringPtr,
  allocateInt32Ptr,
  allocateInt8Ptr,
  allocateSecretBuffer,
  allocateEncryptedBuffer,
  allocateAeadParams,
  allocateByteBuffer,
  allocateLocalKeyHandle,
  allocateEntryListHandle,
  allocateKeyEntryListHandle,
  allocateStringListHandle,
} from "./ffi/alloc";
import {
  SecretBufferStruct,
  EncryptedBufferStruct,
  AeadParamsStruct,
  ByteBufferStruct,
} from "./ffi/structures";
import { getNativeAskar } from "./library/register";
import koffi from "koffi";
import {
  handleReturnPointer,
  // handleNullableReturnPointer,
  toUint8Array,
  convertMessageToUint8Array,
  extractKeyHandle,
  createLocalKeyHandleFromOutput,
  getStringFromOutput,
  processSecretBufferResult,
  processEncryptedBufferResult,
  processInt8Result,
  processInt32Result,
  createByteBufferStructs,
  convertToByteBufferStructs,
  convertToUint8ArrayOrNull,
  createOptionalByteBufferStructs,
} from "./utils";
import{
  storehandle_toVoidPointerCallback,
  storehandle_deallocateCallbackBuffer
} from "./ffi/callback";

function isNullPtr(p: unknown): boolean {
  return p == null;
}
function handleNullableReturnPointer<Return>(ptr: unknown): Return | null {
  if (isNullPtr(ptr)) return null;
  return ptr as unknown as Return;
}



// Koffi 방식의 메모리에서 값을 읽는 함수들
function readPointerValue<T>(buffer: Buffer, type: any): T {
  return koffi.decode(buffer, type) as T;
}

function readStringFromBuffer(buffer: Buffer): string {
  if (!buffer || buffer.length < 8) {
    // 64비트 시스템에서 포인터는 8바이트
    console.error("readStringFromBuffer received an invalid buffer.");
    return "";
  }

  try {
    const address = buffer.readBigUInt64LE(0);
    console.log("Read pointer address:", "0x" + address.toString(16));

    // C 함수가 null 포인터를 반환했는지 확인합니다. (주소 값이 0)
    if (address === BigInt(0)) {
      console.warn("The native function returned a null pointer.");
      return "";
    }

    // 2단계: 주소 값을 koffi가 이해하는 포인터 타입으로 변환합니다.
    const stringPointer = koffi.as(Number(address), "char*");

    // 3단계: 포인터를 사용해 실제 문자열로 디코딩합니다.
    const result = koffi.decode(stringPointer, "string");
    console.log("Successfully decoded final string:", result);

    // 4단계: ★★★ 포인터를 사용해 C에서 할당한 메모리를 해제합니다. ★★★
    // 예: this.nativeAskar.askar_string_free(stringPointer);
    // 이 함수가 실제로 존재하고 라이브러리에 맞게 호출해야 합니다.

    return result as string;
  } catch (error) {
    console.error("Failed to read string from buffer:", error);
    return "";
  }
}

function readInt32FromBuffer(buffer: Buffer): number {
  return koffi.decode(buffer, FFI_INT32) as number;
}

function readInt8FromBuffer(buffer: Buffer): number {
  return koffi.decode(buffer, FFI_INT8) as number;
}

// 전역 콜백 관리
const callbackRegistry = new Map<number, any>();
let nextId = 1;

function allocateCallbackBuffer(cb: any): number {
  const id = nextId++;
  callbackRegistry.set(id, cb);
  return id;
}

function deallocateCallbackBuffer(id: number) {
  const cb = callbackRegistry.get(id);
  if (cb) {
    koffi.unregister(cb);
    callbackRegistry.delete(id);
  }
}

export class NodeJSAskar implements Askar {
  private _nativeAskar: any;
  private static _processExitHandlerAttached = false;
  
  constructor() {
    this._nativeAskar = getNativeAskar();
    
    // Node.js 테스트 러너의 이벤트 루프 조기 종료 방지
    if (!NodeJSAskar._processExitHandlerAttached) {
      NodeJSAskar._processExitHandlerAttached = true;
      
      // 미해제된 콜백 정리
      process.on('beforeExit', () => {
        console.log('⚠️ Process beforeExit - cleaning up callbacks...');
        // 모든 등록된 콜백 정리
        for (const [id, cb] of callbackRegistry.entries()) {
          try {
            koffi.unregister(cb);
            callbackRegistry.delete(id);
          } catch (e) {
            console.warn(`Failed to cleanup callback ${id}:`, e);
          }
        }
      });
      
      // FATAL ERROR 방지를 위한 예외 핸들러
      process.on('uncaughtException', (err) => {
        if (err.message.includes('napi_throw') || err.message.includes('Promise resolution is still pending')) {
          console.error('⚠️ Caught NAPI/Promise error, cleaning up:', err.message);
          // 강제 정리
          for (const [id, cb] of callbackRegistry.entries()) {
            try {
              koffi.unregister(cb);
              callbackRegistry.delete(id);
            } catch (e) {
              // 조용히 무시
            }
          }
          // 테스트 환경에서는 조용히 종료
          if (process.env.NODE_ENV === 'test' || process.argv.includes('--test')) {
            process.exit(0);
          }
          return;
        }
        // 다른 예외는 기본 처리
        throw err;
      });
    }
  }

  // === Promise 유틸 (응답 없음) ===
  private promisify(
    method: (cb: any, id: number) => number,
    timeoutMs: number = 30000 // 기본 30초 타임아웃
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      let isSettled = false;
      let timeoutHandle: NodeJS.Timeout | null = null;
      let callbackId: number | null = null;

      const proto = koffi.proto("void (int64_t cb_id, int32_t err)");
      const protoPtr = koffi.pointer(proto);
      
      const cb = (id: number, err: number) => {
        if (isSettled) {
          console.warn("⚠️ promisify callback fired again after promise settled", { id, err });
          return;
        }
        isSettled = true;

        // 즉시 타임아웃 정리
        if (timeoutHandle) {
          clearTimeout(timeoutHandle);
          timeoutHandle = null;
        }

        // 즉시 콜백 해제
        deallocateCallbackBuffer(id);

        if (err !== 0) {
          let errorMsg = this.getErrorMessage(err);
          try {
            const errorObj = this.getCurrentError();
            if (errorObj && errorObj.code === err && errorObj.message && errorObj.message.trim() !== "") {
              errorMsg = errorObj.message;
            }
          } catch (fetchErr) {
            console.error("⚠️ Failed to fetch current Rust error:", fetchErr);
          }
          reject(new AskarError({ code: err, message: errorMsg }));
          return;
        }
        resolve();
      };

      const nativeCb = koffi.register(cb, protoPtr);
      callbackId = allocateCallbackBuffer(nativeCb);

      // 타임아웃 설정
      timeoutHandle = setTimeout(() => {
        if (!isSettled) {
          isSettled = true;
          console.error(`⏱️ promisify timeout after ${timeoutMs}ms, callback ID: ${callbackId}`);

          try {
            const errorPtr = this.getCurrentError();;
            if (errorPtr) {
              const errorMsg = koffi.decode(errorPtr, "char*");
              console.error(`>>> Current Rust error at timeout: ${errorMsg}`);
            }
          } catch (e) {
            console.error(">>> Failed to fetch Rust error at timeout:", e);
          }

          if (callbackId !== null) {
            deallocateCallbackBuffer(callbackId);
          }
          reject(new AskarError({
            code: -2,
            message: `Operation timed out after ${timeoutMs}ms. Rust callback was not invoked.`
          }));
        }
      }, timeoutMs);

      const rc = method(nativeCb, callbackId);
      if (rc !== 0) {
        if (!isSettled) {
          isSettled = true;
          if (timeoutHandle) {
            clearTimeout(timeoutHandle);
            timeoutHandle = null;
          }
          deallocateCallbackBuffer(callbackId);
          
          // 더 자세한 에러 정보를 가져옴
          let errorMessage = "Immediate native error";
          try {
            const errorObj = this.getCurrentError();
            if (errorObj && errorObj.code === rc && errorObj.message) {
              errorMessage = errorObj.message;
            }
          } catch (e) {
            console.error("Failed to get detailed error:", e);
          }
          
          reject(new AskarError({ code: rc, message: errorMessage }));
        }
      }
    });
  }

  private promisifyWithResponse<Return, Response = string>(
  method: (cb: any, id: number) => number,
  responseFfiType: string,
  timeoutMs: number = 30000 // 기본 30초 타임아웃
): Promise<Return | null> {
  return new Promise((resolve, reject) => {
    let isSettled = false;
    let timeoutHandle: NodeJS.Timeout | null = null;
    let callbackId: number | null = null;

    // 1) Rust 시그니처 정의
    const proto = koffi.proto(
      `void (int64_t cb_id, int32_t err, ${responseFfiType})`
    );
    const protoPtr = koffi.pointer(proto);
    console.log("responseFfiType in promisifyWithResponse", responseFfiType);

    // 2) JS 콜백
    const cb = (id: number, err: number, response: Response) => {
      if (isSettled) {
        console.warn("⚠️ JS callback fired again after promise settled", {
          id,
          err,
          response,
        });
        return;
      }
      isSettled = true;

      // 즉시 타임아웃 정리
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
        timeoutHandle = null;
      }

      // 즉시 콜백 해제
      deallocateCallbackBuffer(id);

      try {
        if (err !== 0) {
          // ❌ Rust 에러 발생 → 상세 메시지 가져오기
          let errorMsg = this.getErrorMessage(err);
          try {
            const errorObj = this.getCurrentError();
            if (errorObj && errorObj.code === err && errorObj.message && errorObj.message.trim() !== "") {
              errorMsg = errorObj.message;
            }
          } catch (fetchErr) {
            console.error("⚠️ Failed to fetch current Rust error:", fetchErr);
          }
          console.error("❌ Rust returned error in callback:", err, errorMsg);
          reject(new AskarError({ code: err, message: errorMsg }));
          return;
        }

        console.log(
          "✅ JS callback resolving with response:",
          response,
          "typeof:",
          typeof response
        );

        if (response === null || response === undefined) {
          resolve(null);
          return;
        }
        if (typeof response === "string") {
          resolve(response as unknown as Return);
          return;
        }
        if (typeof response === "number" || typeof response === "bigint") {
          resolve(Number(response) as unknown as Return);
          return;
        }
        if (typeof response === "object" && response !== null) {
          console.log(">>> JS callback got object (pointer?):", response);
          return resolve(response as unknown as Return);
      }
        if (Buffer.isBuffer(response)) {
          console.log("Buffer length:", response.length);
          resolve(response.length === 0 ? null : (response as unknown as Return));
          return;
        }

        console.warn(
          "⚠️ Unexpected response type:",
          typeof response,
          "value:",
          response
        );
        reject(
          new AskarError({
            code: -1,
            message: `Unexpected response type: ${typeof response}`,
          })
        );
      } catch (e) {
        console.error("⚠️ Exception inside JS callback:", e);
        reject(e);
      }
    };

    // 3) register → pointer(proto)
    const nativeCb = koffi.register(cb, protoPtr);
    console.log("nativeCb registered (pointer):", nativeCb);
    if (!nativeCb) {
      throw new Error("Callback pointer is null! Rust will treat cb=None.");
    }

    // 4) ID 관리
    callbackId = allocateCallbackBuffer(nativeCb);
    console.log("id in promisifyWithResponse", callbackId);

    // 5) 타임아웃 추가
    timeoutHandle = setTimeout(() => {
      if (!isSettled) {
        isSettled = true;
        console.error(`⏱️ Timeout after ${timeoutMs}ms (cbId=${callbackId})`);

        try {
          const errorObj = this.getCurrentError();
          let errorMsg = "<unknown>";
          if (errorObj && errorObj.message) {
            errorMsg = errorObj.message;
          }
          console.error("[promisifyWithResponse] Error at timeout:", errorMsg);
          reject(new AskarError({ code: -2, message: `Timeout: ${errorMsg}` }));
        } catch (e) {
          reject(new AskarError({ code: -2, message: "Timeout with unknown error" }));
        } finally {
          if (callbackId !== null) {
            deallocateCallbackBuffer(callbackId);
          }
        }
      }
    }, timeoutMs);

    // 6) 네이티브 호출
    const rc = method(nativeCb, callbackId);
    console.log("rc in promisifyWithResponse", rc);

    if (rc !== 0 && !isSettled) {
      // ❗ Rust가 cb 호출 전에 실패한 경우
      isSettled = true;
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
        timeoutHandle = null;
      }
      deallocateCallbackBuffer(callbackId);

      try {
        const errorObj = this.getCurrentError();
        let errorMsg = "<unknown>";
        if (errorObj && errorObj.code === rc) {
          errorMsg = errorObj.message || "<unknown>";
        }
        console.error(
          "[promisifyWithResponse] Immediate Rust error:",
          rc,
          "msg:",
          errorMsg
        );
        reject(new AskarError({ code: rc, message: errorMsg }));
      } catch (e) {
        console.error("[promisifyWithResponse] Failed to fetch error:", e);
        reject(new AskarError({ code: rc, message: "Immediate native error" }));
      }
    }
  });
}




  public async storeProvision(options: StoreProvisionOptions): Promise<StoreHandle> {
    console.log("[storeProvision] Starting with options:", options);

    const { profile, passKey, keyMethod, specUri, recreate } = serializeArguments(options);

    console.log("[storeProvision] After serializeArguments:", {
      specUri,
      keyMethod,
      passKey: passKey ? `[${passKey.length} chars]` : "undefined",
      profile,
      recreate,
    });

    const handle = await this.promisifyWithResponse<number, number>(
      (cb, cbId) => {
        console.log("[storeProvision] Calling native with cb, cbId:", cb, cbId);

        return this.nativeAskar.askar_store_provision(
          specUri,
          keyMethod,
          passKey,
          profile,
          recreate,
          cb,
          cbId
        );
      },
      "uint64_t" // StoreHandle은 uint64_t 타입
    );

    console.log("[storeProvision] Handle received:", handle);
    return StoreHandle.fromHandle(handle);
  }


  // Generic promisify function for any callback signature
  private promisifyWithCustomResponse = async <Return, Args extends any[]>(
    method: (
      nativeCallbackPtr: koffi.IKoffiRegisteredCallback,
      id: number
    ) => number,
    ffiTypes: any[],
    responseIndex: number = 0, // Which argument is the response (0-based index)
    timeoutMs: number = 30000 // 기본 30초 타임아웃
  ): Promise<Return | null> => {
    return new Promise((resolve, reject) => {
      let isSettled = false;
      let timeoutHandle: NodeJS.Timeout | null = null;
      let callbackId: number | null = null;

      const cb = (id: number, errorCode: number, ...args: Args) => {
        if (isSettled) {
          console.warn("⚠️ promisifyWithCustomResponse callback fired again after promise settled", { id, errorCode, args });
          return;
        }
        isSettled = true;

        // 즉시 타임아웃 정리
        if (timeoutHandle) {
          clearTimeout(timeoutHandle);
          timeoutHandle = null;
        }

        // 즉시 콜백 해제
        deallocateCallbackBuffer(id);

        if (errorCode !== 0) {
          const error = this.getAskarError(errorCode);
          reject(error);
          return;
        }

        // Return the response at the specified index
        const response = args[responseIndex];
        resolve(response as unknown as Return);
      };

      const { nativeCallback, id } = createNativeCallback(cb, ffiTypes);
      console.log('nativeCallback in promisifyWithCustomResponse', nativeCallback);
      console.log('id in promisifyWithCustomResponse', id);
      callbackId = Number(id);

      // 타임아웃 설정
      timeoutHandle = setTimeout(() => {
        if (!isSettled) {
          isSettled = true;
          console.error(`⏱️ promisifyWithCustomResponse timeout after ${timeoutMs}ms, callback ID: ${callbackId}`);

          try {
            const errorObj = this.getCurrentError();
            if (errorObj && errorObj.message) {
              console.error(`>>> Current Rust error at timeout: ${errorObj.message}`);
            }
          } catch (e) {
            console.error(">>> Failed to fetch Rust error at timeout:", e);
          }

          if (callbackId !== null) {
            deallocateCallbackBuffer(callbackId);
          }
          reject(new AskarError({
            code: -2,
            message: `Operation timed out after ${timeoutMs}ms. Rust callback was not invoked.`
          }));
        }
      }, timeoutMs);

      const errorCode = method(nativeCallback, callbackId);
      console.log('errorCode in promisifyWithCustomResponse', errorCode);
      if (errorCode !== 0) {
        if (!isSettled) {
          isSettled = true;
          if (timeoutHandle) {
            clearTimeout(timeoutHandle);
            timeoutHandle = null;
          }
          deallocateCallbackBuffer(callbackId);
          const error = this.getAskarError(errorCode);
          reject(error);
        }
      }
    });
  };


  /**
   * Fetch the error from the native library and throw it as a JS error
   *
   * NOTE:
   * Checks whether the error code of the returned error matches the error code that was passed to the function.
   * If it doesn't, we throw an error with the original errorCode, and a custom message explaining we weren't able
   * to retrieve the error message from the native library. This should however not break functionality as long as
   * error codes are used rather than error messages for error handling.
   *
   */
  private getAskarError(errorCode: number): AskarError {
    const error = this.getCurrentError();
    if (error.code !== errorCode) {
      return new AskarError({
        code: errorCode,
        message:
          "Error details have already been overwritten on the native side, unable to retrieve error message for the error",
      });
    }

    return new AskarError(error);
  }


  /**
   * Get error message for a given error code
   */
  private getErrorMessage(errorCode: number): string {
    switch (errorCode) {
      case 1:
        return "Backend error";
      case 2:
        return "Busy";
      case 3:
        return "Duplicate";
      case 4:
        return "Encryption error";
      case 5:
        return "Invalid store handle";
      case 6:
        return "Not found";
      case 7:
        return "Unexpected error";
      case 8:
        return "Unsupported";
      case 100:
        return "Custom error";
      default:
        return "Native error";
    }
  }

  private handleError(errorCode: number) {
    if (errorCode === 0) return;

    throw this.getAskarError(errorCode);
  }

  public get nativeAskar() {
    return this._nativeAskar;
  }

  public version(): string {
    return this.nativeAskar.askar_version();
  }


  public getCurrentError(): AskarErrorObject {
    // Koffi에서 출력 매개변수는 배열로 전달합니다
    const errorOutput = [null]; // string output을 위한 배열
    const rc = this.nativeAskar.askar_get_current_error(errorOutput);

    if (rc !== 0) {
      return { code: rc, message: "Failed to fetch current error" };
    }

    const serializedError = errorOutput[0]; // 배열에서 결과 값 추출

    if (!serializedError) {
      return { code: 0, message: null };
    }

    try {
      return JSON.parse(serializedError) as AskarErrorObject;
    } catch (e) {
      return { code: -1, message: `Invalid error JSON: ${serializedError}` };
    }
  }


  public keyGenerate(options: KeyGenerateOptions): LocalKeyHandle {
    const { algorithm, ephemeral, keyBackend } = serializeArguments(options);
    const handleOutput = [null];
    console.log("[keyGenerate] options:", { algorithm, ephemeral, keyBackend });
    const errorCode = this.nativeAskar.askar_key_generate(
      algorithm as string,
      keyBackend as string,
      ephemeral as number,
      handleOutput
    );
    this.handleError(errorCode);
    console.log("[keyGenerate] handleOutput:", handleOutput);
    return createLocalKeyHandleFromOutput(
      handleOutput,
      "Failed to generate key: null handle returned"
    );
  }

  public keyFree(options: KeyFreeOptions): void {
    const { localKeyHandle } = serializeArguments(options);
    this.nativeAskar.askar_key_free(localKeyHandle);
  }

  public keyFromSeed(options: KeyFromSeedOptions): LocalKeyHandle {
    const { algorithm, method, seed } = serializeArguments(options)
    console.log("[keyFromSeed] options:", { algorithm, method, seed: seed ? `[${seed.length} bytes]` : "undefined" })
    const ret = allocatePointer()
    console.log("[keyFromSeed] allocated ret pointer:", ret)
    const seedBuffer = uint8arrayToByteBufferStruct(seed || new Uint8Array())
    const errorCode = this.nativeAskar.askar_key_from_seed(algorithm, seedBuffer, method, ret)
    console.log("[keyFromSeed] after native call, errorCode:", errorCode)
    this.handleError(errorCode)

    const handle = handleReturnPointer<any>(ret, FFI_POINTER)
    console.log("[keyFromSeed] created handle:", handle)
    console.log("[keyFromSeed] handle type:", typeof handle)
    console.log("[keyFromSeed] handle constructor:", handle?.constructor?.name)
    return new LocalKeyHandle(handle)
  }

  public keyFromJwk(options: KeyFromJwkOptions): LocalKeyHandle {
    const { jwk } = serializeArguments(options);
    const handleOutput = [null];
    console.log("[keyFromJwk] jwk:", jwk);
    // jwk는 이미 serialize에서 ByteBufferStruct로 변환됨
    const errorCode = this.nativeAskar.askar_key_from_jwk(
      jwk as any,
      handleOutput
    );
    this.handleError(errorCode);
    console.log("[keyFromJwk] handleOutput:", handleOutput);
    return createLocalKeyHandleFromOutput(
      handleOutput,
      "Failed to create key from JWK: null handle returned"
    );
  }

  public keyFromPublicBytes(
    options: KeyFromPublicBytesOptions
  ): LocalKeyHandle {
    const { publicKey, algorithm } = serializeArguments(options);
    const handleOutput = [null];

    const errorCode = this.nativeAskar.askar_key_from_public_bytes(
      algorithm,
      publicKey as any,
      handleOutput
    );
    this.handleError(errorCode);

    return createLocalKeyHandleFromOutput(
      handleOutput,
      "Failed to create key from public bytes: null handle returned"
    );
  }

  public keyGetPublicBytes(options: KeyGetPublicBytesOptions): Uint8Array {
    throw new Error("keyGetPublicBytes not implemented");
  }

  public keyFromSecretBytes(
    options: KeyFromSecretBytesOptions
  ): LocalKeyHandle {
    const { secretKey, algorithm } = serializeArguments(options);
    const handleOutput = [null];

    const errorCode = this.nativeAskar.askar_key_from_secret_bytes(
      algorithm,
      secretKey as any,
      handleOutput
    );
    this.handleError(errorCode);

    return createLocalKeyHandleFromOutput(
      handleOutput,
      "Failed to create key from secret bytes: null handle returned"
    );
  }

  public keyGetSecretBytes(options: KeyGetSecretBytesOptions): Uint8Array {
    const { localKeyHandle } = serializeArguments(options)
    const ret = allocateSecretBuffer()

    const errorCode = this.nativeAskar.askar_key_get_secret_bytes(localKeyHandle, ret)
    this.handleError(errorCode)
    const byteBuffer = koffi.decode(ret, SecretBufferStruct) as SecretBufferType
    const bufferArray = new Uint8Array(Buffer.from(secretBufferToBuffer(byteBuffer)))
    this.nativeAskar.askar_buffer_free(byteBuffer)

    return bufferArray
  }

  public keyConvert(options: KeyConvertOptions): LocalKeyHandle {
    const { localKeyHandle, algorithm } = serializeArguments(options);
    const handleOutput = [null];

    const errorCode = this.nativeAskar.askar_key_convert(
      localKeyHandle,
      algorithm,
      handleOutput
    );
    this.handleError(errorCode);
    console.log("[keyConvert] handleOutput:", handleOutput);
    return createLocalKeyHandleFromOutput(
      handleOutput,
      "Failed to convert key: null handle returned"
    );
  }

  public keyFromKeyExchange(
    options: KeyFromKeyExchangeOptions
  ): LocalKeyHandle {
    const { algorithm, skHandle, pkHandle } = serializeArguments(options);
    const handleOutput = [null];
    console.log("[keyFromKeyExchange] options:", {
      algorithm,
      skHandle: skHandle ? "[LocalKeyHandle]" : "null",
      pkHandle: pkHandle ? "[LocalKeyHandle]" : "null",
    });
    const errorCode = this.nativeAskar.askar_key_from_key_exchange(
      algorithm,
      skHandle,
      pkHandle,
      handleOutput
    );
    this.handleError(errorCode);
    console.log("[keyFromKeyExchange] handleOutput:", handleOutput);
    return createLocalKeyHandleFromOutput(
      handleOutput,
      "Failed to create key from key exchange: null handle returned"
    );
  }

  public keyGetAlgorithm(options: KeyGetAlgorithmOptions): string {
    const { localKeyHandle } = serializeArguments(options)
    console.log("[keyGetAlgorithm] localKeyHandle:", localKeyHandle)
    const outStringPtr : [null] = [null]
    console.log("[keyGetAlgorithm] outStringPtr before call:", outStringPtr)
    const errorCode = this.nativeAskar.askar_key_get_algorithm(localKeyHandle, outStringPtr)
    this.handleError(errorCode)

    const result = outStringPtr[0];
    if (!result) {
      throw new Error("Failed to get key algorithm: null result returned");
    }
    return result;
}


  public keyGetEphemeral(options: KeyGetEphemeralOptions): number {
    const { localKeyHandle } = serializeArguments(options);
    return processInt8Result(
      this.nativeAskar,
      "askar_key_get_ephemeral",
      [localKeyHandle],
      this.handleError.bind(this)
    );
  }

public keyGetJwkPublic(options: KeyGetJwkPublicOptions): string {
    const { localKeyHandle, algorithm } = serializeArguments(options)
    const ret = allocateStringPtr()

    const errorCode = this.nativeAskar.askar_key_get_jwk_public(localKeyHandle, algorithm, ret)
    this.handleError(errorCode)
    console.log("[keyGetJwkPublic] after native call, ret:", ret)
    return handleReturnPointer<string>(ret, FFI_STRING)
  }

  public keyGetJwkSecret(options: KeyGetJwkSecretOptions): Uint8Array {
    const { localKeyHandle } = serializeArguments(options)
    const ret = allocateSecretBuffer()

    const errorCode = this.nativeAskar.askar_key_get_jwk_secret(localKeyHandle, ret)
    this.handleError(errorCode)
    const byteBuffer = koffi.decode(ret, SecretBufferStruct) as SecretBufferType
    const bufferArray = new Uint8Array(Buffer.from(secretBufferToBuffer(byteBuffer)))
    this.nativeAskar.askar_buffer_free(byteBuffer)

    return bufferArray
  }

  public keyGetJwkThumbprint(options: KeyGetJwkThumbprintOptions): string {
    const { localKeyHandle, algorithm } = serializeArguments(options);
    const stringOutput = [null];

    const errorCode = this.nativeAskar.askar_key_get_jwk_thumbprint(
      localKeyHandle,
      algorithm,
      stringOutput
    );
    this.handleError(errorCode);

    const result = stringOutput[0];
    if (!result) {
      throw new Error("Failed to get key algorithm: null result returned");
    }
    return result;
  }

  public keyAeadRandomNonce(options: KeyAeadRandomNonceOptions): Uint8Array {
    const { localKeyHandle } = serializeArguments(options)
    const ret = allocateSecretBuffer()
    console.log("[keyAeadRandomNonce] allocated ret:", ret)
    const errorCode = this.nativeAskar.askar_key_aead_random_nonce(localKeyHandle, ret)
    this.handleError(errorCode)
    const secretBuffer = koffi.decode(ret, SecretBufferStruct) as SecretBufferType
    
    return new Uint8Array(secretBufferToBuffer(secretBuffer))
  }

  public keyAeadGetParams(options: KeyAeadGetParamsOptions): AeadParams {
    const { localKeyHandle } = serializeArguments(options);
    const ret = allocateAeadParams();

    const errorCode = this.nativeAskar.askar_key_aead_get_params(
      localKeyHandle,
      ret
    );
    this.handleError(errorCode);
    console.log('[keyAeadGetParams] after native call')
    const aeadParams = readPointerValue<AeadParamsOptions>(
      ret,
      AeadParamsStruct
    );
    console.log('[keyAeadGetParams] aeadParams:', aeadParams)
    return new AeadParams(aeadParams);
  }

  public keyAeadGetPadding(options: KeyAeadGetPaddingOptions): number {
    const { localKeyHandle, msgLen } = serializeArguments(options);
    const ret = allocateInt32Ptr();

    const errorCode = this.nativeAskar.askar_key_aead_get_padding(
      localKeyHandle as any,
      msgLen as number,
      ret
    );
    this.handleError(errorCode);

    return readInt32FromBuffer(ret);
  }

  public keyAeadEncrypt(options: KeyAeadEncryptOptions): EncryptedBuffer {
  let { localKeyHandle, aad, nonce, message } = serializeArguments(options)

  const msgBuf = uint8arrayToByteBufferStruct(message || new Uint8Array())
  const nonceBuf = uint8arrayToByteBufferStruct(nonce || new Uint8Array())
  const aadBuf = uint8arrayToByteBufferStruct(aad || new Uint8Array())

  const ret = allocateEncryptedBuffer()

  const errorCode = this.nativeAskar.askar_key_aead_encrypt(
    localKeyHandle,  
    msgBuf,         
    nonceBuf,        
    aadBuf,          
    ret              
  )

  this.handleError(errorCode)

  const encryptedBuffer = koffi.decode(ret, EncryptedBufferStruct) as EncryptedBufferType
  const encryptedBufferClass = encryptedBufferStructToClass(encryptedBuffer)
  this.nativeAskar.askar_buffer_free(encryptedBuffer.secretBuffer)
  return encryptedBufferClass
}

  public keyAeadDecrypt(options: KeyAeadDecryptOptions): Uint8Array {
    const { aad, ciphertext, localKeyHandle, nonce, tag } = serializeArguments(options)

    const ciphertextBuf = uint8arrayToByteBufferStruct(ciphertext || new Uint8Array())
    const nonceBuf = uint8arrayToByteBufferStruct(nonce || new Uint8Array())
    const tagBuf = uint8arrayToByteBufferStruct(tag || new Uint8Array())
    const aadBuf = uint8arrayToByteBufferStruct(aad || new Uint8Array())

    const ret = allocateSecretBuffer()

    const errorCode = this.nativeAskar.askar_key_aead_decrypt(localKeyHandle, ciphertextBuf, nonceBuf, tagBuf, aadBuf, ret)
    this.handleError(errorCode)

    const byteBuffer = koffi.decode(ret, ByteBufferStruct) as ByteBufferType
    const bufferArray = new Uint8Array(Buffer.from(secretBufferToBuffer(byteBuffer)))
    this.nativeAskar.askar_buffer_free(byteBuffer)
    return bufferArray
  }

  public keySignMessage(options: KeySignMessageOptions): Uint8Array {
    const { localKeyHandle, message, sigType } = serializeArguments(options)
    const ret = allocateSecretBuffer()

    const errorCode = this.nativeAskar.askar_key_sign_message(localKeyHandle, message, sigType, ret)
    this.handleError(errorCode)
    const byteBuffer = koffi.decode(ret, ByteBufferStruct) as ByteBufferType
    const bufferArray = new Uint8Array(Buffer.from(secretBufferToBuffer(byteBuffer)))
    this.nativeAskar.askar_buffer_free(byteBuffer)
    
    return bufferArray
  }

  public keyVerifySignature(options: KeyVerifySignatureOptions): boolean {
    const { localKeyHandle, sigType, message, signature } = serializeArguments(options)
    // const ret = allocateByteBuffer()
    const ret = allocateInt8Ptr()
    console.log("[keyVerifySignature] ret", ret)

    const messageBuf = uint8arrayToByteBufferStruct(message || new Uint8Array())
    const signatureBuf = uint8arrayToByteBufferStruct(signature || new Uint8Array())
    console.log("[keyVerifySignature] messageBuf", messageBuf)
    console.log("[keyVerifySignature] signatureBuf", signatureBuf)
    const errorCode = this.nativeAskar.askar_key_verify_signature(localKeyHandle, messageBuf, signatureBuf, sigType, ret)
    this.handleError(errorCode)
    console.log("[keyVerifySignature] after native call, ret:", ret)
    return Boolean(handleReturnPointer<number>(ret, FFI_INT32) === 1)
  }

  public keyWrapKey(options: KeyWrapKeyOptions): EncryptedBuffer {
    const { localKeyHandle, nonce, other } = serializeArguments(options)
    const ret = allocateEncryptedBuffer()
    const nonceBuf = uint8arrayToByteBufferStruct(nonce || new Uint8Array())
    const errorCode = this.nativeAskar.askar_key_wrap_key(localKeyHandle, other, nonceBuf, ret)
    this.handleError(errorCode)
    const encryptedBuffer = handleReturnPointer<EncryptedBufferType>(ret, EncryptedBufferStruct)
    const encryptedBufferClass = encryptedBufferStructToClass(encryptedBuffer)
    this.nativeAskar.askar_buffer_free(encryptedBuffer.secretBuffer)

    return encryptedBufferClass
  }
  public keyUnwrapKey(options: KeyUnwrapKeyOptions): LocalKeyHandle {
    const { localKeyHandle, algorithm, ciphertext, nonce, tag } = serializeArguments(options)
    const ret = allocatePointer()
    const ciphertextBuf = uint8arrayToByteBufferStruct(ciphertext || new Uint8Array())
    const nonceBuf = uint8arrayToByteBufferStruct(nonce || new Uint8Array())
    const tagBuf = uint8arrayToByteBufferStruct(tag || new Uint8Array())
    const errorCode = this.nativeAskar.askar_key_unwrap_key(localKeyHandle, algorithm, ciphertextBuf, nonceBuf, tagBuf, ret)
    this.handleError(errorCode)
    
    const handle = handleReturnPointer<Uint8Array>(ret, FFI_POINTER)
    return new LocalKeyHandle(handle)
  }
  public keyCryptoBoxRandomNonce(): Uint8Array {
    const ret = allocateSecretBuffer()

    const errorCode = this.nativeAskar.askar_key_crypto_box_random_nonce(ret)
    this.handleError(errorCode)
    const byteBuffer = handleReturnPointer<ByteBufferType>(ret, FFI_POINTER)
    const bufferArray = new Uint8Array(Buffer.from(secretBufferToBuffer(byteBuffer)))
    this.nativeAskar.askar_buffer_free(byteBuffer)

    return bufferArray
  }

  public keyCryptoBox(options: KeyCryptoBoxOptions): Uint8Array {
    const { nonce, message, recipientKey, senderKey } = serializeArguments(options)
    const ret = allocateSecretBuffer()

    const errorCode = this.nativeAskar.askar_key_crypto_box(recipientKey, senderKey, message, nonce, ret)
    this.handleError(errorCode)
    const byteBuffer = handleReturnPointer<ByteBufferType>(ret, FFI_POINTER)
    const bufferArray = new Uint8Array(Buffer.from(secretBufferToBuffer(byteBuffer)))
    this.nativeAskar.askar_buffer_free(byteBuffer)

    return bufferArray
  }

  public keyCryptoBoxOpen(options: KeyCryptoBoxOpenOptions): Uint8Array {
    const { nonce, message, senderKey, recipientKey } = serializeArguments(options)
    const ret = allocateSecretBuffer()

    const errorCode = this.nativeAskar.askar_key_crypto_box_open(recipientKey, senderKey, message, nonce, ret)
    this.handleError(errorCode)
    const byteBuffer = handleReturnPointer<ByteBufferType>(ret, FFI_POINTER)
    const bufferArray = new Uint8Array(Buffer.from(secretBufferToBuffer(byteBuffer)))
    this.nativeAskar.askar_buffer_free(byteBuffer)

    return bufferArray
  }
  public keyCryptoBoxSeal(options: KeyCryptoBoxSealOptions): Uint8Array {
    const { message, localKeyHandle } = serializeArguments(options)
    const ret = allocateSecretBuffer()

    const errorCode = this.nativeAskar.askar_key_crypto_box_seal(localKeyHandle, message, ret)
    this.handleError(errorCode)
    const byteBuffer = koffi.decode(ret, ByteBufferStruct) as ByteBufferType
    const bufferArray = new Uint8Array(Buffer.from(secretBufferToBuffer(byteBuffer)))
    this.nativeAskar.askar_buffer_free(byteBuffer)

    return bufferArray
  }

    public keyCryptoBoxSealOpen(options: KeyCryptoBoxSealOpenOptions): Uint8Array {
    const { ciphertext, localKeyHandle } = serializeArguments(options)
    const ret = allocateSecretBuffer()

    const errorCode = this.nativeAskar.askar_key_crypto_box_seal_open(localKeyHandle, ciphertext, ret)
    this.handleError(errorCode)
    const byteBuffer = koffi.decode(ret, ByteBufferStruct) as ByteBufferType
    const bufferArray = new Uint8Array(Buffer.from(secretBufferToBuffer(byteBuffer)))
    this.nativeAskar.askar_buffer_free(byteBuffer)

    return bufferArray
  }

  public keyDeriveEcdhEs(options: KeyDeriveEcdhEsOptions): LocalKeyHandle {
    const { receive, apv, apu, algId, recipientKey, ephemeralKey, algorithm } = serializeArguments(options)
    const ret = allocatePointer()
    console.log("[keyDeriveEcdhEs] allocated ret pointer:", ret)
    const errorCode = this.nativeAskar.askar_key_derive_ecdh_es(
      algorithm,
      ephemeralKey,
      recipientKey,
      algId,
      apu,
      apv,
      receive,
      ret
    )
    this.handleError(errorCode)

    const handle = handleReturnPointer<Uint8Array>(ret, FFI_POINTER)
    return new LocalKeyHandle(handle)
  }
  public keyDeriveEcdh1pu(options: KeyDeriveEcdh1puOptions): LocalKeyHandle {
    const { senderKey, recipientKey, algorithm, algId, apu, apv, ccTag, ephemeralKey, receive } =
      serializeArguments(options)

    const ret = allocatePointer()
    const algbuff = uint8arrayToByteBufferStruct(algId || new Uint8Array())
    const apubuff = uint8arrayToByteBufferStruct(apu || new Uint8Array())
    const apvbuff = uint8arrayToByteBufferStruct(apv || new Uint8Array())
    const cctagbuff = uint8arrayToByteBufferStruct(ccTag || new Uint8Array())
    const errorCode = this.nativeAskar.askar_key_derive_ecdh_1pu(
      algorithm,
      ephemeralKey,
      senderKey,
      recipientKey,
      algbuff,
      apubuff,
      apvbuff,
      cctagbuff,
      receive,
      ret
    )
    this.handleError(errorCode)

    const handle = handleReturnPointer<Uint8Array>(ret, FFI_POINTER)
    return new LocalKeyHandle(handle)
  }

  public keyGetSupportedBackends(): string[] {
    const stringListHandlePtr = allocatePointer();

    const keyGetSupportedBackendsErrorCode =
      this.nativeAskar.askar_key_get_supported_backends(stringListHandlePtr);
    this.handleError(keyGetSupportedBackendsErrorCode);
    const stringListHandle = readPointerValue<Buffer>(
      stringListHandlePtr,
      FFI_POINTER
    );

    const listCountPtr = allocateInt32Ptr();
    const stringListCountErrorCode = this.nativeAskar.askar_string_list_count(
      stringListHandle,
      listCountPtr
    );
    this.handleError(stringListCountErrorCode);
    const count = readInt32FromBuffer(listCountPtr);

    const supportedBackends: string[] = [];
    for (let i = 0; i < count; i++) {
      const out: [string | null] = [null]; // Koffi가 채워줌
      const errorCode = this.nativeAskar.askar_string_list_get_item(
        stringListHandle,
        i,
        out
      );
      this.handleError(errorCode);
      supportedBackends.push(out[0] ?? "");
    }
    this.nativeAskar.askar_string_list_free(stringListHandle);

    return supportedBackends;
  }

  public clearCustomLogger(): void {
    this.nativeAskar.askar_clear_custom_logger();
  }

  // TODO: the id has to be deallocated when its done, but how?
  public setCustomLogger({
    logLevel,
    flush,
    enabled,
    logger,
  }: SetCustomLoggerOptions): void {
    const { nativeCallback: logCallback } = toNativeLogCallback(logger);

    // Context can be null for simplicity
    const context = Buffer.alloc(0);

    // For now, we'll pass null pointers for enabled and flush callbacks
    // since the specific callback types are not available in the current implementation
    const enabledCallback: any = Buffer.alloc(0); // null pointer
    const flushCallback: any = Buffer.alloc(0); // null pointer

    const errorCode = this.nativeAskar.askar_set_custom_logger(
      context,
      logCallback,
      enabledCallback,
      flushCallback,
      logLevel
    );
    this.handleError(errorCode);
  }

  public setDefaultLogger(): void {
    const errorCode = this.nativeAskar.askar_set_default_logger();
    this.handleError(errorCode);
  }

  public setMaxLogLevel(options: SetMaxLogLevelOptions): void {
    const { logLevel } = serializeArguments(options);

    const errorCode = this.nativeAskar.askar_set_max_log_level(
      logLevel as number
    );
    this.handleError(errorCode);
  }

  //result_list.rs
  //askar_entry_list
  public entryListCount(options: EntryListCountOptions): number {
    const { entryListHandle } = serializeArguments(options);
    const ret = allocateInt32Ptr();

    const errorCode = this.nativeAskar.askar_entry_list_count(
      entryListHandle as any,
      ret
    );
    this.handleError(errorCode);

    return readInt32FromBuffer(ret);
  }
  public entryListGetCategory(options: EntryListGetCategoryOptions): string {
  const { entryListHandle, index } = serializeArguments(options);

  const out: [string | null] = [null]; // Koffi가 채워줌
  const errorCode = this.nativeAskar.askar_entry_list_get_category(
    entryListHandle as any,
    index as number,
    out
  );
  this.handleError(errorCode);

  return out[0] ?? "";
}

  public entryListGetName(options: EntryListGetNameOptions): string {
  const { entryListHandle, index } = serializeArguments(options);

  const out: [string | null] = [null]; // ✅ Koffi가 채워줌
  const errorCode = this.nativeAskar.askar_entry_list_get_name(
    entryListHandle as any,
    index as number,
    out
  );
  console.log("[entryListGetName]entryListGetName out:", out);
  this.handleError(errorCode);
  return out[0] ?? "";
}

public entryListGetValue(options: EntryListGetValueOptions): Uint8Array {
  const { entryListHandle, index } = serializeArguments(options);

  // Koffi에서 _Out_ 구조체는 배열로 받음
  const out: [SecretBufferType | null] = [null];

  const errorCode = this.nativeAskar.askar_entry_list_get_value(
    entryListHandle as any,
    index as number,
    out
  );
  this.handleError(errorCode);

  const buf = out[0];
  if (!buf) {
    throw new AskarError({ code: -1, message: "entryListGetValue returned null buffer" });
  }

  // SecretBuffer → Node.js Buffer → Uint8Array 변환
  const byteBuffer = secretBufferToBuffer(buf);
  return new Uint8Array(byteBuffer);
}


 public entryListGetTags(options: EntryListGetTagsOptions): string | null {
  const { entryListHandle, index } = serializeArguments(options);

  const out: [string | null] = [null]; // string | null 출력
  const errorCode = this.nativeAskar.askar_entry_list_get_tags(
    entryListHandle as any,
    index as number,
    out
  );
  this.handleError(errorCode);

  return out[0]; // null 허용
}

  public entryListFree(options: EntryListFreeOptions): void {
    const { entryListHandle } = serializeArguments(options);

    this.nativeAskar.askar_entry_list_free(entryListHandle);
  }

  //askar_key_entry_list
  public keyEntryListCount(options: KeyEntryListCountOptions): number {
    const { keyEntryListHandle } = serializeArguments(options);
    const ret = allocateInt32Ptr();

    const errorCode = this.nativeAskar.askar_key_entry_list_count(
      keyEntryListHandle,
      ret
    );
    this.handleError(errorCode);

    return readInt32FromBuffer(ret);
  }
  public keyEntryListFree(options: KeyEntryListFreeOptions): void {
    const { keyEntryListHandle } = serializeArguments(options);

    this.nativeAskar.askar_key_entry_list_free(keyEntryListHandle);
  }
  public keyEntryListGetAlgorithm(
    options: KeyEntryListGetAlgorithmOptions
  ): string {
    const { keyEntryListHandle, index } = serializeArguments(options);
    const out: [string | null] = [null]; // Koffi가 채워줌

    const errorCode = this.nativeAskar.askar_key_entry_list_get_algorithm(
      keyEntryListHandle as any,
      index as number,
      out
    );
    this.handleError(errorCode);

    return out[0] ?? "";
  }
  public keyEntryListGetName(options: KeyEntryListGetNameOptions): string {
    const { keyEntryListHandle, index } = serializeArguments(options);
    const out: [string | null] = [null]; // Koffi가 채워줌

    const errorCode = this.nativeAskar.askar_key_entry_list_get_name(
      keyEntryListHandle as any,
      index as number,
      out
    );
    this.handleError(errorCode);

    return out[0] ?? "";
  }
  public keyEntryListGetMetadata(
    options: KeyEntryListGetMetadataOptions
  ): string | null {
    const { keyEntryListHandle, index } = serializeArguments(options);
    const out: [string | null] = [null]; // Koffi가 채워줌

    const errorCode = this.nativeAskar.askar_key_entry_list_get_metadata(
      keyEntryListHandle as any,
      index as number,
      out
    );
    this.handleError(errorCode);

    return out[0]; // null 허용
  }
  public keyEntryListGetTags(
    options: KeyEntryListGetTagsOptions
  ): string | null {
    const { keyEntryListHandle, index } = serializeArguments(options);
    const out: [string | null] = [null]; // Koffi가 채워줌

    const errorCode = this.nativeAskar.askar_key_entry_list_get_tags(
      keyEntryListHandle as any,
      index as number,
      out
    );
    this.handleError(errorCode);

    return out[0]; // null 허용
  }
  public keyEntryListLoadLocal(
    options: KeyEntryListLoadLocalOptions
  ): LocalKeyHandle {
    const { index, keyEntryListHandle } = serializeArguments(options);
    const ret = allocatePointer();

    const errorCode = this.nativeAskar.askar_key_entry_list_load_local(
      keyEntryListHandle as any,
      index as number,
      ret
    );
    this.handleError(errorCode);

    const handle = readPointerValue<any>(ret, FFI_LOCAL_KEY_HANDLE);
    const localKeyHandle = LocalKeyHandle.fromHandle(handle);

    if (!localKeyHandle) {
      throw AskarError.customError({
        message: "Failed to load local key: null handle returned",
      });
    }

    return localKeyHandle;
  }

  //store.rs
  public storeGenerateRawKey(options: StoreGenerateRawKeyOptions): string {
    const logp = "[storeGenerateRawKey]";
    console.log(`${logp} ▶ start`);
  
    // 1) 입력 → ByteBuffer
    const seedBuf = Buffer.from(options.seed ?? new Uint8Array(0));
    const seedStruct = uint8arrayToByteBufferStruct(seedBuf);
    
  
    // 2) out 파라미터 준비 (string*)
    const out: [string | null] = [null];
    console.log(`${logp} out init ->`, out);
  
    // 3) 호출
    const rc = this.nativeAskar.askar_store_generate_raw_key(seedStruct, out);
    
    this.handleError(rc);
  
    // 4) 결과 읽기
    const generatedKey = out[0];
    console.log(`${logp} generatedKey=`, generatedKey);
  
    if (!generatedKey) {
      throw new Error(`${logp} generatedKey is null or empty`);
    }
  
    return generatedKey;
  }

  public async storeOpen(options: StoreOpenOptions): Promise<StoreHandle> {
    console.log("[storeOpen] Starting with options:", options);
    const { profile, keyMethod, passKey, specUri } =
      serializeArguments(options);

    const handle = await this.promisifyWithResponse<number>(
      (cb, cbId) =>
        this.nativeAskar.askar_store_open(
          specUri,
          keyMethod,
          passKey,
          profile,
          cb,
          cbId
        ),
"size_t"
    );

    return StoreHandle.fromHandle(handle);
  }
  public async storeRemove(options: StoreRemoveOptions): Promise<number> {
  const { specUri } = serializeArguments(options);

  const response = await this.promisifyWithResponse<number>(
    (cb, cbId) => {
      const cbPtr = koffi.as(cb, "void *");
      console.log("[storeRemove] cbPtr:", cbPtr, "cbId:", cbId);

      return this.nativeAskar.askar_store_remove(
        specUri,
        cbPtr,
        cbId
      );
    },
    "int8_t",
  );
  return handleInvalidNullResponse(response);
}


  public async storeCreateProfile(
    options: StoreCreateProfileOptions
  ): Promise<string> {
    const { storeHandle, profile } = serializeArguments(options);
    const response = await this.promisifyWithResponse<string>(
      (cb, cbId) =>
        this.nativeAskar.askar_store_create_profile(
          storeHandle as any,
          profile as string,
          cb,
          cbId
        ),
"char *"
    );

    return handleInvalidNullResponse(response);
  }
  public async storeGetProfileName(
    options: StoreGetProfileNameOptions
  ): Promise<string> {
    const { storeHandle } = serializeArguments(options);
    const response = await this.promisifyWithResponse<string>((cb, cbId) =>
      this.nativeAskar.askar_store_get_profile_name(
        storeHandle as any,
        cb,
        cbId
      ),
"char *"
    );

    return handleInvalidNullResponse(response);
  }
  public async storeListProfiles(
    options: StoreListProfilesOptions
  ): Promise<string[]> {
    const { storeHandle } = serializeArguments(options);
    const listHandle = await this.promisifyWithResponse<Buffer>(
      (cb, cbId) =>
        this.nativeAskar.askar_store_list_profiles(
          storeHandle as any,
          cb,
          cbId
        ),
"void *"
    );
    if (listHandle === null) {
      throw AskarError.customError({ message: "Invalid handle" });
    }
    const listCountPtr = allocateInt32Ptr();
    const errorCode = this.nativeAskar.askar_string_list_count(
      listHandle,
      listCountPtr
    );
    this.handleError(errorCode);
    const count = readInt32FromBuffer(listCountPtr);

    const ret: string[] = [];
    for (let i = 0; i < count; i++) {
      const out: [string | null] = [null]; // Koffi가 채워줌
      const errorCode = this.nativeAskar.askar_string_list_get_item(
        listHandle,
        i,
        out
      );
      this.handleError(errorCode);
      ret.push(out[0] ?? "");
    }
    this.nativeAskar.askar_string_list_free(listHandle);
    return ret;
  }
  public async storeRemoveProfile(
    options: StoreRemoveProfileOptions
  ): Promise<number> {
    const { storeHandle, profile } = serializeArguments(options);

    const response = await this.promisifyWithResponse<number>(
      (cb, cbId) =>
        this.nativeAskar.askar_store_remove_profile(
          storeHandle as any,
          profile as string,
          cb,
          cbId
        ),
"int8_t"
    );

    return handleInvalidNullResponse(response);
  }
  public async storeGetDefaultProfile(
    options: StoreGetDefaultProfileOptions
  ): Promise<string> {
    const { storeHandle } = serializeArguments(options);
    const response = await this.promisifyWithResponse<string>((cb, cbId) =>
      this.nativeAskar.askar_store_get_default_profile(
        storeHandle as any,
        cb,
        cbId
      ),
"char*"
    );

    return handleInvalidNullResponse(response);
  }
  public async storeSetDefaultProfile(
    options: StoreSetDefaultProfileOptions
  ): Promise<void> {
    const { storeHandle, profile } = serializeArguments(options);

    return this.promisify((cb, cbId) =>
      this.nativeAskar.askar_store_set_default_profile(
        storeHandle as any,
        profile as string,
        cb,
        cbId
      )
    );
  }
  public async storeRenameProfile(options: StoreRenameProfileOptions): Promise<number> {
    const { storeHandle, fromProfile, toProfile } = serializeArguments(options)

    const response = await this.promisifyWithResponse<number>(
      (cb, cbId) => this.nativeAskar.askar_store_rename_profile(storeHandle, fromProfile, toProfile, cb, cbId),
      "int8_t"
    )

    return handleInvalidNullResponse(response)
    
  }
  public async storeCopyProfile(options: StoreCopyProfileOptions): Promise<number> {
    const { fromHandle, toHandle, fromProfile, toProfile } = serializeArguments(options)
    const response = await this.promisifyWithResponse<number>(
      (cb, cbId) => this.nativeAskar.askar_store_copy_profile(fromHandle, toHandle, fromProfile, toProfile, cb, cbId),
      "int8_t"
    )
      return handleInvalidNullResponse(response)
    
  }
  public async storeRekey(options: StoreRekeyOptions): Promise<void> {
    const { passKey, keyMethod, storeHandle } = serializeArguments(options);

    return this.promisify((cb, cbId) =>
      this.nativeAskar.askar_store_rekey(
        storeHandle as any,
        keyMethod as string,
        passKey as string,
        cb,
        cbId
      )
    );
  }
  public storeCopyTo(options: StoreCopyToOptions): Promise<void> {
    const { storeHandle, targetUri, passKey, keyMethod, recreate } =
      serializeArguments(options);
    
    const rc = this.promisify((cb, cbId) =>
      this.nativeAskar.askar_store_copy(
        storeHandle as any,
        targetUri as string,
        keyMethod as string,
        passKey as string,
        recreate as number,
        cb,
        cbId
      )
    );
    return rc;
  }
  public storeClose(options: StoreCloseOptions): Promise<void> {
  const { storeHandle } = serializeArguments(options);

  return this.promisify((cb, cbId) => {
    
    const cbPtr = koffi.as(cb, "void *");

    const rc = this.nativeAskar.askar_store_close(
      storeHandle as number,
      cbPtr,
      cbId
    );

    return rc;
  });
}

  //askar_scan
  public async scanStart(options: ScanStartOptions): Promise<ScanHandle> {
  const {
    category,
    limit,
    offset,
    profile,
    storeHandle,
    tagFilter,
    orderBy,
    descending,
  } = serializeArguments(options);

  const handle = await this.promisifyWithResponse<number>(
    (cb, cbId) => {

      return this.nativeAskar.askar_scan_start(
        storeHandle as number,                        // uint32_t
        profile ?? null,                              // const char*
        category ?? null,                             // const char*
        tagFilter ? JSON.stringify(tagFilter) : null, // const char*
        Number.isFinite(offset) ? +offset : 0,        // int64_t
        Number.isFinite(limit) ? +limit : -1,         // int64_t
        orderBy ?? null,                              // const char*
        descending ? 1 : 0,                           // int8_t
        cb,                                           // void *
        cbId                                          // uint32_t
      );
    },
    "size_t" // ScanHandle (native에서 size_t로 정의됨)
  );

  return ScanHandle.fromHandle(handle);
}

  public async scanNext(
    options: ScanNextOptions
  ): Promise<EntryListHandle | null> {
    const { scanHandle } = serializeArguments(options);

    const handle = await this.promisifyWithResponse<Buffer | null>(
      (cb, cbId) =>
        this.nativeAskar.askar_scan_next(scanHandle as any, cb, cbId),
"void *"
    );

    return EntryListHandle.fromHandle(handle);
  }
  public scanFree(options: ScanFreeOptions): void {
    const { scanHandle } = serializeArguments(options);

    const errorCode = this.nativeAskar.askar_scan_free(scanHandle as any);
    this.handleError(errorCode);
  }

  //askar_session
  public async sessionStart(
    options: SessionStartOptions
  ): Promise<SessionHandle> {
    const { storeHandle, profile, asTransaction } = serializeArguments(options);

    const handle = await this.promisifyWithResponse<number, number>(
      (cb, cbId) =>
        this.nativeAskar.askar_session_start(
          storeHandle as any,
          profile as string,
          asTransaction as number,
          cb,
          cbId
        ),
"size_t"
    );

    return SessionHandle.fromHandle(handle);
  }
  public async sessionCount(options: SessionCountOptions): Promise<number> {
  const { sessionHandle, tagFilter, category } = serializeArguments(options);

  const response = await this.promisifyWithResponse<number, number>(
    (cb, cbId) =>
      this.nativeAskar.askar_session_count(
        sessionHandle as any,
        category ?? null,                 
        tagFilter ? JSON.stringify(tagFilter) : null, 
        cb,
        cbId
      ),
    "int64_t"
  );

  return handleInvalidNullResponse(response);
}

  public async sessionFetch(
    options: SessionFetchOptions
  ): Promise<EntryListHandle | null> {
    const { name, category, sessionHandle, forUpdate } =
      serializeArguments(options);
    const handle = await this.promisifyWithResponse<Uint8Array>(
      (cb, cbId) =>
        this.nativeAskar.askar_session_fetch(
          sessionHandle as any,
          category || "",
          name as string,
          forUpdate as number,
          cb,
          cbId
        ),
"void *"
    );

    return EntryListHandle.fromHandle(handle);
  }
  public async sessionFetchAll(
  options: SessionFetchAllOptions
): Promise<EntryListHandle | null> {
  const {
    forUpdate,
    sessionHandle,
    tagFilter,
    limit,
    category,
    orderBy,
    descending,
  } = serializeArguments(options);


  if (sessionHandle === null || sessionHandle === undefined) {
    throw new Error("sessionHandle is null or undefined in sessionFetchAll");
  }

  const cat = category ?? null;
  const tag = tagFilter ? JSON.stringify(tagFilter) : null;
  const lim = Number.isFinite(limit as number) ? (limit as number) : -1;
  const ord =
    orderBy && String(orderBy).trim().toLowerCase() === "id"
      ? "id"
      : null; // ✅ Rust가 허용하는 값만 전달
  const desc = descending ? 1 : 0;
  const upd = forUpdate ? 1 : 0;


  const handle = await this.promisifyWithResponse<any>(
    (cb, cbId) =>
      this.nativeAskar.askar_session_fetch_all(
        sessionHandle as number,
        cat,
        tag,
        lim,
        ord,
        desc,
        upd,
        cb,
        cbId
      ),
    "void *"
  );

  return EntryListHandle.fromHandle(handle);
}



  public async sessionRemoveAll(
  options: SessionRemoveAllOptions
): Promise<number> {
  const { sessionHandle, tagFilter, category } = serializeArguments(options);

  const response = await this.promisifyWithResponse<number>(
    (cb, cbId) => {
      console.log("[sessionRemoveAll] Calling native remove_all with args:", {
        sessionHandle,
        category,
        tagFilter,
        cb,
        cbId,
      });

      return this.nativeAskar.askar_session_remove_all(
        sessionHandle as any,
        category ?? null,                              
        tagFilter ? JSON.stringify(tagFilter) : null, 
        cb,
        cbId
      );
    },
    "int64_t"
  );

  return handleInvalidNullResponse(response);
}

public async sessionInsertKey(
  options: SessionInsertKeyOptions
): Promise<void> {
  let { name, sessionHandle, expiryMs, localKeyHandle, metadata, tags } =
    serializeArguments(options);

  // 🔧 보정
  sessionHandle = Number(sessionHandle);              
  expiryMs = Number.isFinite(expiryMs) ? +expiryMs : -1; 

  return this.promisify((cb, cbId) => {
    const cbPtr = koffi.as(cb, "void *");

    const rc = this.nativeAskar.askar_session_insert_key(
      sessionHandle,                       
      localKeyHandle as any,              
      name ?? null,                        
      metadata ?? null,                
      tags ?? null,                    
      expiryMs,                           
      cbPtr,                         
      cbId as number                   
    );

    return rc;
  });
}

  public async sessionFetchKey(
  options: SessionFetchKeyOptions
): Promise<KeyEntryListHandle | null> {
  const { forUpdate, sessionHandle, name } = serializeArguments(options);

  // 제네릭은 External 포인터를 받으니 any 처리
  const handle = await this.promisifyWithResponse<any>(
    (cb, cbId) =>
      this.nativeAskar.askar_session_fetch_key(
        sessionHandle as any,
        name as string,
        forUpdate ? 1 : 0,
        cb,
        cbId
      ),
    "void *"
  );

  if (!handle) {
    console.warn("[sessionFetchKey] got null handle");
    return null;
  }


  // External 포인터 그대로 래핑
  const keyEntryListHandle = KeyEntryListHandle.fromHandle(handle as any);
  return keyEntryListHandle;
}

  public async sessionFetchAllKeys(
    options: SessionFetchAllKeysOptions
  ): Promise<KeyEntryListHandle | null> {
    const {
      forUpdate,
      limit,
      tagFilter,
      sessionHandle,
      algorithm,
      thumbprint,
    } = serializeArguments(options);

    const handle = await this.promisifyWithResponse<Uint8Array>(
      (cb, cbId) =>
        this.nativeAskar.askar_session_fetch_all_keys(
          sessionHandle as any,
          algorithm,
          thumbprint,
          tagFilter,
          +limit || -1,
          forUpdate as number,
          cb,
          cbId
        ),
"void *"
    );

    return KeyEntryListHandle.fromHandle(handle);
  }
  public async sessionUpdateKey(
    options: SessionUpdateKeyOptions
  ): Promise<void> {
    const { expiryMs, tags, name, sessionHandle, metadata } =
      serializeArguments(options);

    return this.promisify((cb, cbId) =>
      this.nativeAskar.askar_session_update_key(
        sessionHandle as any,
        name as string,
        metadata,
        tags,
        +expiryMs || -1,
        cb,
        cbId
      )
    );
  }
  public async sessionRemoveKey(
    options: SessionRemoveKeyOptions
  ): Promise<void> {
    const { sessionHandle, name } = serializeArguments(options);
    return this.promisify((cb, cbId) =>
      this.nativeAskar.askar_session_remove_key(
        sessionHandle as any,
        name as string,
        cb,
        cbId
      )
    );
  }
  public async sessionClose(options: SessionCloseOptions): Promise<void> {
    const { commit, sessionHandle } = serializeArguments(options);

    return await this.promisify((cb, cbId) =>
      this.nativeAskar.askar_session_close(
        sessionHandle as any,
        commit as number,
        cb,
        cbId
      )
    );
  }
 public async sessionUpdate(options: SessionUpdateOptions & {operation: 0|1|2}): Promise<void> {
  const { sessionHandle, name, category, value, tags, expiryMs, operation } =
    serializeArguments(options);

  return this.promisify((cb, cbId) => {
    console.log("[sessionUpdate] Calling native update with args:", {
      sessionHandle,
      operation,
      category,
      name,
      value,
      tags,
      expiryMs,
      cb,
      cbId,
    });

    // ✅ cb를 void * 로 캐스팅
    const cbPtr = koffi.as(cb, "void *");
    let valueBuf: any = { data: null, len: 0 };
    if (operation === 0 || operation === 1) {
      if (!value) {
        console.warn("[sessionUpdate] Insert/Replace without value, sending empty buffer");
      }
      valueBuf = value ?? { data: null, len: 0 };
    }

    // tags 처리
    const tagsStr = (operation === 0 || operation === 1) ? (tags ?? null) : null;

    const rc = this.nativeAskar.askar_session_update(
      sessionHandle as any,
      operation,
      category ?? null,
      name ?? null,
      valueBuf,
      tagsStr,
      +expiryMs || -1,
      cbPtr,
      cbId
    );

    console.log("[sessionUpdate] rc returned immediately:", rc);
    return rc;
  });
}

  //migration.rs
  public async migrateIndySdk(options: MigrateIndySdkOptions): Promise<void> {
    const { specUri, kdfLevel, walletKey, walletName } =
      serializeArguments(options);
    await this.promisify((cb, cbId) =>
      this.nativeAskar.askar_migrate_indy_sdk(
        specUri,
        walletName,
        walletKey,
        kdfLevel,
        cb,
        cbId
      )
    );
  }

  // Promise 기반 콜백 처리를 위한 헬퍼 메서드들
  private pending = new Map<number, { resolve: Function; reject: Function }>();
  private nextId = 1;
  private allocId = () => this.nextId++;

  private makeCbHandle<T extends any[]>(
    proto: any,
    handler: (...args: T) => void
  ) {
    // Koffi 2.14.1에서는 그냥 JS 함수를 넘겨도 되지만,
    // 명시적 proto로 넘기면 안전합니다.
    const fn = ((...args: any[]) => handler(...(args as T))) as any;
    (fn as any).koffi_prototype = proto;
    return fn;
  }

  
  
  
}
