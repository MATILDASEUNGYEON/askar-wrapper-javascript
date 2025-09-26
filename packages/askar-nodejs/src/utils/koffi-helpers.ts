import koffi, { IKoffiCType } from 'koffi'

/**
 * Koffi 포인터 반환값을 처리하는 헬퍼 함수
 * @param out koffi.alloc으로 할당된 출력 버퍼
 * @param innerType FFI 타입 (FFI_STRING, FFI_INT32 등)
 * @returns 디코딩된 값
 */
export function handleReturnPointer<T>(out: object, innerType: IKoffiCType): T {
  // 포인터 타입이면 역참조 후 decode
  // koffi.alloc(pointerType, 1)로 할당된 경우, out은 포인터 객체이므로 deref 필요
  const deref = (out as any).deref ? (out as any).deref() : out
  return koffi.decode(deref, innerType) as T
}

/**
 * Nullable 포인터 반환값을 처리하는 헬퍼 함수
 * @param out koffi.alloc으로 할당된 출력 버퍼
 * @param innerType FFI 타입 (FFI_STRING, FFI_POINTER 등)
 * @returns 디코딩된 값 또는 null
 */
export function handleNullableReturnPointer<T>(
  out: object,            // koffi.alloc으로 할당된 out 버퍼
  innerType: IKoffiCType  // FFI_STRING, FFI_POINTER 등
): T | null {
  try {
    const value = koffi.decode(out, innerType) as T
    return value || null
  } catch {
    return null
  }
}
