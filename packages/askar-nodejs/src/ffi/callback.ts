import koffi from 'koffi'
import { allocateCallbackBuffer } from './alloc'
import { FFI_CALLBACK_ID, FFI_ERROR_CODE, FFI_INT32, FFI_STRING, FFI_VOID, FFI_STORE_HANDLE, FFI_INT8 } from './primitives'

// Generate unique type names to avoid conflicts
let typeCounter = 0
const generateUniqueTypeName = (baseName: string): string => {
  return `${baseName}_${Date.now()}_${++typeCounter}_${Math.random().toString(36).substr(2, 9)}`
}

export type NativeCallback = (id: number, errorCode: number) => void
export const toNativeCallback = (cb: NativeCallback) => {
  const typeName = generateUniqueTypeName('NativeCallback')
  const NativeCallbackType = koffi.proto(typeName, FFI_VOID, [FFI_CALLBACK_ID, FFI_ERROR_CODE])
  const NativeCallbackPtrType = koffi.pointer(NativeCallbackType)
  
  const nativeCallback = koffi.register(cb, NativeCallbackPtrType)
  const id = allocateCallbackBuffer(nativeCallback)
  return { nativeCallback, id }
}

// Store provision callback: (cb_id: CallbackId, err: ErrorCode, handle: StoreHandle)
export type NativeStoreProvisionCallback = (id: number, errorCode: number, handle: number) => void

// Define OptionCallback type using koffi.proto
export const OptionCallback = koffi.proto("void OptionCallback(int64_t callbackId, int64_t errorCode, size_t handle)")

export const toNativeStoreProvisionCallback = (cb: NativeStoreProvisionCallback) => {
  // Use koffi.register for registered callbacks
  const nativeCallback = koffi.register(cb, koffi.pointer(OptionCallback))
  const id = allocateCallbackBuffer(nativeCallback)
  
  // Convert OptionCallback to void * for binding
  const voidPtrCallback = koffi.as(nativeCallback, 'void *')
  
  return { nativeCallback: voidPtrCallback, id }
}

// New function to create void * callback for store provision
export const toVoidPointerCallback = (cb: NativeCallbackWithResponse<number>) => {
  // Convert NativeCallbackWithResponse to NativeStoreProvisionCallback with try-catch
  const storeProvisionCallback: NativeStoreProvisionCallback = (id, errorCode, handle) => {
    try {
      // Check if cb is a function before calling it
      if (typeof cb === 'function') {
        cb(id, errorCode, handle)
      } else {
        console.error('Callback is not a function:', typeof cb, cb)
        throw new Error('Callback is not a function')
      }
    } catch (error) {
      console.error('Callback error in toVoidPointerCallback:', error)
      // Re-throw the error to maintain the original behavior
      throw error
    }
  }
  
  // Register the callback with koffi
  const registeredCallback = koffi.register(storeProvisionCallback, koffi.pointer(OptionCallback))
  const id = allocateCallbackBuffer(registeredCallback)
  
  // Convert to void * pointer
  const voidPtr = koffi.as(registeredCallback, 'void *')
  
  return { callback: voidPtr, id }
}

export type NativeCallbackWithResponse<R> = (id: number, errorCode: number, response: R) => void
export const toNativeCallbackWithResponse = <R>(cb: NativeCallbackWithResponse<R>, responseFfiType = FFI_STRING) => {
  const typeName = generateUniqueTypeName('NativeCallbackWithResponse')
  const NativeCallbackWithResponseType = koffi.proto(typeName, FFI_VOID, [
    FFI_CALLBACK_ID, 
    FFI_ERROR_CODE, 
    responseFfiType
  ])
  const NativeCallbackWithResponsePtrType = koffi.pointer(NativeCallbackWithResponseType)
  
  // Create a wrapper function to ensure the callback is properly maintained
  const wrappedCallback = (id: number, errorCode: number, response: R) => {
    try {
      cb(id, errorCode, response)
    } catch (error) {
      console.error('Callback error:', error)
      throw error
    }
  }
  
  const nativeCallback = koffi.register(wrappedCallback as any, NativeCallbackWithResponsePtrType)
  const id = allocateCallbackBuffer(nativeCallback)
  return { nativeCallback, id }
}

export type NativeLogCallback = (
  context: unknown,
  level: number,
  target: string,
  message: string,
  modulePath: string,
  file: string,
  line: number
) => void
export const toNativeLogCallback = (cb: NativeLogCallback) => {
  const typeName = generateUniqueTypeName('NativeLogCallback')
  const NativeLogCallbackType = koffi.proto(typeName, FFI_VOID, [
    koffi.pointer(FFI_VOID), // context: void*
    FFI_INT32,              // level
    FFI_STRING,              // target
    FFI_STRING,              // message
    FFI_STRING,              // modulePath
    FFI_STRING,              // file
    FFI_INT32                // line
  ])
  const NativeLogCallbackPtrType = koffi.pointer(NativeLogCallbackType)
  
  const nativeCallback = koffi.register(cb as any, NativeLogCallbackPtrType)
  const id = allocateCallbackBuffer(nativeCallback)
  return { nativeCallback, id }
}

// Custom logger callback types for askar_set_custom_logger
export const EnabledCallback = koffi.proto('int8 (const void*, int32)')
export const LogCallback = koffi.proto('void (const void*, int32, const char*, const char*, const char*, const char*, int32)')
export const FlushCallback = koffi.proto('void (const void*)')

// Migration callback for askar_migrate_indy_sdk
// This uses the same signature as NativeCallback: (cb_id: CallbackId, err: ErrorCode)
export const toNativeMigrationCallback = (cb: NativeCallback) => {
  // Use the existing toNativeCallback function since the signature is identical
  return toNativeCallback(cb)
}

// Store remove callback: (cb_id: CallbackId, err: ErrorCode, removed: i8)
export type NativeStoreRemoveCallback = (id: number, errorCode: number, removed: number) => void
export const toNativeStoreRemoveCallback = (cb: NativeStoreRemoveCallback) => {
  const typeName = generateUniqueTypeName('NativeStoreRemoveCallback')
  const NativeStoreRemoveCallbackType = koffi.proto(typeName, FFI_VOID, [
    FFI_CALLBACK_ID, 
    FFI_ERROR_CODE, 
    FFI_INT8  // removed: i8
  ])
  const NativeStoreRemoveCallbackPtrType = koffi.pointer(NativeStoreRemoveCallbackType)
  
  const nativeCallback = koffi.register(cb, NativeStoreRemoveCallbackPtrType)
  const id = allocateCallbackBuffer(nativeCallback)
  return { nativeCallback, id }
}

// Generic callback converter for different signatures
// This provides a more scalable approach for future callback types
export const createNativeCallback = <T extends any[]>(
  cb: (id: number, errorCode: number, ...args: T) => void,
  ffiTypes: any[]
) => {
  const typeName = generateUniqueTypeName('GenericCallback')
  const GenericCallbackType = koffi.proto(typeName, FFI_VOID, [
    FFI_CALLBACK_ID,
    FFI_ERROR_CODE,
    ...ffiTypes
  ])
  const GenericCallbackPtrType = koffi.pointer(GenericCallbackType)
  
  const nativeCallback = koffi.register(cb as any, GenericCallbackPtrType)
  const id = allocateCallbackBuffer(nativeCallback)
  return { nativeCallback, id }
}

// Predefined callback types for common patterns
export const createStringResponseCallback = (cb: (id: number, errorCode: number, result: string) => void) => {
  return createNativeCallback(cb, [FFI_STRING])
}

export const createInt8ResponseCallback = (cb: (id: number, errorCode: number, result: number) => void) => {
  return createNativeCallback(cb, [FFI_INT8])
}

export const createHandleResponseCallback = (cb: (id: number, errorCode: number, handle: number) => void) => {
  return createNativeCallback(cb, [FFI_STORE_HANDLE])
}
