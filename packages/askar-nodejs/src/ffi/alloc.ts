// alloc.ts (Koffi memory allocation helpers)
import koffi from 'koffi'
import {
  FFI_INT8,
  FFI_INT32,
  FFI_POINTER,
  FFI_STRING_PTR,
} from './primitives'
import {
  AeadParamsStruct,
  EncryptedBufferStruct,
  SecretBufferStruct,
  ByteBufferStruct,
} from './structures'

// ---- Always allocate raw Buffer blocks (no koffi.alloc) ----
function allocSizeof(type: any): Buffer {
  return Buffer.alloc(koffi.sizeof(type))
}

// Allocate memory for pointer types (void**, const char**)
export const allocatePointer    = (): Buffer => allocSizeof(FFI_POINTER)
export const allocateStringPtr  = (): Buffer => allocSizeof(FFI_STRING_PTR) // const char**

// Allocate memory for primitive output types
export const allocateInt32Ptr   = (): Buffer => allocSizeof(FFI_INT32)      // int32_t*
export const allocateInt8Ptr    = (): Buffer => allocSizeof(FFI_INT8)       // int8_t*

// Allocate memory for struct output types
export const allocateSecretBuffer    = (): Buffer => allocSizeof(SecretBufferStruct)
export const allocateEncryptedBuffer = (): Buffer => allocSizeof(EncryptedBufferStruct)
export const allocateAeadParams      = (): Buffer => allocSizeof(AeadParamsStruct)
export const allocateByteBuffer      = (): Buffer => allocSizeof(ByteBufferStruct)

// Handle-specific allocators (all void* opaque pointers)
export const allocateLocalKeyHandle     = (): Buffer => allocatePointer()
export const allocateEntryListHandle    = (): Buffer => allocatePointer()
export const allocateKeyEntryListHandle = (): Buffer => allocatePointer()
export const allocateStringListHandle   = (): Buffer => allocatePointer()

// ---- Backward compatibility aliases ----
export const allocateStringBuffer = allocateStringPtr
export const allocateInt32Buffer  = allocateInt32Ptr
export const allocateInt8Buffer   = allocateInt8Ptr

// ---- Callback lifecycle management ----
const callbackRegistry = new Map<number, any>()
let callbackId = 1

export const allocateCallbackBuffer = (callback: any): number => {
  const id = callbackId++
  callbackRegistry.set(id, callback)
  return id
}
export const deallocateCallbackBuffer = (id: number): void => {
  callbackRegistry.delete(id)
}
export const getCallback = (id: number): any => {
  return callbackRegistry.get(id)
}
