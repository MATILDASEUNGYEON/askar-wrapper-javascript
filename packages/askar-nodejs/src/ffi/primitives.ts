// koffi-primitives.ts
import koffi, { sizeof } from 'koffi'

// ===== Primitives =====
// ref-napi의 'string'은 C의 const char* 의미이고,
// Koffi에선 koffi.types.string 을 쓰면 됩니다.
export const FFI_UINT8  = koffi.types.uint8
export const FFI_UINT64 = koffi.types.uint64
export const FFI_USIZE  = koffi.types.size_t
export const FFI_INT8   = koffi.types.int8
export const FFI_INT32  = koffi.types.int32
export const FFI_INT64  = koffi.types.int64
export const FFI_STRING = koffi.types.string     // const char*
export const FFI_VOID   = koffi.types.void

// ref-napi의 'pointer'는 C의 void* (opaque) 의미로 치환
export const FFI_POINTER = koffi.pointer(FFI_VOID)  // void*

// ===== Pointers =====
export const FFI_INT8_PTR   = koffi.pointer(FFI_INT8)    // int8*
export const FFI_STRING_PTR = koffi.pointer(FFI_STRING)  // char** (string*)
export const FFI_INT32_PTR  = koffi.pointer(FFI_INT32)   // int32*

// ===== Custom =====
export const FFI_CALLBACK_ID  = FFI_INT64
export const FFI_CALLBACK_PTR = FFI_POINTER              // void* 콜백 식별자/포인터
export const FFI_ERROR_CODE   = FFI_INT64

// ===== Handles =====
// ARC 핸들 등 "참조 카운팅 객체"는 모두 opaque pointer 로 모델링
const FFI_ARC_HANDLE = FFI_POINTER

export const FFI_ENTRY_LIST_HANDLE     = FFI_ARC_HANDLE   // void*
export const FFI_KEY_ENTRY_LIST_HANDLE = FFI_ARC_HANDLE   // void*
export const FFI_LOCAL_KEY_HANDLE      = FFI_ARC_HANDLE   // void*

// 일부 핸들은 라이브러리에서 size_t(정수 핸들)로 정의되어 있으므로 그대로 유지
export const FFI_SESSION_HANDLE    = FFI_USIZE            // size_t
export const FFI_SCAN_HANDLE       = FFI_USIZE            // size_t
export const FFI_STORE_HANDLE      = FFI_USIZE            // size_t
export const FFI_STRING_LIST_HANDLE= FFI_ARC_HANDLE       // void*
