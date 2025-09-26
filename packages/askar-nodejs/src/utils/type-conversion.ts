/**
 * 다양한 타입을 Uint8Array로 변환하는 유틸리티 함수들
 */

/**
 * 다양한 타입의 데이터를 Uint8Array로 변환
 * @param data 변환할 데이터 (Uint8Array, Buffer, Array, string 등)
 * @returns Uint8Array
 */
export function toUint8Array(data: any): Uint8Array {
  if (data == null) {
    return new Uint8Array(0) // null 또는 undefined의 경우 빈 배열 반환
  } else if (data instanceof Uint8Array) {
    return data
  } else if (Buffer.isBuffer(data)) {
    return new Uint8Array(data)
  } else if (Array.isArray(data)) {
    return new Uint8Array(data)
  } else if (typeof data === 'string') {
    return new Uint8Array(Buffer.from(data, 'utf8'))
  } else {
    throw new Error(`Cannot convert ${typeof data} to Uint8Array`)
  }
}

/**
 * 메시지 데이터를 Uint8Array로 변환 (디버그 로깅 포함)
 * @param message 변환할 메시지 데이터
 * @param context 로깅을 위한 컨텍스트 정보
 * @returns Uint8Array
 */
export function convertMessageToUint8Array(message: any, context?: string): Uint8Array {
  if (context) {
    console.log(`${context} debug:`, {
      message: message,
      messageType: typeof message,
      messageConstructor: (message as any)?.constructor?.name,
      messageLength: (message as any)?.length
    })
  }
  
  const messageBuffer = toUint8Array(message)
  
  if (context) {
    console.log(`messageBuffer after conversion:`, {
      type: typeof messageBuffer,
      constructor: messageBuffer.constructor.name,
      length: messageBuffer.length,
      first10Bytes: Array.from(messageBuffer.slice(0, 10))
    })
  }
  
  return messageBuffer
}

/**
 * 여러 데이터를 Uint8Array로 변환
 * @param data 변환할 데이터들의 객체
 * @returns 변환된 Uint8Array들의 객체
 */
export function convertMultipleToUint8Array<T extends Record<string, any>>(
  data: T
): { [K in keyof T]: Uint8Array } {
  const result = {} as { [K in keyof T]: Uint8Array }
  
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      result[key as keyof T] = toUint8Array(value)
    }
  }
  
  return result
}

/**
 * ByteBuffer 구조체를 위한 Uint8Array 변환 (null/undefined 처리 포함)
 * @param data 변환할 데이터
 * @param fieldName 필드명 (에러 메시지용)
 * @returns Uint8Array 또는 null
 */
export function convertToUint8ArrayOrNull(data: any, fieldName: string): Uint8Array | null {
  if (data === null || data === undefined) {
    return null
  }
  
  try {
    return toUint8Array(data)
  } catch (error) {
    throw new Error(`Invalid ${fieldName} type: ${typeof data}. Expected Uint8Array, Buffer, Array, or string`)
  }
}
