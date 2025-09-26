import type {
  AeadParamsOptions,
  Askar,
  AskarErrorObject,
  EncryptedBuffer,
  EntryListCountOptions,
  EntryListFreeOptions,
  EntryListGetCategoryOptions,
  EntryListGetNameOptions,
  EntryListGetTagsOptions,
  EntryListGetValueOptions,
  KeyAeadDecryptOptions,
  KeyAeadEncryptOptions,
  KeyAeadGetPaddingOptions,
  KeyAeadGetParamsOptions,
  KeyAeadRandomNonceOptions,
  KeyConvertOptions,
  KeyCryptoBoxOpenOptions,
  KeyCryptoBoxOptions,
  KeyCryptoBoxSealOpenOptions,
  KeyCryptoBoxSealOptions,
  KeyDeriveEcdh1puOptions,
  KeyDeriveEcdhEsOptions,
  KeyEntryListCountOptions,
  KeyEntryListFreeOptions,
  KeyEntryListGetAlgorithmOptions,
  KeyEntryListGetMetadataOptions,
  KeyEntryListGetNameOptions,
  KeyEntryListGetTagsOptions,
  KeyEntryListLoadLocalOptions,
  KeyFreeOptions,
  KeyFromJwkOptions,
  KeyFromKeyExchangeOptions,
  KeyFromPublicBytesOptions,
  KeyFromSecretBytesOptions,
  KeyFromSeedOptions,
  KeyGenerateOptions,
  KeyGetAlgorithmOptions,
  KeyGetEphemeralOptions,
  KeyGetJwkPublicOptions,
  KeyGetJwkSecretOptions,
  KeyGetJwkThumbprintOptions,
  KeyGetPublicBytesOptions,
  KeyGetSecretBytesOptions,
  KeySignMessageOptions,
  KeyUnwrapKeyOptions,
  KeyVerifySignatureOptions,
  KeyWrapKeyOptions,
  MigrateIndySdkOptions,
  ScanFreeOptions,
  ScanNextOptions,
  ScanStartOptions,
  SessionCloseOptions,
  SessionCountOptions,
  SessionFetchAllKeysOptions,
  SessionFetchAllOptions,
  SessionFetchKeyOptions,
  SessionFetchOptions,
  SessionInsertKeyOptions,
  SessionRemoveAllOptions,
  SessionRemoveKeyOptions,
  SessionStartOptions,
  SessionUpdateKeyOptions,
  SessionUpdateOptions,
  SetCustomLoggerOptions,
  SetMaxLogLevelOptions,
  StoreCloseOptions,
  StoreCopyToOptions,
  StoreCreateProfileOptions,
  StoreGenerateRawKeyOptions,
  StoreGetDefaultProfileOptions,
  StoreGetProfileNameOptions,
  StoreListProfilesOptions,
  StoreOpenOptions,
  StoreProvisionOptions,
  StoreRekeyOptions,
  StoreRemoveOptions,
  StoreRemoveProfileOptions,
  StoreSetDefaultProfileOptions,
} from '@openwallet-foundation/askar-shared'
import { IKoffiCType, out, sizeof } from 'koffi'

// Local type definitions for missing exports
type StoreRenameProfileOptions = {
  storeHandle: any // Will accept both StoreHandle and number
  fromProfile: string
  toProfile: string
}

type StoreCopyProfileOptions = {
  fromHandle: any // Will accept both StoreHandle and number
  toHandle: any // Will accept both StoreHandle and number
  fromProfile: string
  toProfile?: string
}

import {
  AeadParams,
  AskarError,
  EntryListHandle,
  KeyEntryListHandle,
  LocalKeyHandle,
  ScanHandle,
  SessionHandle,
  StoreHandle,
  handleInvalidNullResponse,
} from '@openwallet-foundation/askar-shared'
import type {
  ByteBufferType,
  EncryptedBufferType,
  NativeCallback,
  NativeCallbackWithResponse,
  SecretBufferType,
} from './ffi'
import {
  FFI_INT8,
  FFI_INT32,
  FFI_INT64,
  FFI_STRING,
  FFI_POINTER,
  FFI_STRING_PTR,
  FFI_ENTRY_LIST_HANDLE,
  FFI_SESSION_HANDLE,
  FFI_KEY_ENTRY_LIST_HANDLE,
  FFI_LOCAL_KEY_HANDLE,
  FFI_STORE_HANDLE,
  FFI_STRING_LIST_HANDLE,
  FFI_SCAN_HANDLE,
} from './ffi/primitives'
import {
  deallocateCallbackBuffer,
  serializeArguments,
} from './ffi'
import {
  toNativeCallback,
  toNativeCallbackWithResponse,
  toNativeLogCallback,
  toVoidPointerCallback,
} from './ffi/callback'
import {
  encryptedBufferStructToClass,
  secretBufferToBuffer,
  byteBufferToBuffer,
  uint8arrayToByteBufferStruct,
  uint8arrayToByteBufferI64,
} from './ffi/conversion'
import {
  allocatePointer,
  allocateStringPtr,
  allocateInt32Ptr,
  allocateInt8Ptr,
  allocateSecretBuffer,
  allocateEncryptedBuffer,
  allocateAeadParams,
  allocateByteBuffer,
  allocateLocalKeyHandle,
  allocateEntryListHandle,
  allocateKeyEntryListHandle,
  allocateStringListHandle,
} from './ffi/alloc'
import { 
  SecretBufferStruct, 
  EncryptedBufferStruct, 
  AeadParamsStruct,
  ByteBufferStruct
} from './ffi/structures'
import { getNativeAskar } from './library'
import koffi from 'koffi'
import {
  // handleReturnPointer,
  // handleNullableReturnPointer,
  toUint8Array,
  convertMessageToUint8Array,
  extractKeyHandle,
  createLocalKeyHandleFromOutput,
  getStringFromOutput,
  processSecretBufferResult,
  processEncryptedBufferResult,
  processInt8Result,
  processInt32Result,
  createByteBufferStructs,
  convertToByteBufferStructs,
  convertToUint8ArrayOrNull,
  createOptionalByteBufferStructs
} from './utils'
function isNullPtr(p: unknown): boolean {
  return p == null
}
function handleNullableReturnPointer<Return>(ptr: unknown): Return | null {
  if (isNullPtr(ptr)) return null
  return (ptr as unknown) as Return
}

function handleReturnPointer<Return>(ptr: unknown): Return {
  if (isNullPtr(ptr)) {
    throw AskarError.customError({ message: 'Unexpected null pointer' })
  }
  return (ptr as unknown) as Return
}

// Koffi 방식의 메모리에서 값을 읽는 함수들
function readPointerValue<T>(buffer: Buffer, type: any): T {
  return koffi.decode(buffer, type) as T
}

function readStringFromBuffer(buffer: Buffer): string {
  if (!buffer || buffer.length < 8) { // 64비트 시스템에서 포인터는 8바이트
    console.error('readStringFromBuffer received an invalid buffer.');
    return '';
  }

  try {
    const address = buffer.readBigUInt64LE(0);
    console.log('Read pointer address:', '0x' + address.toString(16));

    // C 함수가 null 포인터를 반환했는지 확인합니다. (주소 값이 0)
    if (address === BigInt(0)) {
      console.warn('The native function returned a null pointer.');
      return '';
    }

    // 2단계: 주소 값을 koffi가 이해하는 포인터 타입으로 변환합니다.
    const stringPointer = koffi.as(Number(address), 'char*');

    // 3단계: 포인터를 사용해 실제 문자열로 디코딩합니다.
    const result = koffi.decode(stringPointer, 'string');
    console.log('Successfully decoded final string:', result);

    // 4단계: ★★★ 포인터를 사용해 C에서 할당한 메모리를 해제합니다. ★★★
    // 예: this.nativeAskar.askar_string_free(stringPointer);
    // 이 함수가 실제로 존재하고 라이브러리에 맞게 호출해야 합니다.

    return result as string;

  } catch (error) {
    console.error('Failed to read string from buffer:', error);
    return '';
  }
}

function readInt32FromBuffer(buffer: Buffer): number {
  return koffi.decode(buffer, FFI_INT32) as number
}

function readInt8FromBuffer(buffer: Buffer): number {
  return koffi.decode(buffer, FFI_INT8) as number
}

export class NodeJSAskar implements Askar {
  private promisify = async (method: (nativeCallbackPtr: koffi.IKoffiRegisteredCallback, id: number) => number): Promise<void> => {
    return new Promise((resolve, reject) => {
      const cb: NativeCallback = (id, errorCode) => {
        deallocateCallbackBuffer(id)

        try {
          this.handleError(errorCode)
        } catch (e) {
          reject(e)
        }

        resolve()
      }
      const { nativeCallback, id } = toNativeCallback(cb)
      method(nativeCallback, +id)
    })
  }

  private promisifyWithResponse = async <Return, Response = string>(
    method: (nativeCallbackWithResponsePtr: koffi.IKoffiRegisteredCallback, id: number) => number,
    responseFfiType = FFI_STRING
  ): Promise<Return | null> => {
    return new Promise((resolve, reject) => {
      const cb: NativeCallbackWithResponse<Response> = (id, errorCode, response) => {
        deallocateCallbackBuffer(id)

        if (errorCode !== 0) {
          const error = this.getAskarError(errorCode)
          reject(error)
          return
        }


        if (typeof response === 'string') {
          if (responseFfiType === FFI_STRING) {
            resolve(response as unknown as Return)
            return
          }
          try {
            resolve(JSON.parse(response) as Return)
            return
          } catch (error) {
            reject(error)
            return
          }
        } else if (typeof response === 'number') {
          resolve(response as unknown as Return)
          return
        } else if (response instanceof Buffer) {
          try {
            // koffi buffer may represent a null pointer
            if (typeof (response as any).address === 'function' && (response as any).address() === 0) {
              resolve(null)
              return
            }
          } catch (_) {
            // ignore address access errors
          }
          resolve(response as unknown as Return)
          return
        } else if (response === null) {
          // Handle null responses
          resolve(null as unknown as Return)
          return
        } else if (typeof response === 'object' && response !== null) {
          // Handle object responses (like handles)
          resolve(response as unknown as Return)
          return
        }

        reject(AskarError.customError({ message: `could not parse return type properly (type: ${typeof response})` }))
      }
      
      const { nativeCallback, id } = toNativeCallbackWithResponse(cb, responseFfiType)
      // console.log('[promisifyWithResponse] Calling native method with callback id:', id)
      
      const errorCode = method(nativeCallback, +id)
      // console.log('[promisifyWithResponse] Native method returned error code:', errorCode)
      
      // Handle synchronous errors immediately
      if (errorCode !== 0) {
        deallocateCallbackBuffer(+id)
        try {
          this.handleError(errorCode)
        } catch (error) {
          reject(error)
        }
        return
      }
      
      // Add timeout to detect if callback is never called
      setTimeout(() => {
        // console.log('[promisifyWithResponse] Timeout reached - callback was never called')
        reject(new Error('Callback timeout - native function did not call the callback'))
      }, 5000)
    })
  }

  /**
   * Fetch the error from the native library and throw it as a JS error
   *
   * NOTE:
   * Checks whether the error code of the returned error matches the error code that was passed to the function.
   * If it doesn't, we throw an error with the original errorCode, and a custom message explaining we weren't able
   * to retrieve the error message from the native library. This should however not break functionality as long as
   * error codes are used rather than error messages for error handling.
   *
   */
  private getAskarError(errorCode: number): AskarError {
    const error = this.getCurrentError()
    if (error.code !== errorCode) {
      return new AskarError({
        code: errorCode,
        message:
          'Error details have already been overwritten on the native side, unable to retrieve error message for the error',
      })
    }

    return new AskarError(error)
  }

  private handleError(errorCode: number) {
    if (errorCode === 0) return

    throw this.getAskarError(errorCode)
  }

  public get nativeAskar() {
    return getNativeAskar()
  }

  public version(): string {
    return this.nativeAskar.askar_version()
  }

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

  public keyGenerate(options: KeyGenerateOptions): LocalKeyHandle {
    const { algorithm, ephemeral, keyBackend } = serializeArguments(options)
    const handleOutput = [null]

    const errorCode = this.nativeAskar.askar_key_generate(
      algorithm as string, 
      keyBackend as string, 
      ephemeral as number, 
      handleOutput
    )
    this.handleError(errorCode)

    return createLocalKeyHandleFromOutput(handleOutput, 'Failed to generate key: null handle returned')
  }

  public keyFree(options: KeyFreeOptions): void {
    const { localKeyHandle } = serializeArguments(options)
    this.nativeAskar.askar_key_free(localKeyHandle)
  }

  public keyFromSeed(options: KeyFromSeedOptions): LocalKeyHandle {
    const { algorithm, method, seed } = serializeArguments(options)
    const handleOutput = [null]

    // seed는 이미 serialize에서 ByteBufferStruct로 변환됨
    const errorCode = this.nativeAskar.askar_key_from_seed(algorithm, seed as any, method, handleOutput)
    this.handleError(errorCode)

    return createLocalKeyHandleFromOutput(handleOutput, 'Failed to create key from seed: null handle returned')
  }

  public keyFromJwk(options: KeyFromJwkOptions): LocalKeyHandle {
    const { jwk } = serializeArguments(options)
    const handleOutput = [null]

    // jwk는 이미 serialize에서 ByteBufferStruct로 변환됨
    const errorCode = this.nativeAskar.askar_key_from_jwk(jwk as any, handleOutput)
    this.handleError(errorCode)

    return createLocalKeyHandleFromOutput(handleOutput, 'Failed to create key from JWK: null handle returned')
  }

  public keyFromPublicBytes(options: KeyFromPublicBytesOptions): LocalKeyHandle {
    const { publicKey, algorithm } = serializeArguments(options)
    const handleOutput = [null]

    const errorCode = this.nativeAskar.askar_key_from_public_bytes(algorithm, publicKey as any, handleOutput)
    this.handleError(errorCode)

    return createLocalKeyHandleFromOutput(handleOutput, 'Failed to create key from public bytes: null handle returned')
  }

  public keyGetPublicBytes(options: KeyGetPublicBytesOptions): Uint8Array {
    const { localKeyHandle } = serializeArguments(options)
    return processSecretBufferResult(
      this.nativeAskar,
      'askar_key_get_public_bytes',
      [localKeyHandle],
      this.handleError.bind(this)
    )
  }

  public keyFromSecretBytes(options: KeyFromSecretBytesOptions): LocalKeyHandle {
    const { secretKey, algorithm } = serializeArguments(options)
    const handleOutput = [null]

    const errorCode = this.nativeAskar.askar_key_from_secret_bytes(algorithm, secretKey as any, handleOutput)
    this.handleError(errorCode)

    return createLocalKeyHandleFromOutput(handleOutput, 'Failed to create key from secret bytes: null handle returned')
  }

  public keyGetSecretBytes(options: KeyGetSecretBytesOptions): Uint8Array {
    const { localKeyHandle } = serializeArguments(options)
    return processSecretBufferResult(
      this.nativeAskar,
      'askar_key_get_secret_bytes',
      [localKeyHandle],
      this.handleError.bind(this)
    )
  }
  
  public keyConvert(options: KeyConvertOptions): LocalKeyHandle {
    const { localKeyHandle, algorithm } = serializeArguments(options)
    const handleOutput = [null]

    const errorCode = this.nativeAskar.askar_key_convert(localKeyHandle, algorithm, handleOutput)
    this.handleError(errorCode)

    return createLocalKeyHandleFromOutput(handleOutput, 'Failed to convert key: null handle returned')
  }
  
  public keyFromKeyExchange(options: KeyFromKeyExchangeOptions): LocalKeyHandle {
    const { algorithm, skHandle, pkHandle } = serializeArguments(options)
    const handleOutput = [null]

    const errorCode = this.nativeAskar.askar_key_from_key_exchange(algorithm, skHandle, pkHandle, handleOutput)
    this.handleError(errorCode)

    return createLocalKeyHandleFromOutput(handleOutput, 'Failed to create key from key exchange: null handle returned')
  }

  public keyGetAlgorithm(options: KeyGetAlgorithmOptions): string {
    const { localKeyHandle } = serializeArguments(options)
    const stringOutput = [null]

    const errorCode = this.nativeAskar.askar_key_get_algorithm(localKeyHandle, stringOutput)
    this.handleError(errorCode)

    return getStringFromOutput(stringOutput, 'Failed to get key algorithm: null result returned')
  }

  public keyGetEphemeral(options: KeyGetEphemeralOptions): number {
    const { localKeyHandle } = serializeArguments(options)
    return processInt8Result(
      this.nativeAskar,
      'askar_key_get_ephemeral',
      [localKeyHandle],
      this.handleError.bind(this)
    )
  }

  public keyGetJwkPublic(options: KeyGetJwkPublicOptions): string {
    const { localKeyHandle, algorithm } = serializeArguments(options)
    const stringOutput = [null]

    const errorCode = this.nativeAskar.askar_key_get_jwk_public(localKeyHandle, algorithm, stringOutput)
    this.handleError(errorCode)

    return getStringFromOutput(stringOutput, 'Failed to get JWK public key: null result returned')
  }

  public keyGetJwkSecret(options: KeyGetJwkSecretOptions): Uint8Array {
    const { localKeyHandle } = serializeArguments(options)
    return processSecretBufferResult(
      this.nativeAskar,
      'askar_key_get_jwk_secret',
      [localKeyHandle],
      this.handleError.bind(this)
    )
  }

  public keyGetJwkThumbprint(options: KeyGetJwkThumbprintOptions): string {
    const { localKeyHandle, algorithm } = serializeArguments(options)
    const stringOutput = [null]

    const errorCode = this.nativeAskar.askar_key_get_jwk_thumbprint(localKeyHandle, algorithm, stringOutput)
    this.handleError(errorCode)

    const result = stringOutput[0]
    if (!result) {
      throw new Error('Failed to get key algorithm: null result returned')
    }
    return result
  }

  public keyAeadRandomNonce(options: KeyAeadRandomNonceOptions): Uint8Array {
    const { localKeyHandle } = serializeArguments(options)
    const ret = allocateSecretBuffer()

    const errorCode = this.nativeAskar.askar_key_aead_random_nonce(localKeyHandle, ret as any)
    this.handleError(errorCode)

    const secretBuffer = readPointerValue<SecretBufferType>(ret, SecretBufferStruct)
    return new Uint8Array(secretBufferToBuffer(secretBuffer))
  }

  public keyAeadGetParams(options: KeyAeadGetParamsOptions): AeadParams {
    const { localKeyHandle } = serializeArguments(options)
    const ret = allocateAeadParams()

    const errorCode = this.nativeAskar.askar_key_aead_get_params(localKeyHandle, ret)
    this.handleError(errorCode)

    const aeadParams = readPointerValue<AeadParamsOptions>(ret, AeadParamsStruct)
    return new AeadParams(aeadParams)
  }

   public keyAeadGetPadding(options: KeyAeadGetPaddingOptions): number {
    const { localKeyHandle, msgLen } = serializeArguments(options)
    const ret = allocateInt32Ptr()

    const errorCode = this.nativeAskar.askar_key_aead_get_padding(localKeyHandle as any, msgLen as number, ret)
    this.handleError(errorCode)

    return readInt32FromBuffer(ret)
  }

  public keyAeadEncrypt(options: KeyAeadEncryptOptions): EncryptedBuffer {
    const { localKeyHandle } = serializeArguments({ localKeyHandle: options.localKeyHandle })
    const { message, nonce, aad } = options

    const structs = convertToByteBufferStructs({
      message: message,
      nonce: nonce,
      aad: aad
    })
    
    return processEncryptedBufferResult(
      this.nativeAskar,
      'askar_key_aead_encrypt',
      [localKeyHandle, structs.message, structs.nonce, structs.aad],
      this.handleError.bind(this)
    )
  }

  public keyAeadDecrypt(options: KeyAeadDecryptOptions): Uint8Array {
    const { localKeyHandle } = serializeArguments({ localKeyHandle: options.localKeyHandle })
    const { ciphertext, nonce, tag, aad } = options

    const structs = convertToByteBufferStructs({
      ciphertext: ciphertext,
      nonce: nonce,
      tag: tag,
      aad: aad
    })

    return processSecretBufferResult(
      this.nativeAskar,
      'askar_key_aead_decrypt',
      [localKeyHandle, structs.ciphertext, structs.nonce, structs.tag, structs.aad],
      this.handleError.bind(this)
    )
  }

  public keySignMessage(options: KeySignMessageOptions): Uint8Array {
    const { localKeyHandle } = serializeArguments({ localKeyHandle: options.localKeyHandle })
    const { message, sigType } = options
    
    const messageBuffer = convertMessageToUint8Array(message, 'keySignMessage')
    const messageStruct = uint8arrayToByteBufferStruct(messageBuffer)
    
    return processSecretBufferResult(
      this.nativeAskar,
      'askar_key_sign_message',
      [localKeyHandle, messageStruct, (sigType ? sigType.toString() : null) as any],
      this.handleError.bind(this)
    )
  }
  
  public keyVerifySignature(options: KeyVerifySignatureOptions): boolean {
    const { localKeyHandle } = serializeArguments({ localKeyHandle: options.localKeyHandle })
    const { message, signature, sigType } = options
    
    console.log('keyVerifySignature debug:', {
      message: message,
      messageType: typeof message,
      signature: signature,
      signatureType: typeof signature,
      sigType: sigType,
      sigTypeType: typeof sigType
    })
    
    const messageBuffer = toUint8Array(message)
    const signatureBuffer = toUint8Array(signature)

    const messageStruct = uint8arrayToByteBufferStruct(messageBuffer)
    const signatureStruct = uint8arrayToByteBufferStruct(signatureBuffer)
    
    const result = processInt8Result(
      this.nativeAskar,
      'askar_key_verify_signature',
      [localKeyHandle, messageStruct as any, signatureStruct as any, (sigType ? sigType.toString() : null) as any],
      this.handleError.bind(this)
    )
    
    return Boolean(result)
  }

  public keyWrapKey(options: KeyWrapKeyOptions): EncryptedBuffer {
    const { localKeyHandle } = serializeArguments({ localKeyHandle: options.localKeyHandle })
    const { nonce, other } = options
    
    console.log('keyWrapKey debug:', {
      nonce: nonce,
      nonceType: typeof nonce,
      nonceConstructor: (nonce as any)?.constructor?.name,
      nonceLength: (nonce as any)?.length,
      other: other,
      otherType: typeof other,
      otherConstructor: (other as any)?.constructor?.name,
      localKeyHandle: localKeyHandle,
      localKeyHandleType: typeof localKeyHandle
    })
    
    const nonceBuffer = toUint8Array(nonce)
    const otherHandle = extractKeyHandle(other)

    console.log('keyWrapKey processed:', {
      nonceBufferLength: nonceBuffer.length,
      nonceBufferType: typeof nonceBuffer,
      otherHandle: otherHandle
    })

    const nonceStruct = uint8arrayToByteBufferStruct(nonceBuffer)
    console.log('nonceStruct:', nonceStruct)

    console.log('Before native call:', {
      localKeyHandle,
      otherHandle,
      nonceStruct
    })

    return processEncryptedBufferResult(
      this.nativeAskar,
      'askar_key_wrap_key',
      [localKeyHandle, otherHandle as any, nonceStruct as any],
      this.handleError.bind(this)
    )
  }
  public keyUnwrapKey(options: KeyUnwrapKeyOptions): LocalKeyHandle {
    const { localKeyHandle } = serializeArguments({ localKeyHandle: options.localKeyHandle })
    const { algorithm, ciphertext, nonce, tag } = options
    
    console.log('keyUnwrapKey debug:', {
      ciphertext: ciphertext,
      ciphertextType: typeof ciphertext,
      nonce: nonce,
      nonceType: typeof nonce,
      tag: tag,
      tagType: typeof tag,
      algorithm: algorithm
    })
    
    const handleOutput = [null]

    // 모든 바이트 데이터를 toUint8Array로 변환
    const ciphertextBuffer = toUint8Array(ciphertext)
    const nonceBuffer = toUint8Array(nonce)
    const tagBuffer = toUint8Array(tag)

    const ciphertextStruct = uint8arrayToByteBufferStruct(ciphertextBuffer)
    const nonceStruct = uint8arrayToByteBufferStruct(nonceBuffer)
    const tagStruct = uint8arrayToByteBufferStruct(tagBuffer)

    const errorCode = this.nativeAskar.askar_key_unwrap_key(localKeyHandle, algorithm, ciphertextStruct as any, nonceStruct as any, tagStruct as any, handleOutput)
    this.handleError(errorCode)

    return createLocalKeyHandleFromOutput(handleOutput, 'Failed to unwrap key: null handle returned')
  }
  public keyCryptoBoxRandomNonce(): Uint8Array {
    const ret:object = allocateSecretBuffer()

    const errorCode = this.nativeAskar.askar_key_crypto_box_random_nonce(ret as any)
    this.handleError(errorCode)

    const secretBuffer = readPointerValue<SecretBufferType>(ret as Buffer, SecretBufferStruct)
    return new Uint8Array(secretBufferToBuffer(secretBuffer))
  }

  public keyCryptoBox(options: KeyCryptoBoxOptions): Uint8Array {
    const { nonce, message } = options
    
    // recipientKey와 senderKey에서 핸들 추출
    const recipientKey = extractKeyHandle(options.recipientKey)
    const senderKey = extractKeyHandle(options.senderKey)

    const messageBuffer = toUint8Array(message)
    const nonceBuffer = toUint8Array(nonce)
    
    const messageStruct = uint8arrayToByteBufferStruct(messageBuffer)
    const nonceStruct = uint8arrayToByteBufferStruct(nonceBuffer)

    return processSecretBufferResult(
      this.nativeAskar,
      'askar_key_crypto_box',
      [recipientKey, senderKey, messageStruct as any, nonceStruct as any],
      this.handleError.bind(this)
    )
  }  

  public keyCryptoBoxOpen(options: KeyCryptoBoxOpenOptions): Uint8Array {
    const { nonce, message } = options
    
    // senderKey와 recipientKey에서 핸들 추출
    const senderKey = extractKeyHandle(options.senderKey)
    const recipientKey = extractKeyHandle(options.recipientKey)
    
    const messageBuffer = toUint8Array(message)
    const nonceBuffer = toUint8Array(nonce)
    
    const messageStruct = uint8arrayToByteBufferStruct(messageBuffer)
    const nonceStruct = uint8arrayToByteBufferStruct(nonceBuffer)

    return processSecretBufferResult(
      this.nativeAskar,
      'askar_key_crypto_box_open',
      [recipientKey, senderKey, messageStruct as any, nonceStruct as any],
      this.handleError.bind(this)
    )
  }
  public keyCryptoBoxSeal(options: KeyCryptoBoxSealOptions): Uint8Array {
    const localKeyHandle = extractKeyHandle(options.localKeyHandle)
    const { message } = options

    const messageBuffer = toUint8Array(message)
    const messageStruct = uint8arrayToByteBufferStruct(messageBuffer)
    
    return processSecretBufferResult(
      this.nativeAskar,
      'askar_key_crypto_box_seal',
      [localKeyHandle as any, messageStruct as any],
      this.handleError.bind(this)
    )
  }
  
  public keyCryptoBoxSealOpen(options: KeyCryptoBoxSealOpenOptions): Uint8Array {
    const localKeyHandle = extractKeyHandle(options.localKeyHandle)
    const { ciphertext } = options
    
    const ciphertextBuffer = toUint8Array(ciphertext)
    const ciphertextStruct = uint8arrayToByteBufferStruct(ciphertextBuffer)
    
    return processSecretBufferResult(
      this.nativeAskar,
      'askar_key_crypto_box_seal_open',
      [localKeyHandle as any, ciphertextStruct as any],
      this.handleError.bind(this)
    )
  }

  public keyDeriveEcdhEs(options: KeyDeriveEcdhEsOptions): LocalKeyHandle {
    // serializeArguments를 사용해서 키 핸들 변환
    const recipientKeyHandle = serializeArguments({ localKeyHandle: options.recipientKey }).localKeyHandle
    const ephemeralKeyHandle = serializeArguments({ localKeyHandle: options.ephemeralKey }).localKeyHandle
    
    const { receive, algorithm, apv, apu, algId } = options
    const handleOutput = [null]

    // 바이트 배열들을 ByteBufferStruct로 변환
    const algIdStruct = uint8arrayToByteBufferStruct(toUint8Array(algId))
    const apuStruct = uint8arrayToByteBufferStruct(toUint8Array(apu))
    const apvStruct = uint8arrayToByteBufferStruct(toUint8Array(apv))
    
    const receiveNum = receive ? 1 : 0
    
    const errorCode = this.nativeAskar.askar_key_derive_ecdh_es(
      algorithm,
      ephemeralKeyHandle,
      recipientKeyHandle,
      algIdStruct as any,
      apuStruct as any,
      apvStruct as any,
      receiveNum,
      handleOutput
    )
    this.handleError(errorCode)

    return createLocalKeyHandleFromOutput(handleOutput, 'Failed to derive ECDH-ES key: null handle returned')
  }
   public keyDeriveEcdh1pu(options: KeyDeriveEcdh1puOptions): LocalKeyHandle {
    const { algorithm, receive, algId, apu, apv, ccTag } = options
    
    // 네이티브 핸들 값 추출
    const senderHandleValue = options.senderKey.handle.handle
    const recipientHandleValue = options.recipientKey.handle.handle
    const ephemeralHandleValue = options.ephemeralKey.handle.handle

    const handleOutput = [null]
    
    // 바이트 배열들을 ByteBufferStruct로 변환
    const algIdStruct = uint8arrayToByteBufferStruct(toUint8Array(algId))
    const apuStruct = uint8arrayToByteBufferStruct(toUint8Array(apu))
    const apvStruct = uint8arrayToByteBufferStruct(toUint8Array(apv))
    const ccTagStruct = ccTag ? uint8arrayToByteBufferStruct(toUint8Array(ccTag)) : uint8arrayToByteBufferStruct(new Uint8Array(0))

    const receiveNum = receive ? 1 : 0
    const errorCode = this.nativeAskar.askar_key_derive_ecdh_1pu(
      algorithm,
      ephemeralHandleValue as any,
      senderHandleValue as any,
      recipientHandleValue as any,
      algIdStruct as any,
      apuStruct as any,
      apvStruct as any,
      ccTagStruct as any,
      receiveNum,
      handleOutput
    )
    this.handleError(errorCode)

    return createLocalKeyHandleFromOutput(handleOutput, 'Failed to derive ECDH-1PU key: null handle returned')
  }

  public keyGetSupportedBackends(): string[] {
    const stringListHandlePtr = allocatePointer()

    const keyGetSupportedBackendsErrorCode = this.nativeAskar.askar_key_get_supported_backends(stringListHandlePtr)
    this.handleError(keyGetSupportedBackendsErrorCode)
    const stringListHandle = readPointerValue<Buffer>(stringListHandlePtr, FFI_POINTER)

    const listCountPtr = allocateInt32Ptr()
    const stringListCountErrorCode = this.nativeAskar.askar_string_list_count(stringListHandle, listCountPtr)
    this.handleError(stringListCountErrorCode)
    const count = readInt32FromBuffer(listCountPtr)

    const supportedBackends: string[] = []
    for (let i = 0; i < count; i++) {
      const strPtr = allocateStringPtr()
      const errorCode = this.nativeAskar.askar_string_list_get_item(stringListHandle, i, strPtr)
      this.handleError(errorCode)
      supportedBackends.push(readStringFromBuffer(strPtr))
    }
    this.nativeAskar.askar_string_list_free(stringListHandle)

    return supportedBackends
  }

  public clearCustomLogger(): void {
    this.nativeAskar.askar_clear_custom_logger()
  }

  // TODO: the id has to be deallocated when its done, but how?
  public setCustomLogger({ logLevel, flush, enabled, logger }: SetCustomLoggerOptions): void {
    const { nativeCallback: logCallback } = toNativeLogCallback(logger)
    
    // Context can be null for simplicity
    const context = Buffer.alloc(0)
    
    // For now, we'll pass null pointers for enabled and flush callbacks
    // since the specific callback types are not available in the current implementation
    const enabledCallback: any = Buffer.alloc(0) // null pointer
    const flushCallback: any = Buffer.alloc(0) // null pointer
    
    const errorCode = this.nativeAskar.askar_set_custom_logger(
      context, 
      logCallback, 
      enabledCallback, 
      flushCallback, 
      logLevel
    )
    this.handleError(errorCode)
  }

  public setDefaultLogger(): void {
    const errorCode = this.nativeAskar.askar_set_default_logger()
    this.handleError(errorCode)
  }

  public setMaxLogLevel(options: SetMaxLogLevelOptions): void {
    const { logLevel } = serializeArguments(options)

    const errorCode = this.nativeAskar.askar_set_max_log_level(logLevel as number)
    this.handleError(errorCode)
  }

  //result_list.rs
  //askar_entry_list
  public entryListCount(options: EntryListCountOptions): number {
    const { entryListHandle } = serializeArguments(options)
    const ret = allocateInt32Ptr()

    const errorCode = this.nativeAskar.askar_entry_list_count(entryListHandle as any, ret)
    this.handleError(errorCode)

    return readInt32FromBuffer(ret)
  }
  public entryListGetCategory(options: EntryListGetCategoryOptions): string {
    const { entryListHandle, index } = serializeArguments(options)
    const ret = allocateStringPtr()

    const errorCode = this.nativeAskar.askar_entry_list_get_category(entryListHandle as any, index as number, ret)
    this.handleError(errorCode)

    return readStringFromBuffer(ret)
  }
  public entryListGetName(options: EntryListGetNameOptions): string {
    const { entryListHandle, index } = serializeArguments(options)
    const ret = allocateStringPtr()

    const errorCode = this.nativeAskar.askar_entry_list_get_name(entryListHandle as any, index as number, ret)
    this.handleError(errorCode)

    return readStringFromBuffer(ret)
  }
  public entryListGetValue(options: EntryListGetValueOptions): Uint8Array {
    const { entryListHandle, index } = serializeArguments(options)
    const ret = allocateSecretBuffer()

    const errorCode = this.nativeAskar.askar_entry_list_get_value(entryListHandle as any, index as number, ret as any)
    this.handleError(errorCode)

    const byteBuffer = readPointerValue<SecretBufferType>(ret, SecretBufferStruct)
    return new Uint8Array(secretBufferToBuffer(byteBuffer))
  }
  public entryListGetTags(options: EntryListGetTagsOptions): string | null {
    const { entryListHandle, index } = serializeArguments(options)
    const ret = allocateStringPtr()

    const errorCode = this.nativeAskar.askar_entry_list_get_tags(
      entryListHandle as any,
      index as number,
      ret
    )
    this.handleError(errorCode)

    return handleNullableReturnPointer<string>(ret)
  }
  public entryListFree(options: EntryListFreeOptions): void {
    const { entryListHandle } = serializeArguments(options)

    this.nativeAskar.askar_entry_list_free(entryListHandle)
  }

  //askar_key_entry_list
  public keyEntryListCount(options: KeyEntryListCountOptions): number {
    const { keyEntryListHandle } = serializeArguments(options)
    const ret = allocateInt32Ptr()

    const errorCode = this.nativeAskar.askar_key_entry_list_count(keyEntryListHandle, ret)
    this.handleError(errorCode)

    return readInt32FromBuffer(ret)
  }
  public keyEntryListFree(options: KeyEntryListFreeOptions): void {
    const { keyEntryListHandle } = serializeArguments(options)

    this.nativeAskar.askar_key_entry_list_free(keyEntryListHandle)
  }
  public keyEntryListGetAlgorithm(options: KeyEntryListGetAlgorithmOptions): string {
    const { keyEntryListHandle, index } = serializeArguments(options)
    const ret = allocateStringPtr()

    const errorCode = this.nativeAskar.askar_key_entry_list_get_algorithm(keyEntryListHandle as any, index as number, ret)
    this.handleError(errorCode)

    return readStringFromBuffer(ret)
  }
  public keyEntryListGetName(options: KeyEntryListGetNameOptions): string {
    const { keyEntryListHandle, index } = serializeArguments(options)
    const ret = allocateStringPtr()

    const errorCode = this.nativeAskar.askar_key_entry_list_get_name(keyEntryListHandle as any, index as number, ret)
    this.handleError(errorCode)

    return readStringFromBuffer(ret)
  }
  public keyEntryListGetMetadata(options: KeyEntryListGetMetadataOptions): string | null {
    const { keyEntryListHandle, index } = serializeArguments(options)
    const ret = allocateStringPtr()

    const errorCode = this.nativeAskar.askar_key_entry_list_get_metadata(keyEntryListHandle as any, index as number, ret)
    this.handleError(errorCode)

    return handleNullableReturnPointer<string>(ret)
  }
  public keyEntryListGetTags(options: KeyEntryListGetTagsOptions): string | null {
    const { keyEntryListHandle, index } = serializeArguments(options)
    const ret = allocateStringPtr()

    const errorCode = this.nativeAskar.askar_key_entry_list_get_tags(keyEntryListHandle as any, index as number, ret)
    this.handleError(errorCode)

    return handleNullableReturnPointer<string>(ret)
  }
  public keyEntryListLoadLocal(options: KeyEntryListLoadLocalOptions): LocalKeyHandle {
    const { index, keyEntryListHandle } = serializeArguments(options)
    const ret = allocatePointer()

    const errorCode = this.nativeAskar.askar_key_entry_list_load_local(keyEntryListHandle as any, index as number, ret)
    this.handleError(errorCode)

    const handle = readPointerValue<any>(ret, FFI_LOCAL_KEY_HANDLE)
    const localKeyHandle = LocalKeyHandle.fromHandle(handle)
    
    if (!localKeyHandle) {
      throw AskarError.customError({ message: 'Failed to load local key: null handle returned' })
    }
    
    return localKeyHandle
  }

  //store.rs
public storeGenerateRawKey(options: StoreGenerateRawKeyOptions): string {
  const { seed } = options

  // 1) 시드 변환
  const seedBuffer = toUint8Array(seed)
  const seedStruct = uint8arrayToByteBufferStruct(seedBuffer)
  console.log(
    'seedBuffer.length=',
    seedBuffer.length,
    'seedStruct.len=',
    Number(seedStruct.len),
    'data?',
    !!seedStruct.data
  )

  // 2) outPtr 직접 할당 (char* 하나의 크기)
  // const PTR_SIZE = koffi.sizeof('char *')
  const outPtr = [null]
  console.log('outPtr allocated at', outPtr)

  // 3) 네이티브 함수 호출
  const errorCode = this.nativeAskar.askar_store_generate_raw_key(seedStruct, outPtr)
  console.log('askar_store_generate_raw_key returned', errorCode)
  this.handleError(errorCode)

  const rawKey = outPtr[0] as unknown as string

  // 4) 문자열 읽기
  return rawKey
}


  public async storeProvision(options: StoreProvisionOptions): Promise<StoreHandle> {
    const { profile, passKey, keyMethod, specUri, recreate } = serializeArguments(options)
    
    const handle = await this.promisifyWithResponse<number, number>(
      (cb, cbId) => {
        // Use the standard callback approach instead of toVoidPointerCallback
        return this.nativeAskar.askar_store_provision(specUri as string, keyMethod as string, passKey as string, profile, recreate as number, cb, cbId)
      },
      FFI_STORE_HANDLE
    )

    return StoreHandle.fromHandle(handle)
  }
  public async storeOpen(options: StoreOpenOptions): Promise<StoreHandle> {
    const { profile, keyMethod, passKey, specUri } = serializeArguments(options)

    const handle = await this.promisifyWithResponse<number>(
      (cb, cbId) => this.nativeAskar.askar_store_open(specUri, keyMethod, passKey, profile, cb, cbId),
      FFI_STORE_HANDLE
    )

    return StoreHandle.fromHandle(handle)
  }
  public async storeRemove(options: StoreRemoveOptions): Promise<number> {
    const { specUri } = serializeArguments(options)
    const response = await this.promisifyWithResponse<number>(
      (cb, cbId) => this.nativeAskar.askar_store_remove(specUri, cb, cbId),
      FFI_INT8
    )

    return handleInvalidNullResponse(response)
  }
  public async storeCreateProfile(options: StoreCreateProfileOptions): Promise<string> {
    const { storeHandle, profile } = serializeArguments(options)
    const response = await this.promisifyWithResponse<string>(
      (cb, cbId) => this.nativeAskar.askar_store_create_profile(storeHandle as any, profile as string, cb, cbId),
      FFI_STRING
    )

    return handleInvalidNullResponse(response)
  }
  public async storeGetProfileName(options: StoreGetProfileNameOptions): Promise<string> {
    const { storeHandle } = serializeArguments(options)
    const response = await this.promisifyWithResponse<string>((cb, cbId) =>
      this.nativeAskar.askar_store_get_profile_name(storeHandle as any, cb, cbId)
    )

    return handleInvalidNullResponse(response)
  }
  public async storeListProfiles(options: StoreListProfilesOptions): Promise<string[]> {
    const { storeHandle } = serializeArguments(options)
    const listHandle = await this.promisifyWithResponse<Buffer>(
      (cb, cbId) => this.nativeAskar.askar_store_list_profiles(storeHandle as any, cb, cbId),
      FFI_STRING_LIST_HANDLE
    )
    if (listHandle === null) {
      throw AskarError.customError({ message: 'Invalid handle' })
    }
    const listCountPtr = allocateInt32Ptr()
    const errorCode = this.nativeAskar.askar_string_list_count(listHandle, listCountPtr)
    this.handleError(errorCode)
    const count = readInt32FromBuffer(listCountPtr)
    
    const ret: string[] = []
    for (let i = 0; i < count; i++) {
      const strPtr = allocateStringPtr()
      const errorCode = this.nativeAskar.askar_string_list_get_item(listHandle, i, strPtr)
      this.handleError(errorCode)
      ret.push(readStringFromBuffer(strPtr))
    }
    this.nativeAskar.askar_string_list_free(listHandle)
    return ret
  }
  public async storeRemoveProfile(options: StoreRemoveProfileOptions): Promise<number> {
    const { storeHandle, profile } = serializeArguments(options)

    const response = await this.promisifyWithResponse<number>(
      (cb, cbId) => this.nativeAskar.askar_store_remove_profile(storeHandle as any, profile as string, cb, cbId),
      FFI_INT8
    )

    return handleInvalidNullResponse(response)
  }
  public async storeGetDefaultProfile(options: StoreGetDefaultProfileOptions): Promise<string> {
    const { storeHandle } = serializeArguments(options)
    const response = await this.promisifyWithResponse<string>((cb, cbId) =>
      this.nativeAskar.askar_store_get_default_profile(storeHandle as any, cb, cbId)
    )

    return handleInvalidNullResponse(response)
  }
  public async storeSetDefaultProfile(options: StoreSetDefaultProfileOptions): Promise<void> {
    const { storeHandle, profile } = serializeArguments(options)

    return this.promisify((cb, cbId) =>
      this.nativeAskar.askar_store_set_default_profile(storeHandle as any, profile as string, cb, cbId)
    )
  }
  public async storeRenameProfile(options: StoreRenameProfileOptions): Promise<number> {
    // Function not available in current DLL version
    throw new Error('askar_store_rename_profile is not available in the current native library version')
    
    // // Handle both StoreHandle object and number
    // const storeHandle = typeof options.storeHandle === 'object' && options.storeHandle?.handle 
    //   ? options.storeHandle.handle 
    //   : options.storeHandle
    
    // const response = await this.promisifyWithResponse<number>(
    //   (cb, cbId) => this.nativeAskar.askar_store_rename_profile(
    //     storeHandle,
    //     options.fromProfile,
    //     options.toProfile,
    //     cb,
    //     cbId
    //   ),
    //   FFI_INT8
    // )
    // return handleInvalidNullResponse(response)
  }
  public async storeCopyProfile(options: StoreCopyProfileOptions): Promise<number> {
    // Function not available in current DLL version
    throw new Error('askar_store_copy_profile is not available in the current native library version')
    
    // // Handle both StoreHandle objects and numbers
    // const fromHandle = typeof options.fromHandle === 'object' && options.fromHandle?.handle
    //   ? options.fromHandle.handle
    //   : options.fromHandle
      
    // const toHandle = typeof options.toHandle === 'object' && options.toHandle?.handle
    //   ? options.toHandle.handle
    //   : options.toHandle
    
    // const response = await this.promisifyWithResponse<number>(
    //   (cb, cbId) => this.nativeAskar.askar_store_copy_profile(
    //     fromHandle,
    //     toHandle,
    //     options.fromProfile,
    //     options.toProfile ?? options.fromProfile,
    //     cb,
    //     cbId
    //   ),
    //   FFI_INT8
    // )
    // return handleInvalidNullResponse(response)
  }
  public async storeRekey(options: StoreRekeyOptions): Promise<void> {
    const { passKey, keyMethod, storeHandle } = serializeArguments(options)

    return this.promisify((cb, cbId) => this.nativeAskar.askar_store_rekey(storeHandle as any, keyMethod as string, passKey as string, cb, cbId))
  }
  public storeCopyTo(options: StoreCopyToOptions): Promise<void> {
    const { storeHandle, targetUri, passKey, keyMethod, recreate } = serializeArguments(options)

    return this.promisify((cb, cbId) =>
      this.nativeAskar.askar_store_copy(storeHandle as any, targetUri as string, keyMethod as string, passKey as string, recreate as number, cb, cbId)
    )
  }
  public storeClose(options: StoreCloseOptions): Promise<void> {
    const { storeHandle } = serializeArguments(options)

    return this.promisify((cb, cbId) => this.nativeAskar.askar_store_close(storeHandle as any, cb, cbId))
  }

  //askar_scan
  public async scanStart(options: ScanStartOptions): Promise<ScanHandle> {
    const { category, limit, offset, profile, storeHandle, tagFilter, orderBy, descending } =
      serializeArguments(options)
    const handle = await this.promisifyWithResponse<number>(
      (cb, cbId) =>
        this.nativeAskar.askar_scan_start(
          storeHandle as any,
          profile || '',
          category || '',
          tagFilter as string,
          +offset || 0,
          +limit || -1,
          orderBy || '',
          descending as number,
          cb,
          cbId
        ),
      FFI_SCAN_HANDLE
    )

    return ScanHandle.fromHandle(handle)
  }
  public async scanNext(options: ScanNextOptions): Promise<EntryListHandle | null> {
    const { scanHandle } = serializeArguments(options)

    const handle = await this.promisifyWithResponse<Buffer | null>(
      (cb, cbId) => this.nativeAskar.askar_scan_next(scanHandle as any, cb, cbId),
      FFI_ENTRY_LIST_HANDLE
    )

    return EntryListHandle.fromHandle(handle)
  }
  public scanFree(options: ScanFreeOptions): void {
    const { scanHandle } = serializeArguments(options)

    const errorCode = this.nativeAskar.askar_scan_free(scanHandle as any)
    this.handleError(errorCode)
  }

  //askar_session
  public async sessionStart(options: SessionStartOptions): Promise<SessionHandle> {
    const { storeHandle, profile, asTransaction } = serializeArguments(options)

    const handle = await this.promisifyWithResponse<number, number>(
      (cb, cbId) => this.nativeAskar.askar_session_start(storeHandle as any, profile as string, asTransaction as number, cb, cbId),
      FFI_SESSION_HANDLE
    )

    return SessionHandle.fromHandle(handle)
  }
  public async sessionCount(options: SessionCountOptions): Promise<number> {
    const { sessionHandle, tagFilter, category } = serializeArguments(options)
    const response = await this.promisifyWithResponse<number, number>(
      (cb, cbId) => this.nativeAskar.askar_session_count(sessionHandle as any, category || '*', tagFilter as string, cb, cbId),
      FFI_INT64
    )

    return handleInvalidNullResponse(response)
  }
  public async sessionFetch(options: SessionFetchOptions): Promise<EntryListHandle | null> {
    const { name, category, sessionHandle, forUpdate } = serializeArguments(options)
    const handle = await this.promisifyWithResponse<Uint8Array>(
      (cb, cbId) => this.nativeAskar.askar_session_fetch(sessionHandle as any, category || '', name as string, forUpdate as number, cb, cbId),
      FFI_ENTRY_LIST_HANDLE
    )

    return EntryListHandle.fromHandle(handle)
  }
  public async sessionFetchAll(options: SessionFetchAllOptions): Promise<EntryListHandle | null> {
    const { forUpdate, sessionHandle, tagFilter, limit, category, orderBy, descending } =
      serializeArguments(options)
  
    // 0) 필수 핸들 가드
    if (sessionHandle === null || sessionHandle === undefined) {
      console.error('❌ sessionFetchAll: sessionHandle is null or undefined')
      console.error('Options received:', options)
      throw new Error('sessionHandle is null or undefined in sessionFetchAll')
    }
  
     // 1) 안전 디폴트 & 타입 보정
     const cat  = category ?? ''                                             // 빈 문자열로 전체 조회 시도
     const tag  = tagFilter ?? null                                          // const char* (NULL 허용)
     const lim  = Number.isFinite(limit as number) ? (limit as number) : -1  // int64
     const ord  = orderBy && String(orderBy).trim().length > 0 ? String(orderBy) : 'name' // const char*
     const desc = descending ? 1 : 0                                         // int8
     const upd  = forUpdate ? 1 : 0                                          // int8
  
    // 2) 최종 전달값 디버깅 (치환 후 값)
    console.log('🔍 sessionFetchAll(final args) ->', {
      sessionHandle, category: cat, tagFilter: tag, limit: lim, orderBy: ord, descending: desc, forUpdate: upd
    })
  
    // 3) 호출 (반환은 EntryList 핸들 포인터)
    const handle = await this.promisifyWithResponse<any>(
      (cb, cbId) =>
        this.nativeAskar.askar_session_fetch_all(
          sessionHandle as number,  // size_t
          cat,                      // const char*
          tag,                      // const char* | NULL
          lim,                      // int64
          ord,                      // const char*
          desc,                     // int8
          upd,                      // int8
          cb,                       // void*
          cbId                      // int64
        ),
      FFI_ENTRY_LIST_HANDLE         // ⬅️ 포인터 핸들 타입이어야 함
    )
  
    return EntryListHandle.fromHandle(handle)
  }
  
  public async sessionRemoveAll(options: SessionRemoveAllOptions): Promise<number> {
    const { sessionHandle, tagFilter, category } = serializeArguments(options)
    const response = await this.promisifyWithResponse<number>(
      (cb, cbId) => this.nativeAskar.askar_session_remove_all(sessionHandle as any, category as string, tagFilter, cb, cbId),
      FFI_INT64
    )

    return handleInvalidNullResponse(response)
  }
  public async sessionUpdate(options: SessionUpdateOptions): Promise<void> {
    const { name, sessionHandle, category, expiryMs, tags, operation, value } = serializeArguments(options)

    // 1) value가 null/undefined인 경우 빈 ByteBuffer로 대체
  const valueBuf =
    value && typeof value === 'object' && 'len' in (value as any) && 'data' in (value as any)
      ? (value as any) // 이미 ByteBufferStruct
      : uint8arrayToByteBufferStruct(new Uint8Array(0)) // len=0, data=NULL

  // 2) tags: 객체면 JSON 문자열, undefined면 null → OK (Rust 측 Option 처리)
  const tagsStr = typeof tags === 'string' ? tags : tags ?? null

  // 3) expiry_ms: 미지정일 때만 -1, 그 외는 숫자 그대로
  const expiry = (expiryMs ?? -1) as number

  // 4) operation: 0/1/2인지 검증(선택)
  //   0 => Insert, 1 => Replace, 2 => Remove
  if (operation !== 0 && operation !== 1 && operation !== 2) {
    throw new Error(`Invalid operation: ${operation}`)
  }

  return this.promisify((cb, cbId) =>
    this.nativeAskar.askar_session_update(
      sessionHandle as any,          // size_t
      operation,              // int8
      category,               // const char*
      name,                   // const char*
      valueBuf as any,        // ByteBuffer (by value) ★ 빈 버퍼 보장
      tagsStr,                // const char* | null
      expiry,                 // int64 (>=0 or -1)
      cb,                     // 함수 포인터 (koffi.register 사용 권장)
      cbId                    // int64
    )
  )
  }
  public async sessionInsertKey(options: SessionInsertKeyOptions): Promise<void> {
    const { name, sessionHandle, expiryMs, localKeyHandle, metadata, tags } = serializeArguments(options)

    return this.promisify((cb, cbId) =>
      this.nativeAskar.askar_session_insert_key(
        sessionHandle as any,
        localKeyHandle,
        name,
        metadata,
        tags,
        +expiryMs || -1,
        cb,
        cbId
      )
    )
  }
  public async sessionFetchKey(options: SessionFetchKeyOptions): Promise<KeyEntryListHandle | null> {
    const { forUpdate, sessionHandle, name } = serializeArguments(options)

    const handle = await this.promisifyWithResponse<Uint8Array>(
      (cb, cbId) => this.nativeAskar.askar_session_fetch_key(sessionHandle as any, name as string, forUpdate as number, cb, cbId),
      FFI_KEY_ENTRY_LIST_HANDLE
    )

    return KeyEntryListHandle.fromHandle(handle)
  }
  public async sessionFetchAllKeys(options: SessionFetchAllKeysOptions): Promise<KeyEntryListHandle | null> {
    const { forUpdate, limit, tagFilter, sessionHandle, algorithm, thumbprint } = serializeArguments(options)

    const handle = await this.promisifyWithResponse<Uint8Array>(
      (cb, cbId) =>
        this.nativeAskar.askar_session_fetch_all_keys(
          sessionHandle as any,
          algorithm,
          thumbprint,
          tagFilter,
          +limit || -1,
          forUpdate as number,
          cb,
          cbId
        ),
      FFI_KEY_ENTRY_LIST_HANDLE
    )

    return KeyEntryListHandle.fromHandle(handle)
  }
  public async sessionUpdateKey(options: SessionUpdateKeyOptions): Promise<void> {
    const { expiryMs, tags, name, sessionHandle, metadata } = serializeArguments(options)

    return this.promisify((cb, cbId) =>
      this.nativeAskar.askar_session_update_key(sessionHandle as any, name as string, metadata, tags, +expiryMs || -1, cb, cbId)
    )
  }
  public async sessionRemoveKey(options: SessionRemoveKeyOptions): Promise<void> {
    const { sessionHandle, name } = serializeArguments(options)

    return this.promisify((cb, cbId) => this.nativeAskar.askar_session_remove_key(sessionHandle as any, name as string, cb, cbId))
  }
  public async sessionClose(options: SessionCloseOptions): Promise<void> {
    const { commit, sessionHandle } = serializeArguments(options)

    return await this.promisify((cb, cbId) => this.nativeAskar.askar_session_close(sessionHandle as any, commit as number, cb, cbId))
  }

  //migration.rs
  public async migrateIndySdk(options: MigrateIndySdkOptions): Promise<void> {
    const { specUri, kdfLevel, walletKey, walletName } = serializeArguments(options)
    await this.promisify((cb, cbId) =>
      this.nativeAskar.askar_migrate_indy_sdk(specUri, walletName, walletKey, kdfLevel, cb, cbId)
    )
  }

}