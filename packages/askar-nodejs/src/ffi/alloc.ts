// alloc.ts (Koffi memory allocation helpers)
import koffi from 'koffi'
import {
  FFI_INT8,
  FFI_INT32,
  FFI_STRING,
  FFI_POINTER,
  FFI_STRING_PTR,
  FFI_INT32_PTR
} from './primitives'
import {
  AeadParamsStruct,
  EncryptedBufferStruct,
  SecretBufferStruct,
  ByteBufferStruct,
} from './structures'

// ---- Use koffi.alloc for all allocations ----
function allocSizeof(type: any) {
  return koffi.alloc(type, 1)
}

// Allocate memory for pointer types (void**, const char**)
export const allocatePointer    = () => koffi.alloc(FFI_POINTER, 1)
export const allocateStringPtr = () => {
  return koffi.alloc(FFI_STRING, 1)
}

// Allocate memory for primitive output types
export const allocateInt32Ptr = () =>{
  return koffi.alloc(FFI_INT32, 1)
}
export const allocateInt8Ptr    = () => koffi.alloc(FFI_INT8, 1)

// Allocate memory for struct output types
export const allocateSecretBuffer = () => koffi.alloc(SecretBufferStruct, 1)
export const allocateEncryptedBuffer = () => koffi.alloc(EncryptedBufferStruct, 1)
export const allocateAeadParams      = () => koffi.alloc(AeadParamsStruct, 1)
export const allocateByteBuffer      = () => koffi.alloc(ByteBufferStruct, 1)

// Handle-specific allocators (all void* opaque pointers)
export const allocateLocalKeyHandle     = () => allocatePointer()
export const allocateEntryListHandle    = () => allocatePointer()
export const allocateKeyEntryListHandle = () => allocatePointer()
export const allocateStringListHandle   = () => allocatePointer()

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
