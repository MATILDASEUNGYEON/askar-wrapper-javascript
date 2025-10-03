import koffi from 'koffi'

import { FFI_INT32, FFI_INT64, FFI_UINT8} from './primitives'

//ByteBufferStruct
export const ByteBufferStruct = koffi.struct('ByteBuffer',{
  len: FFI_INT64,
  data: koffi.pointer(FFI_UINT8),
})

export const ByteBufferStructPtr = koffi.pointer(ByteBufferStruct)

export const SecretBufferStruct = koffi.struct('SecretBuffer',{
  len: FFI_INT64,
  data: koffi.pointer(FFI_UINT8),
})

export const SecretBufferStructPtr = koffi.pointer(SecretBufferStruct)

export const EncryptedBufferStruct = koffi.struct('EncryptedBuffer',{
  secretBuffer: SecretBufferStruct,
  tagPos: FFI_INT64,
  noncePos: FFI_INT64,
})

export const EncryptedBufferStructPtr = koffi.pointer(EncryptedBufferStruct)

export const AeadParamsStruct = koffi.struct('AeadParams',{
  nonceLength: FFI_INT32,
  tagLength: FFI_INT32,
})

export const AeadParamsStructPtr = koffi.pointer(AeadParamsStruct)

export type EncryptedBufferType = { secretBuffer: SecretBufferType; tagPos: number; noncePos: number}
export type ByteBufferType = { data: Buffer; len: number}
export type SecretBufferType = ByteBufferType