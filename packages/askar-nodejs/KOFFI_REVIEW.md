# Koffi 변환 검토 결과 및 수정사항

## 개요
Rust FFI 코드를 ref-napi에서 Koffi로 변환하는 작업에 대한 검토를 수행했습니다.

## 원본 Rust 코드 분석
```rust
#[no_mangle]
pub extern "C" fn askar_get_current_error(error_json_p: *mut *const c_char) -> ErrorCode {
    let error = rust_string_to_c(get_current_error_json());
    unsafe { *error_json_p = error };
    ErrorCode::Success
}
```

- **반환값**: `ErrorCode` (i64 타입)
- **파라미터**: `*mut *const c_char` (const char**의 mutable pointer)
- **동작**: 현재 에러를 JSON 문자열로 직렬화하여 output 파라미터로 반환

## 발견된 문제점 및 수정사항

### 1. ❌ 반환 타입 불일치
**문제**: Rust에서 `ErrorCode`는 `i64`인데 Koffi 바인딩에서 `uint`로 선언됨
```typescript
// 🔴 잘못된 코드
askar_get_current_error: 'uint askar_get_current_error(const char **error_json_p_out)'

// ✅ 수정된 코드  
askar_get_current_error: 'int64 askar_get_current_error(_Out_ string *error_json_p_out)'
```

### 2. ❌ Output 파라미터 문법 오류
**문제**: Koffi에서 output 파라미터는 `_Out_` 어노테이션과 올바른 타입 사용 필요
```typescript
// 🔴 잘못된 코드
'const char **error_json_p_out'

// ✅ 수정된 코드
'_Out_ string *error_json_p_out'
```

### 3. ❌ JavaScript 사용법 오류
**문제**: Koffi에서 output 파라미터는 배열로 전달해야 함
```typescript
// 🔴 잘못된 코드
public getCurrentError(): AskarErrorObject {
  const error = allocateStringPtr()
  this.nativeAskar.askar_get_current_error(error)
  const serializedError = handleReturnPointer<string>(error, FFI_STRING)
  return JSON.parse(serializedError) as AskarErrorObject
}

// ✅ 수정된 코드
public getCurrentError(): AskarErrorObject {
  const errorOutput = [null] // string output을 위한 배열
  this.nativeAskar.askar_get_current_error(errorOutput)
  const serializedError = errorOutput[0] // 배열에서 결과 값 추출

  if (!serializedError) {
    return { code: 0, message: null }
  }

  return JSON.parse(serializedError) as AskarErrorObject
}
```

## 수정된 전체 코드

### Koffi 바인딩 (bindings.ts)
```typescript
export const nativeBindings = {
  // error.rs
  askar_get_current_error: 'int64 askar_get_current_error(_Out_ string *error_json_p_out)',
  // ... 다른 함수들
}
```

### JavaScript 구현 (NodeJSAskar.ts)
```typescript
public getCurrentError(): AskarErrorObject {
  // Koffi에서 output 파라미터는 배열로 전달합니다
  const errorOutput = [null] // string output을 위한 배열
  this.nativeAskar.askar_get_current_error(errorOutput)
  const serializedError = errorOutput[0] // 배열에서 결과 값 추출

  if (!serializedError) {
    return { code: 0, message: null }
  }

  return JSON.parse(serializedError) as AskarErrorObject
}
```

## 테스트 코드

### 1. 기본 테스트 (getCurrentError.test.ts)
포괄적인 테스트 스위트:
- 기본 인스턴스화 테스트
- 버전 함수 테스트  
- 에러 없는 상태 테스트
- 에러 발생 후 상태 테스트
- Edge case 테스트
- 구조 검증

### 2. 간단한 테스트 (test-getCurrentError.js)
빠른 검증을 위한 최소한의 테스트:
- 기본 동작 확인
- 반환값 구조 검증
- 성공/실패 확인

## 실행 방법

```bash
# 1. 의존성 설치
cd packages/askar-nodejs
pnpm install

# 2. 컴파일
pnpm build

# 3. 간단한 테스트 실행
pnpm test:getCurrentError

# 4. 전체 테스트 실행
pnpm test:getCurrentError:ts
```

## 주요 학습 사항

1. **Koffi Output 파라미터**: `_Out_` 어노테이션 사용, 배열로 전달
2. **타입 일치**: Rust 타입과 Koffi 바인딩 타입이 정확히 일치해야 함
3. **메모리 관리**: Koffi는 자동으로 메모리 관리를 처리함
4. **에러 처리**: null 체크와 적절한 기본값 제공 필요

## 추가 고려사항

- 현재 다른 함수들도 비슷한 문제가 있을 수 있음
- 전체 바인딩 검토 및 일관성 있는 패턴 적용 필요
- 성능 테스트 및 메모리 누수 확인 필요

## 결론

✅ **변환 상태**: getCurrentError 함수의 Koffi 변환이 올바르게 수정됨
✅ **테스트**: 포괄적인 테스트 코드 작성 완료
⚠️ **주의**: 다른 함수들도 동일한 패턴으로 수정 필요
