import type { nativeBindings } from './bindings'
import type { IKoffiCType } from 'koffi'
import type { 
  ByteBufferType, 
  SecretBufferType, 
  EncryptedBufferType 
} from '../ffi/structures'

// Koffi handle types
type VoidPointer = object  // void* - opaque pointer for Arc handles
type SizeHandle = number   // size_t - numeric handle for store/session/scan
type StringPtr = object    // const char** - string output pointer
type NumberPtr = object    // int32*, int8* etc - numeric output pointer

export type NativeMethods = {
  // Error management
  askar_get_current_error(out: StringPtr): number

  // Key management - Key handles are void* (VoidPointer)
  askar_key_generate(alg: string, key_backend: string, ephemeral: number, out: object): number
  askar_key_from_seed(alg: string, seed: ByteBufferType, method: string, out: object): number
  askar_key_from_jwk(jwk: ByteBufferType, out: object): number
  askar_key_from_public_bytes(alg: string, public_bytes: ByteBufferType, out: object): number
  askar_key_get_public_bytes(handle: VoidPointer, out: SecretBufferType): number
  askar_key_from_secret_bytes(alg: string, secret: ByteBufferType, out: object): number
  askar_key_get_secret_bytes(handle: VoidPointer, out: SecretBufferType): number
  askar_key_convert(handle: VoidPointer, alg: string, out: object): number
  askar_key_from_key_exchange(alg: string, sk_handle: VoidPointer, pk_handle: VoidPointer, out: object): number
  askar_key_free(handle: VoidPointer): void
  askar_key_get_algorithm(handle: VoidPointer, out: StringPtr): number
  askar_key_get_ephemeral(handle: VoidPointer, out: NumberPtr): number
  askar_key_get_jwk_public(handle: VoidPointer, alg: string, out: StringPtr): number
  askar_key_get_jwk_secret(handle: VoidPointer, out: SecretBufferType): number
  askar_key_get_jwk_thumbprint(handle: VoidPointer, alg: string, out: StringPtr): number
  askar_key_aead_random_nonce(handle: VoidPointer, out: SecretBufferType): number
  askar_key_aead_get_params(handle: VoidPointer, out: object): number
  askar_key_aead_get_padding(handle: VoidPointer, msg_len: number, out: NumberPtr): number
  askar_key_aead_encrypt(handle: VoidPointer, message: ByteBufferType, nonce: ByteBufferType, aad: ByteBufferType, out: EncryptedBufferType): number
  askar_key_aead_decrypt(handle: VoidPointer, ciphertext: ByteBufferType, nonce: ByteBufferType, tag: ByteBufferType, add: ByteBufferType, out: SecretBufferType): number
  askar_key_sign_message(handle: VoidPointer, message: ByteBufferType, sig_type: string, out: SecretBufferType): number
  askar_key_verify_signature(handle: VoidPointer, message: ByteBufferType, signature: ByteBufferType, sig_type: string, out: NumberPtr): number
  askar_key_wrap_key(handle: VoidPointer, cek_handle: VoidPointer, nonce: ByteBufferType, out: EncryptedBufferType): number
  askar_key_unwrap_key(handle: VoidPointer, alg: string, ciphertext: ByteBufferType, nonce: ByteBufferType, tag: ByteBufferType, out: object): number
  askar_key_crypto_box_random_nonce(out: SecretBufferType): number
  askar_key_crypto_box(recip_key: VoidPointer, sender_key: VoidPointer, message: ByteBufferType, nonce: ByteBufferType, out: SecretBufferType): number
  askar_key_crypto_box_open(recip_key: VoidPointer, sender_key: VoidPointer, message: ByteBufferType, nonce: ByteBufferType, out: SecretBufferType): number
  askar_key_crypto_box_seal(handle: VoidPointer, message: ByteBufferType, out: SecretBufferType): number
  askar_key_crypto_box_seal_open(handle: VoidPointer, ciphertext: ByteBufferType, out: SecretBufferType): number
  askar_key_derive_ecdh_es(alg: string, ephem_key: VoidPointer, recip_key: VoidPointer, alg_id: ByteBufferType, apu: ByteBufferType, apv: ByteBufferType, receive: number, out: object): number
  askar_key_derive_ecdh_1pu(alg: string, ephem_key: VoidPointer, sender_key: VoidPointer, recip_key: VoidPointer, alg_id: ByteBufferType, apu: ByteBufferType, apv: ByteBufferType, cc_tag: ByteBufferType, receive: number, out: object): number
  askar_key_get_supported_backends(out: object): number

  // Logging functions
  askar_set_custom_logger(context: VoidPointer, log: VoidPointer, enabled: VoidPointer, flush: VoidPointer, max_level: number): number
  askar_clear_custom_logger(): void
  askar_set_default_logger(): number
  askar_set_max_log_level(max_level: number): number

  // Migration functions
  askar_migrate_indy_sdk(spec_uri: string, wallet_name: string, wallet_key: string, kdf_level: string, cb: VoidPointer, cb_id: number): number

  // Version function
  askar_version(): string

  // Entry list functions - Entry list handles are void* (VoidPointer)
  askar_entry_list_count(handle: VoidPointer, count_out: NumberPtr): number
  askar_entry_list_get_category(handle: VoidPointer, index: number, category_out: StringPtr): number
  askar_entry_list_get_name(handle: VoidPointer, index: number, name_out: StringPtr): number
  askar_entry_list_get_value(handle: VoidPointer, index: number, value_out: SecretBufferType): number
  askar_entry_list_get_tags(handle: VoidPointer, index: number, tags_out: StringPtr): number
  askar_entry_list_free(handle: VoidPointer): void
  
  // Key entry list functions - Key entry list handles are void* (VoidPointer)
  askar_key_entry_list_count(handle: VoidPointer, count_out: NumberPtr): number
  askar_key_entry_list_free(handle: VoidPointer): void
  askar_key_entry_list_get_algorithm(handle: VoidPointer, index: number, alg_out: StringPtr): number
  askar_key_entry_list_get_name(handle: VoidPointer, index: number, name_out: StringPtr): number
  askar_key_entry_list_get_metadata(handle: VoidPointer, index: number, metadata_out: StringPtr): number
  askar_key_entry_list_get_tags(handle: VoidPointer, index: number, tags_out: StringPtr): number
  askar_key_entry_list_load_local(handle: VoidPointer, index: number, out: object): number
  
  // String list functions - String list handles are void* (VoidPointer)
  askar_string_list_count(handle: VoidPointer, count_out: NumberPtr): number
  askar_string_list_get_item(handle: VoidPointer, index: number, item_out: StringPtr): number
  askar_string_list_free(handle: VoidPointer): void

  // Buffer management
  askar_buffer_free(buffer: SecretBufferType): void

  // Store functions - Store handles are size_t (SizeHandle)
  askar_store_generate_raw_key(seed: ByteBufferType, out: unknown): number
  askar_store_provision(spec_uri: string, key_method: string, pass_key: string, profile: string | null, recreate: number, cb: VoidPointer, cb_id: number): number
  askar_store_open(spec_uri: string, key_method: string, pass_key: string, profile: string, cb: VoidPointer, cb_id: number): number
  askar_store_remove(spec_uri: string, cb: VoidPointer, cb_id: number): number
  askar_store_create_profile(handle: SizeHandle, profile: string, cb: VoidPointer, cb_id: number): number
  askar_store_get_profile_name(handle: SizeHandle, cb: VoidPointer, cb_id: number): number
  askar_store_list_profiles(handle: SizeHandle, cb: VoidPointer, cb_id: number): number
  askar_store_remove_profile(handle: SizeHandle, profile: string, cb: VoidPointer, cb_id: number): number
  askar_store_get_default_profile(handle: SizeHandle, cb: VoidPointer, cb_id: number): number
  askar_store_set_default_profile(handle: SizeHandle, profile: string, cb: VoidPointer, cb_id: number): number
  askar_store_rename_profile(handle: SizeHandle, from_profile: string, to_profile: string, cb: VoidPointer, cb_id: number): number // Function not available in current DLL
  askar_store_rekey(handle: SizeHandle, key_method: string, pass_key: string, cb: VoidPointer, cb_id: number): number
  askar_store_copy(handle: SizeHandle, target_uri: string, key_method: string, pass_key: string, recreate: number, cb: VoidPointer, cb_id: number): number
  askar_store_copy_profile(from_handle: SizeHandle, to_handle: SizeHandle, from_profile: string, to_profile: string, cb: VoidPointer, cb_id: number): number // Function not available in current DLL
  askar_store_close(handle: SizeHandle, cb: VoidPointer, cb_id: number): number
  
  // Scan functions - Scan handles are size_t (SizeHandle)
  askar_scan_start(handle: SizeHandle, profile: string, category: string, tag_filter: string, offset: number, limit: number, order_by: string, descending: number, cb: VoidPointer, cb_id: number): number
  askar_scan_next(handle: SizeHandle, cb: VoidPointer, cb_id: number): number
  askar_scan_free(handle: SizeHandle): number

  // Session functions - Session handles are size_t (SizeHandle)
  askar_session_start(handle: SizeHandle, profile: string, as_transaction: number, cb: VoidPointer, cb_id: number): number
  askar_session_count(handle: SizeHandle, category: string, tag_filter: string, cb: VoidPointer, cb_id: number): number
  askar_session_fetch(handle: SizeHandle, category: string, name: string, for_update: number, cb: VoidPointer, cb_id: number): number
  askar_session_fetch_all(handle: SizeHandle, category: string, tag_filter: string, limit: number, order_by: string, descending: number, for_update: number, cb: VoidPointer, cb_id: number): number
  askar_session_remove_all(handle: SizeHandle, category: string, tag_filter: string, cb: VoidPointer, cb_id: number): number
  askar_session_update(handle: SizeHandle, operation: number, category: string, name: string, value: ByteBufferType, tags: string, expiry_ms: number, cb: VoidPointer, cb_id: number): number
  askar_session_insert_key(handle: SizeHandle, key_handle: VoidPointer, name: string, metadata: string, tags: string, expiry_ms: number, cb: VoidPointer, cb_id: number): number
  askar_session_fetch_key(handle: SizeHandle, name: string, for_update: number, cb: VoidPointer, cb_id: number): number
  askar_session_fetch_all_keys(handle: SizeHandle, alg: string, thumbprint: string, tag_filter: string, limit: number, for_update: number, cb: VoidPointer, cb_id: number): number
  askar_session_update_key(handle: SizeHandle, name: string, metadata: string, tags: string, expiry_ms: number, cb: VoidPointer, cb_id: number): number
  askar_session_remove_key(handle: SizeHandle, name: string, cb: VoidPointer, cb_id: number): number
  askar_session_close(handle: SizeHandle, commit: number, cb: VoidPointer, cb_id: number): number
}
