import { 
  allocateSecretBuffer, 
  allocateEncryptedBuffer,
  allocateInt8Ptr,
  allocateInt32Ptr,
  secretBufferToBuffer,
  encryptedBufferStructToClass,
  uint8arrayToByteBufferStruct,
  FFI_INT8, 
  FFI_INT32
} from '../ffi'
import { 
  SecretBufferStruct, 
  EncryptedBufferStruct 
} from '../ffi/structures'
import { SecretBufferType, EncryptedBufferType } from '../ffi'
import { EncryptedBuffer } from '@openwallet-foundation/askar-shared'
import { handleReturnPointer } from './koffi-helpers'
import { toUint8Array } from './type-conversion'

/**
 * 버퍼 할당, 처리 및 변환 유틸리티 함수들
 */

/**
 * SecretBuffer를 할당하고 결과를 Uint8Array로 변환
 * @param nativeAskar native askar 인스턴스
 * @param nativeFunction 호출할 native 함수
 * @param params native 함수에 전달할 파라미터들
 * @param handleError 에러 처리 함수
 * @returns Uint8Array 결과
 */
export function processSecretBufferResult(
  nativeAskar: any,
  nativeFunction: string,
  params: any[],
  handleError: (errorCode: number) => void
): Uint8Array {
  const ret = allocateSecretBuffer()
  
  const errorCode = nativeAskar[nativeFunction](...params, ret as any)
  handleError(errorCode)

  const secretBuffer = handleReturnPointer<SecretBufferType>(ret, SecretBufferStruct)
  return new Uint8Array(secretBufferToBuffer(secretBuffer))
}

/**
 * EncryptedBuffer를 할당하고 결과를 EncryptedBuffer로 변환
 * @param nativeAskar native askar 인스턴스
 * @param nativeFunction 호출할 native 함수
 * @param params native 함수에 전달할 파라미터들
 * @param handleError 에러 처리 함수
 * @returns EncryptedBuffer 결과
 */
export function processEncryptedBufferResult(
  nativeAskar: any,
  nativeFunction: string,
  params: any[],
  handleError: (errorCode: number) => void
): EncryptedBuffer {
  const ret = allocateEncryptedBuffer()
  
  const errorCode = nativeAskar[nativeFunction](...params, ret as any)
  handleError(errorCode)

  const encryptedBuffer = handleReturnPointer<EncryptedBufferType>(ret, EncryptedBufferStruct)
  return encryptedBufferStructToClass(encryptedBuffer)
}

/**
 * Int8 포인터를 할당하고 결과를 숫자로 변환
 * @param nativeAskar native askar 인스턴스
 * @param nativeFunction 호출할 native 함수
 * @param params native 함수에 전달할 파라미터들
 * @param handleError 에러 처리 함수
 * @returns 숫자 결과
 */
export function processInt8Result(
  nativeAskar: any,
  nativeFunction: string,
  params: any[],
  handleError: (errorCode: number) => void
): number {
  const ret = allocateInt8Ptr()
  
  const errorCode = nativeAskar[nativeFunction](...params, ret)
  handleError(errorCode)

  return handleReturnPointer<number>(ret, FFI_INT8)
}

/**
 * Int32 포인터를 할당하고 결과를 숫자로 변환
 * @param nativeAskar native askar 인스턴스
 * @param nativeFunction 호출할 native 함수
 * @param params native 함수에 전달할 파라미터들
 * @param handleError 에러 처리 함수
 * @returns 숫자 결과
 */
export function processInt32Result(
  nativeAskar: any,
  nativeFunction: string,
  params: any[],
  handleError: (errorCode: number) => void
): number {
  const ret = allocateInt32Ptr()
  
  const errorCode = nativeAskar[nativeFunction](...params, ret)
  handleError(errorCode)

  return handleReturnPointer<number>(ret, FFI_INT32)
}

/**
 * 바이트 버퍼 구조체들을 생성하는 헬퍼
 * @param data 변환할 데이터들
 * @returns ByteBufferStruct들
 */
export function createByteBufferStructs(data: {
  [key: string]: Uint8Array | null | undefined
}): { [key: string]: any } {
  const result: { [key: string]: any } = {}
  
  for (const [key, value] of Object.entries(data)) {
    if (value && value.length > 0) {
      result[key] = uint8arrayToByteBufferStruct(value)
    } else {
      result[key] = { len: BigInt(0), data: Buffer.alloc(0) }
    }
  }
  
  return result
}

/**
 * 옵셔널 바이트 데이터들을 ByteBufferStruct로 변환하는 헬퍼
 * @param data 변환할 데이터들 (null/undefined 허용)
 * @returns ByteBufferStruct들
 */
export function createOptionalByteBufferStructs(data: {
  [key: string]: any
}): { [key: string]: any } {
  const result: { [key: string]: any } = {}
  
  for (const [key, value] of Object.entries(data)) {
    if (value != null) {
      const buffer = toUint8Array(value)
      result[key] = uint8arrayToByteBufferStruct(buffer)
    } else {
      // FFI에서 ByteBuffer는 null이 아닌 빈 구조체를 요구함
      result[key] = uint8arrayToByteBufferStruct(new Uint8Array(0))
    }
  }
  
  return result
}

/**
 * 여러 데이터를 ByteBufferStruct로 변환하는 헬퍼 함수
 * @param dataMap 데이터 맵 (key: 원본 데이터)
 * @returns 변환된 ByteBufferStruct 맵
 */
export function convertToByteBufferStructs(dataMap: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {}
  
  for (const [key, value] of Object.entries(dataMap)) {
    if (value !== undefined && value !== null) {
      const buffer = toUint8Array(value)
      result[key] = uint8arrayToByteBufferStruct(buffer)
    } else {
      result[key] = { len: BigInt(0), data: Buffer.alloc(0) }
    }
  }
  
  return result
}
