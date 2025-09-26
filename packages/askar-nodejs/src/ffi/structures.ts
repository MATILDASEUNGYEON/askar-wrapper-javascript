// structures.ts (Koffi)
import koffi from 'koffi'
import {
  FFI_UINT8,
  FFI_INT32,
  FFI_INT64,
} from './primitives'

// ===== ByteBuffer =====
// ref-napi에선 CArray(FFI_UINT8) + pointer 였지만,
// Koffi에선 가변 길이 바이트 버퍼는 uint8_t* 포인터면 충분합니다.
export const ByteBufferArrayPtr = koffi.pointer(FFI_UINT8) // uint8_t*

export const ByteBufferStruct = koffi.struct('ByteBuffer',{
  len : FFI_INT64,            // int64_t
  data : ByteBufferArrayPtr
})

export const ByteBufferStructPtr = koffi.pointer(ByteBufferStruct)

// SecretBuffer는 ByteBuffer와 동일 레이아웃
// export const SecretBufferStruct     = ByteBufferStruct
export const SecretBufferStruct = koffi.struct('SecretBuffer',{
  len: FFI_INT64,            // int64_t
  data: ByteBufferArrayPtr
})
export const SecretBufferStructPtr  = ByteBufferStructPtr

// ===== EncryptedBuffer =====
// Rust/Askar FFI에서 암호문 버퍼(SecretBuffer)와 tag/nonce 위치를 함께 반환
export const EncryptedBufferStruct = koffi.struct('EncryptedBuffer', {
  secretBuffer: SecretBufferStruct, // ByteBuffer
  tagPos: FFI_INT64,                // int64_t
  noncePos: FFI_INT64,              // int64_t
})

export const EncryptedBufferStructPtr = koffi.pointer(EncryptedBufferStruct)

// ===== AEAD Params =====
export const AeadParamsStruct = koffi.struct('AeadParams', {
  nonceLength: FFI_INT32,  // int32_t
  tagLength: FFI_INT32,    // int32_t
})

export const AeadParamsStructPtr = koffi.pointer(AeadParamsStruct)

// ===== TypeScript helper types (JS 계층에서 다룰 때 참고)
export type ByteBufferType = { data: Buffer; len: number | bigint }
export type SecretBufferType = ByteBufferType
export type EncryptedBufferType = {
  secretBuffer: SecretBufferType
  tagPos: number | bigint
  noncePos: number | bigint
}

// (선택) ref-napi와의 호환을 위해 이름만 유지하고 싶은 경우:
// export const ByteBufferArray = FFI_UINT8; // 사용처가 포인터만 요구한다면 생략 가능
