// conversion.ts (Koffi)
import koffi from 'koffi'
import { EncryptedBuffer } from '@openwallet-foundation/askar-shared'
import type { ByteBufferType, EncryptedBufferType } from './structures'
import { ByteBufferStruct } from './structures'

// JS 객체 -> Koffi 구조체 (ByteBuffer)
export const byteBufferClassToStruct = ({ len, data }: ByteBufferType) => {
  const buf = Buffer.isBuffer(data) ? data : Buffer.from(data)
  // Koffi에서는 일반 객체를 반환하면 자동으로 구조체로 변환됩니다
  // len은 number나 bigint 모두 처리 가능하도록 합니다
  return {
    len: typeof len === 'bigint' ? len : BigInt(len),
    data: buf
  }
}

export const secretBufferClassToStruct = byteBufferClassToStruct

// Buffer/Uint8Array -> ByteBuffer 구조체
export function uint8arrayToByteBufferStruct(input: Buffer | Uint8Array): ByteBufferType {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input)
  return { len: buf.length, data: buf }
}

export function uint8arrayToByteBufferI64(u8: Uint8Array|Buffer) {
  const buf = Buffer.isBuffer(u8) ? u8 : Buffer.from(u8)
  const BI = (globalThis as any).BigInt
  const toI64 = (n:number)=> (typeof BI==='function'? BI(n) : (n as unknown as bigint))
  return { data: buf, len: toI64(buf.length) }
}
export function emptyByteBufferI64() {
  const BI = (globalThis as any).BigInt
  const toI64 = (n:number)=> (typeof BI==='function'? BI(n) : (n as unknown as bigint))
  return { data: Buffer.alloc(0), len: toI64(0) }
}
export function toByteBuffer(
  v?: Uint8Array | Buffer | null
): { len: number; data: Buffer } {
  if (!v || v.length === 0) {
    return { len: 0, data: Buffer.alloc(0) }; // ★ null 대신 빈 버퍼
  }
  const b = Buffer.isBuffer(v) ? v : Buffer.from(v);
  return { len: b.length, data: b };
}
// Koffi ByteBuffer -> Node Buffer
// (해제 전에 안전하게 사본을 만들어 둡니다)
export const byteBufferToBuffer = ({ data, len }: ByteBufferType): Buffer => {
  // len이 BigInt일 수 있으므로 Number로 변환
  const length = typeof len === 'bigint' ? Number(len) : len
  
  // Koffi에서 Native 포인터를 Buffer로 변환
  if (typeof data === 'object' && data !== null && !Buffer.isBuffer(data)) {
    // Koffi 포인터를 Buffer로 변환
    try {
      const koffi = require('koffi')
      // koffi.decode()를 사용하여 포인터에서 데이터 읽기
      const arrayType = koffi.array('uint8', length)
      const uint8Array = koffi.decode(data, arrayType)
      return Buffer.from(uint8Array)
    } catch (error) {
      console.error('Error converting koffi pointer to buffer:', error)
      throw error
    }
  }
  
  const b = Buffer.isBuffer(data) ? data : Buffer.from(data)
  return Buffer.from(b.subarray(0, length))
}

export const secretBufferToBuffer = byteBufferToBuffer

// EncryptedBuffer 구조체 -> EncryptedBuffer 클래스
export const encryptedBufferStructToClass = ({ secretBuffer, tagPos, noncePos }: EncryptedBufferType) => {
  const buffer = byteBufferToBuffer(secretBuffer)
  // tagPos, noncePos가 BigInt일 수 있으므로 Number로 변환
  const tagPosition = typeof tagPos === 'bigint' ? Number(tagPos) : tagPos
  const noncePosition = typeof noncePos === 'bigint' ? Number(noncePos) : noncePos
  return new EncryptedBuffer({ tagPos: tagPosition, noncePos: noncePosition, buffer })
}
