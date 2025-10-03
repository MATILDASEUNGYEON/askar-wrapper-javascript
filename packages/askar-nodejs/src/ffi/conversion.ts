import koffi from 'koffi'
import { EncryptedBuffer } from '@openwallet-foundation/askar-shared'
import type { ByteBufferType, EncryptedBufferType } from './structures'
import { ByteBufferStruct } from './structures'

export const byteBufferClassToStruct = ({ len, data }: ByteBufferType) => {
  return {
    len,
    data,
  }
}

export const secretBufferClassToStruct = byteBufferClassToStruct

export const uint8arrayToByteBufferStruct = (
  buf?: Uint8Array | Buffer | { len: number; data: Buffer | null } | null
) => {
  if (!buf) {
    // ✅ Rust에서 len=0, data=NULL 로 인식
    return { len: 0, data: null }
  }

  // ✅ 이미 { len, data } 형태라면 그대로 리턴
  if (typeof buf === "object" && "len" in buf && "data" in buf) {
    return buf as { len: number; data: Buffer | null }
  }

  if (Buffer.isBuffer(buf)) {
    return { len: buf.length, data: buf }
  }

  if (buf instanceof Uint8Array) {
    return { len: buf.length, data: Buffer.from(buf) }
  }

  throw new TypeError(
    `uint8arrayToByteBufferStruct expected Uint8Array | Buffer | {len,data}, got ${typeof buf}`
  )
}



export const byteBufferToBuffer=({data,len}:ByteBufferType)=>{
  const dataAsArray = koffi.decode(data, 'uint8', len)
  return Buffer.from(dataAsArray)
}

export const secretBufferToBuffer = byteBufferToBuffer

export const encryptedBufferStructToClass = ({ secretBuffer, tagPos, noncePos }: EncryptedBufferType) => {
  const buffer = Uint8Array.from(secretBufferToBuffer(secretBuffer))

  return new EncryptedBuffer({ tagPos, noncePos, buffer })
}
