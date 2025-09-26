import { ArcHandle, Jwk, Key, LocalKeyHandle, ScanHandle, SessionHandle, StoreHandle } from '@openwallet-foundation/askar-shared'
import { uint8arrayToByteBufferStruct } from './conversion'
import type { ByteBufferType, SecretBufferType } from './structures'
// 콜백 타입
export type Callback = (err: number) => void
export type CallbackWithResponse = (err: number, response: string) => void

type Argument =
  | Record<string, unknown>
  | ArcHandle
  | StoreHandle
  | SessionHandle
  | ScanHandle
  | LocalKeyHandle
  | unknown[]
  | Date
  | Uint8Array
  | SerializedArgument
  | boolean
  | Jwk
  | Key

// 최종 직렬화 결과 유니언
type SerializedArgument =
  | string
  | number
  | Callback
  | CallbackWithResponse
  | ByteBufferType
  | SecretBufferType
  | object   // 포인터 객체 (void*)
  | null

type SerializedArguments = Record<string, SerializedArgument>

// 🔧 핸들 직렬화 유틸: 유니언을 정규화
function serializeHandle(val: unknown): SerializedArgument {
  if (typeof val === 'number') return val
  if (typeof val === 'bigint') return Number(val) // 필요 시 범위 체크
  if (typeof val === 'string') return val
  if (Buffer.isBuffer(val)) return uint8arrayToByteBufferStruct(val)
  if (val instanceof Uint8Array) return uint8arrayToByteBufferStruct(val)
  
  // 핸들 객체인 경우 handle 속성에서 실제 핸들 값을 추출
  if (typeof val === 'object' && val !== null && 'handle' in val) {
    const handle = (val as any).handle
    if (typeof handle === 'number' || typeof handle === 'bigint' || typeof handle === 'string') {
      return typeof handle === 'bigint' ? Number(handle) : handle
    }
  }
  
  // 여기에 올 수 있는 다른 케이스가 없다면:
  throw new TypeError(`Unsupported handle type: ${Object.prototype.toString.call(val)}`)
}
// void* 로 넘길 때: 포인터 객체를 그대로 허용
function serializePointerLike(val: unknown): object {
  // 이미 포인터 객체면 그대로
  if (val && typeof val === 'object') return val as object
  // 어떤 구현은 포인터를 숫자 주소로 줄 수도 있음 → 그럼 object로 래핑할 필요 없이 숫자 자체를 허용
  throw new TypeError(`Pointer-like handle must be an object. Got: ${typeof val}`)
}

// size_t 로 넘길 때: 반드시 number 로
function serializeNumericHandle(val: unknown): number {
  if (typeof val === 'number') return val
  if (typeof val === 'bigint') return Number(val)
  throw new TypeError(`Numeric handle must be number/bigint. Got: ${typeof val}`)
}
// 제네릭 매핑(핸들은 number | string | ByteBufferType 허용)
export type SerializedOptions<T> = Required<{
  [K in keyof T]:
    T[K] extends string ? string
    : T[K] extends number | boolean | Date ? number
    : T[K] extends LocalKeyHandle | Key ? object               // ← 포인터
    : T[K] extends StoreHandle | SessionHandle | ScanHandle | ArcHandle ? number // ← 숫자
    : T[K] extends Record<string, unknown> | unknown[] ? string
    : T[K] extends Buffer | Uint8Array | Jwk ? ByteBufferType
    : T[K] extends Callback ? Callback
    : T[K] extends CallbackWithResponse ? CallbackWithResponse
    : T[K] extends boolean | undefined ? number
    : T[K] extends unknown[] | undefined ? string
    : T[K] extends Record<string, unknown> | undefined ? string
    : T[K] extends Date | undefined ? number
    : T[K] extends string | undefined ? string
    : T[K] extends number | undefined ? number
    : T[K] extends Uint8Array | undefined ? ByteBufferType
    : unknown
}>;


const serialize = (arg: Argument): SerializedArgument => {
  switch (typeof arg) {
    case 'undefined':
      return null
    case 'boolean':
      return +arg
    case 'string':
      return arg
    case 'number':
      return arg
    case 'function':
      return arg
   case 'object': {
  if (arg === null) return null;
  if (arg instanceof Date) return arg.valueOf();

  // ✅ 키 계열: FFI가 보통 void* 를 받음 → 포인터 그대로
  if (arg instanceof LocalKeyHandle) {
    return serializePointerLike(arg.handle);
  }
  if (arg instanceof Key) {
    // Key 내부의 실제 C 핸들
    return serializePointerLike(arg.handle?.handle);
  }

  // 👉 아래는 프로젝트 정책/FFI 시그니처에 맞게 유지
  // 보통 Store/Session/Scan/Arc 는 size_t/uint64 → 숫자
  if (
    arg instanceof ArcHandle ||
    arg instanceof StoreHandle ||
    arg instanceof SessionHandle ||
    arg instanceof ScanHandle
  ) {
    return serializeNumericHandle(arg.handle);
  }

  // 바이너리는 구조체로
  if (Buffer.isBuffer(arg)) return uint8arrayToByteBufferStruct(arg);
  if (arg instanceof Uint8Array) return uint8arrayToByteBufferStruct(arg);
  if (arg instanceof Jwk) return uint8arrayToByteBufferStruct(arg.toUint8Array());

  return JSON.stringify(arg as Record<string, unknown>);
}
    default:
      throw new Error('could not serialize value')
  }
}

export const serializeArguments = <T extends Record<string, Argument> = Record<string, Argument>>(
  args: T
): SerializedOptions<T> => {
  const retVal: SerializedArguments = {}
  for (const [key, value] of Object.entries(args)) {
    retVal[key] = serialize(value as Argument)
  }
  return retVal as SerializedOptions<T>
}
