import { LocalKeyHandle } from '@openwallet-foundation/askar-shared'

/**
 * 키 핸들 추출 및 처리 유틸리티 함수들
 */

/**
 * LocalKeyHandle 객체 또는 핸들에서 실제 핸들 값을 추출
 * @param keyHandle LocalKeyHandle 객체 또는 핸들 값
 * @returns 추출된 핸들 값
 */
export function extractKeyHandle(keyHandle: LocalKeyHandle | any): any {
  return keyHandle?.handle || keyHandle
}

/**
 * 여러 키 핸들들을 일괄 추출
 * @param handles 키 핸들들의 객체
 * @returns 추출된 핸들들의 객체
 */
export function extractMultipleKeyHandles<T extends Record<string, any>>(
  handles: T
): { [K in keyof T]: any } {
  const result = {} as { [K in keyof T]: any }
  
  for (const [key, value] of Object.entries(handles)) {
    result[key as keyof T] = extractKeyHandle(value)
  }
  
  return result
}

/**
 * 핸들 출력 배열에서 핸들을 검증하고 LocalKeyHandle 생성
 * @param handleOutput native 함수의 출력 배열
 * @param errorMessage 실패 시 에러 메시지
 * @returns LocalKeyHandle 인스턴스
 */
export function createLocalKeyHandleFromOutput(
  handleOutput: any[],
  errorMessage: string = 'Failed to create key: null handle returned'
): LocalKeyHandle {
  const handle = handleOutput[0]
  if (!handle) {
    throw new Error(errorMessage)
  }
  return new LocalKeyHandle(handle)
}

/**
 * 문자열 출력 배열에서 결과를 검증하고 반환
 * @param stringOutput native 함수의 출력 배열
 * @param errorMessage 실패 시 에러 메시지
 * @returns 문자열 결과
 */
export function getStringFromOutput(
  stringOutput: any[],
  errorMessage: string = 'Failed to get string result: null returned'
): string {
  const result = stringOutput[0]
  if (!result) {
    throw new Error(errorMessage)
  }
  return result
}
