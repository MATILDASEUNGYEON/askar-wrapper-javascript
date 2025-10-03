import koffi from "koffi";
import { allocateCallbackBuffer } from "./alloc";
import {
  FFI_CALLBACK_ID,
  FFI_ERROR_CODE,
  FFI_INT32,
  FFI_STRING,
  FFI_VOID,
  FFI_STORE_HANDLE,
  FFI_INT8,
  FFI_INT64
} from "./primitives";

export const StoreProvisionCallback = koffi.proto(
  'StoreProvisionCallback',
  'void',
  ['int64', 'int32', 'size_t']
);
export const StoreProvisionCallbackPtr = koffi.pointer(StoreProvisionCallback);

// export const StoreProvisionCallback = koffi.proto(
//   "void (int64, int32, size_t)"
// );

const callbackRegistry = new Map<number, any>();
let nextId = 1;

export function storehandle_toVoidPointerCallback(
  cb: (id: number, errorCode: number, handle: number) => void
) {
  const registered = koffi.register(cb, koffi.pointer(StoreProvisionCallback));

  const id = nextId++;
  callbackRegistry.set(id, registered);

  return { callback: registered, id };
}

export function storehandle_deallocateCallbackBuffer(id: number) {
  const cb = callbackRegistry.get(id);
  if (cb) {
    koffi.unregister(cb);
    callbackRegistry.delete(id);
  }
}
// Generate unique type names to avoid conflicts
let typeCounter = 0;
const generateUniqueTypeName = (baseName: string): string => {
  return `${baseName}_${Date.now()}_${++typeCounter}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;
};

export type NativeCallback = (id: number, errorCode: number) => void;
export const toNativeCallback = (cb: NativeCallback) => {
  const typeName = generateUniqueTypeName("NativeCallback");
  const NativeCallbackType = koffi.proto(typeName, FFI_VOID, [
    FFI_CALLBACK_ID,
    FFI_ERROR_CODE,
  ]);
  const NativeCallbackPtrType = koffi.pointer(NativeCallbackType);

  const nativeCallback = koffi.register(cb, NativeCallbackPtrType);
  const id = allocateCallbackBuffer(nativeCallback);
  return { nativeCallback, id };
};
export const Cb_StoreHandleStr = "Cb_StoreHandle";

export const Cb_StoreHandle = koffi.proto(
  "void (int64_t cb_id, int32_t err, uint32_t handle)"
);

// Store provision callback: (cb_id: CallbackId, err: ErrorCode, handle: StoreHandle)
export type NativeStoreProvisionCallback = (
  id: number,
  errorCode: number,
  handle: number
) => void;

// Define OptionCallback type using koffi.proto
// export const OptionCallback = koffi.proto(
//   "void OptionCallback('void', ['int64', 'int32', 'uint32'])"
// );

export const toNativeStoreProvisionCallback = (cb: NativeStoreProvisionCallback) => {
  // ✅ register에는 "콜백 *포인터 타입"을 넘겨야 함
  const fnptr = koffi.register(cb, koffi.pointer(Cb_StoreHandle));

  // GC 방지용으로 핸들 보관
  const id = allocateCallbackBuffer(fnptr);

  // 네이티브 바인딩이 `void *cb` 를 받는다면 void*로 캐스팅해서 반환
  const voidPtr = koffi.as(fnptr, "void *");

  return { nativeCallback: voidPtr, id };
};

// New function to create void * callback for store provision
// New function to create void * callback for store provision
export const toVoidPointerCallback = (
  cb: (NativeCallbackWithResponse<number>)
) => {
  console.log("typeof cb : ", typeof cb);

  // JS → 네이티브로 전달할 콜백 시그니처 맞춤
  const storeProvisionCallback: NativeStoreProvisionCallback = (
    id,
    errorCode,
    handle
  ) => {
    try {
      console.log("[storeProvisionCallback] invoked", { id, errorCode, handle });

      if (typeof cb === "function") {
        cb(id, errorCode, handle);
      } else {
        console.error("Callback is not a function:", typeof cb, cb);
        throw new Error("Callback is not a function");
      }
    } catch (error) {
      console.error("Callback error in toVoidPointerCallback:", error);
      throw error;
    }
  };

  // JS 콜백을 네이티브 포인터로 등록
  // const registeredCallback = koffi.register(
  //   storeProvisionCallback,
  //   koffi.pointer(OptionCallback)
  // );

  // GC 방지용으로 id 발급
  // const id = allocateCallbackBuffer(registeredCallback);

  // void * 포인터로 캐스팅
  // const voidPtr = koffi.as(registeredCallback, "void *");

  // 👉 테스트용으로 registeredCallback도 함께 반환
  // return { callback: voidPtr, id, registeredCallback };
  
  // 임시 구현
  throw new Error("toVoidPointerCallback not implemented");
};


const Cb_StoreHandlePtr = koffi.pointer(Cb_StoreHandle);

export type NativeCallbackWithResponse<R> = (
  id: number,
  errorCode: number,
  response: R
) => void;
export const toNativeCallbackWithResponse = <R>(
  cb: NativeCallbackWithResponse<R>,
  responseFfiType = FFI_STRING
) => {
  const typeName = generateUniqueTypeName("NativeCallbackWithResponse");
  const NativeCallbackWithResponseType = koffi.proto(typeName, FFI_VOID, [
    FFI_CALLBACK_ID,  // int64_t (cb_id)
    FFI_ERROR_CODE,        // int64_t (error_code) - Rust에서 i64로 정의됨
    responseFfiType,
  ]);
  const NativeCallbackWithResponsePtrType = koffi.pointer(
    NativeCallbackWithResponseType
  );

  // Create a wrapper function to ensure the callback is properly maintained
  const wrappedCallback = (id: number, errorCode: number, response: R) => {
    try {
      cb(id, errorCode, response);
    } catch (error) {
      console.error("Callback error:", error);
      throw error;
    }
  };

  const nativeCallback = koffi.register(
    wrappedCallback as any,
    NativeCallbackWithResponsePtrType
  );
  const id = allocateCallbackBuffer(nativeCallback);
  return { nativeCallback, id };
};


export type NativeLogCallback = (
  context: unknown,
  level: number,
  target: string,
  message: string,
  modulePath: string,
  file: string,
  line: number
) => void;
export const toNativeLogCallback = (cb: NativeLogCallback) => {
  const typeName = generateUniqueTypeName("NativeLogCallback");
  const NativeLogCallbackType = koffi.proto(typeName, FFI_VOID, [
    koffi.pointer(FFI_VOID), // context: void*
    FFI_INT32, // level
    FFI_STRING, // target
    FFI_STRING, // message
    FFI_STRING, // modulePath
    FFI_STRING, // file
    FFI_INT32, // line
  ]);
  const NativeLogCallbackPtrType = koffi.pointer(NativeLogCallbackType);

  const nativeCallback = koffi.register(cb as any, NativeLogCallbackPtrType);
  const id = allocateCallbackBuffer(nativeCallback);
  return { nativeCallback, id };
};

// Custom logger callback types for askar_set_custom_logger
export const EnabledCallback = koffi.proto("int8 (const void*, int32)");
export const LogCallback = koffi.proto(
  "void (const void*, int32, const char*, const char*, const char*, const char*, int32)"
);
export const FlushCallback = koffi.proto("void (const void*)");

// Migration callback for askar_migrate_indy_sdk
// This uses the same signature as NativeCallback: (cb_id: CallbackId, err: ErrorCode)
export const toNativeMigrationCallback = (cb: NativeCallback) => {
  // Use the existing toNativeCallback function since the signature is identical
  return toNativeCallback(cb);
};

// Store remove callback: (cb_id: CallbackId, err: ErrorCode, removed: i8)
export type NativeStoreRemoveCallback = (
  id: number,
  errorCode: number,
  removed: number
) => void;
export const toNativeStoreRemoveCallback = (cb: NativeStoreRemoveCallback) => {
  const typeName = generateUniqueTypeName("NativeStoreRemoveCallback");
  const NativeStoreRemoveCallbackType = koffi.proto(typeName, FFI_VOID, [
    FFI_CALLBACK_ID,
    FFI_ERROR_CODE,
    FFI_INT8, // removed: i8
  ]);
  const NativeStoreRemoveCallbackPtrType = koffi.pointer(
    NativeStoreRemoveCallbackType
  );

  const nativeCallback = koffi.register(cb, NativeStoreRemoveCallbackPtrType);
  const id = allocateCallbackBuffer(nativeCallback);
  return { nativeCallback, id };
};

// Generic callback converter for different signatures
// This provides a more scalable approach for future callback types
export const createNativeCallback = <T extends any[]>(
  cb: (id: number, errorCode: number, ...args: T) => void,
  ffiTypes: any[]
) => {
  const typeName = generateUniqueTypeName("GenericCallback");
  console.log('typeName in createNativeCallback', typeName);
  const GenericCallbackType = koffi.proto(typeName, FFI_VOID, [
    FFI_CALLBACK_ID,
    FFI_ERROR_CODE,
    ...ffiTypes,
  ]);
  const GenericCallbackPtrType = koffi.pointer(GenericCallbackType);

  const nativeCallback = koffi.register(cb as any, GenericCallbackPtrType);
  const id = allocateCallbackBuffer(nativeCallback);
  return { nativeCallback, id };
};

// Predefined callback types for common patterns
export const createStringResponseCallback = (
  cb: (id: number, errorCode: number, result: string) => void
) => {
  return createNativeCallback(cb, [FFI_STRING]);
};

export const createInt8ResponseCallback = (
  cb: (id: number, errorCode: number, result: number) => void
) => {
  return createNativeCallback(cb, [FFI_INT8]);
};

export const createHandleResponseCallback = (
  cb: (id: number, errorCode: number, handle: number) => void
) => {
  return createNativeCallback(cb, [FFI_STORE_HANDLE]);
};


export const Cb_Void = koffi.proto("void (int64_t cb_id, uint64_t err)");
export const Cb_Int8 = koffi.proto(
  "void (int64_t cb_id, uint64_t err, int8_t v)"
);
export const Cb_Int64 = koffi.proto(
  "void (int64_t cb_id, uint64_t err, int64_t v)"
);
export const Cb_Str = koffi.proto(
  "void (int64_t cb_id, uint64_t err, const char *s)"
);
export const Cb_ListHandle = koffi.proto(
  "void (int64_t cb_id, uint64_t err, uint32_t h)"
);


// String response callback converter
export const toNativeStringCallback = (
  cb: (id: number, errorCode: number, result: string) => void
) => {
  const nativeCallback = koffi.register(cb, Cb_Str);
  const id = allocateCallbackBuffer(nativeCallback);
  return { nativeCallback, id };
};

// Int8 response callback converter
export const toNativeInt8Callback = (
  cb: (id: number, errorCode: number, result: number) => void
) => {
  const nativeCallback = koffi.register(cb, Cb_Int8);
  const id = allocateCallbackBuffer(nativeCallback);
  return { nativeCallback, id };
};

// Int64 response callback converter
export const toNativeInt64Callback = (
  cb: (id: number, errorCode: number, result: number) => void
) => {
  const nativeCallback = koffi.register(cb, Cb_Int64);
  const id = allocateCallbackBuffer(nativeCallback);
  return { nativeCallback, id };
};

// Void callback converter (no response)
export const toNativeVoidCallback = (
  cb: (id: number, errorCode: number) => void
) => {
  const nativeCallback = koffi.register(cb, Cb_Void);
  const id = allocateCallbackBuffer(nativeCallback);
  return { nativeCallback, id };
};

// List handle callback converter
export const toNativeListHandleCallback = (
  cb: (id: number, errorCode: number, handle: number) => void
) => {
  const nativeCallback = koffi.register(cb, Cb_ListHandle);
  const id = allocateCallbackBuffer(nativeCallback);
  return { nativeCallback, id };
};
