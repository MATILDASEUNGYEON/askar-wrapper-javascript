import { NativeStoreProvisionCallback } from "../ffi/callback";

export const nativeBindings = {
  // error.rs(테스트완료)
  askar_get_current_error:
    "uint askar_get_current_error(_Out_ const char **error_json_p_out)", //OK

  //key.rs
  askar_key_generate:
    "uint askar_key_generate(const char *alg, const char *key_backend, int8 ephemeral, _Out_ void **out)", //OK
  askar_key_from_seed:
    "uint askar_key_from_seed(const char *alg, ByteBuffer seed, const char *method, _Out_ void **out)", //OK
  askar_key_from_jwk:
    "uint askar_key_from_jwk(ByteBuffer jwk, _Out_ void **out)", //OK
  askar_key_from_public_bytes:
    "uint askar_key_from_public_bytes(const char *alg, ByteBuffer public_bytes, _Out_ void **out)", //OK
  askar_key_get_public_bytes:
    "uint askar_key_get_public_bytes(void *handle, _Out_ SecretBuffer *out)", //OK
  askar_key_from_secret_bytes:
    "uint askar_key_from_secret_bytes(const char *alg, ByteBuffer secret, _Out_ void **out)", //OK
  askar_key_get_secret_bytes:
    "uint askar_key_get_secret_bytes(void *handle, _Out_ SecretBuffer *out)", //OK
  askar_key_convert:
    "uint askar_key_convert(void *handle, const char *alg, _Out_ void **out)", //OK
  askar_key_from_key_exchange:
    "uint askar_key_from_key_exchange(const char *alg, void *sk_handle, void *pk_handle, _Out_ void **out)", //OK
  askar_key_free: "void askar_key_free(void *handle)", //OK
  askar_key_get_algorithm:
    "uint askar_key_get_algorithm(void *handle, _Out_ const char **out)", //OK
  askar_key_get_ephemeral:
    "uint askar_key_get_ephemeral(void *handle, _Out_ int8 *out)", //OK

  askar_key_get_jwk_public:
    "uint askar_key_get_jwk_public(void *handle, const char *alg, _Out_ const char **out)", //OK
  askar_key_get_jwk_secret:
    "uint askar_key_get_jwk_secret(void *handle, _Out_ SecretBuffer *out)", //OK
  askar_key_get_jwk_thumbprint:
    "uint askar_key_get_jwk_thumbprint(void *handle, const char *alg, _Out_ const char **out)", //OK

  askar_key_aead_random_nonce:
    "uint askar_key_aead_random_nonce(void *handle, _Out_ SecretBuffer *out)", //OK
  askar_key_aead_get_params:
    "uint askar_key_aead_get_params(void *handle, _Out_ AeadParams *out)", //OK
  askar_key_aead_get_padding:
    "uint askar_key_aead_get_padding(void *handle, int64 msg_len, _Out_ int32 *out)", //OK
  askar_key_aead_encrypt:
    "uint askar_key_aead_encrypt(void *handle, ByteBuffer message, ByteBuffer nonce, ByteBuffer aad, _Out_ EncryptedBuffer *out)", //OK
  askar_key_aead_decrypt:
    "uint askar_key_aead_decrypt(void *handle, ByteBuffer ciphertext, ByteBuffer nonce, ByteBuffer tag, ByteBuffer aad, _Out_ SecretBuffer *out)", //OK

  askar_key_sign_message:
    "uint askar_key_sign_message(void *handle, ByteBuffer message, const char *sig_type, _Out_ SecretBuffer *out)", //OK
  askar_key_verify_signature:
    "uint askar_key_verify_signature(void *handle, ByteBuffer message, ByteBuffer signature, const char *sig_type, _Out_ int8 *out)", //OK
  askar_key_wrap_key:
    "uint askar_key_wrap_key(void *handle, void *other, ByteBuffer nonce, _Out_ EncryptedBuffer *out)", //OK
  askar_key_unwrap_key:
    "uint askar_key_unwrap_key(void *handle, const char *alg, ByteBuffer ciphertext, ByteBuffer nonce, ByteBuffer tag, _Out_ void **out)", //OK

  askar_key_crypto_box_random_nonce:
    "uint askar_key_crypto_box_random_nonce(_Out_ SecretBuffer *out)", //OK
  askar_key_crypto_box:
    "uint askar_key_crypto_box(void *recip_key, void *sender_key, ByteBuffer message, ByteBuffer nonce, _Out_ SecretBuffer *out)", //OK
  askar_key_crypto_box_open:
    "uint askar_key_crypto_box_open(void *recip_key, void *sender_key, ByteBuffer message, ByteBuffer nonce, _Out_ SecretBuffer *out)", //OK
  askar_key_crypto_box_seal:
    "uint askar_key_crypto_box_seal(void *handle, ByteBuffer message, _Out_ SecretBuffer *out)", //OK
  askar_key_crypto_box_seal_open:
    "uint askar_key_crypto_box_seal_open(void *handle, ByteBuffer ciphertext, _Out_ SecretBuffer *out)", //OK
  askar_key_derive_ecdh_es:
    "uint askar_key_derive_ecdh_es(const char *alg, void *ephem_key, void *recip_key, ByteBuffer alg_id, ByteBuffer apu, ByteBuffer apv, int8 receive, _Out_ void **out)", //OK
  askar_key_derive_ecdh_1pu:
    "uint askar_key_derive_ecdh_1pu(const char *alg, void *ephem_key, void *sender_key, void *recip_key, ByteBuffer alg_id, ByteBuffer apu, ByteBuffer apv, ByteBuffer cc_tag, int8 receive, _Out_ void **out)", //OK
  askar_key_get_supported_backends:
    "uint askar_key_get_supported_backends(_Out_ void **out)", //OK

  //log.rs
  askar_set_custom_logger:
    "uint askar_set_custom_logger(void *context, void *log, void *enabled, void *flush, int32 max_level)", //OK
  askar_clear_custom_logger: "void askar_clear_custom_logger()", //OK
  askar_set_default_logger: "uint askar_set_default_logger()", //OK
  askar_set_max_log_level: "uint askar_set_max_log_level(int32 max_level)", //OK

  //migration.rs
  askar_migrate_indy_sdk:
    "uint askar_migrate_indy_sdk(const char *spec_uri, const char *wallet_name, const char *wallet_key, const char *kdf_level, void *cb, int64 cb_id)", //OK

  //mod.rs
  askar_version: "const char *askar_version()", //OK

  // result_list.rs
  askar_entry_list_count:
    "uint askar_entry_list_count(void *handle, _Out_ int32 *count_out)", //OK
  askar_entry_list_get_category:
    "uint askar_entry_list_get_category(void *handle, int32 index, _Out_ const char **category_out)", //OK
  askar_entry_list_get_name:
    "uint askar_entry_list_get_name(void *handle, int32 index, _Out_ const char **name_out)", //OK
  askar_entry_list_get_value:
    "uint askar_entry_list_get_value(void *handle, int32 index, _Out_ SecretBuffer *value_out)", //OK
  askar_entry_list_get_tags:
    "uint askar_entry_list_get_tags(void *handle, int32 index, _Out_ const char **tags_out)", //OK
  askar_entry_list_free: "void askar_entry_list_free(void *handle)", //OK
  //여기까지
  askar_key_entry_list_count:
    "uint askar_key_entry_list_count(void *handle, _Out_ int32 *count_out)", //OK
  askar_key_entry_list_free: "void askar_key_entry_list_free(void *handle)", //OK
  askar_key_entry_list_get_algorithm:
    "uint askar_key_entry_list_get_algorithm(void *handle, int32 index, _Out_ const char **alg_out)", //OK
  askar_key_entry_list_get_name:
    "uint askar_key_entry_list_get_name(void *handle, int32 index, _Out_ const char **name_out)", //OK
  askar_key_entry_list_get_metadata:
    "uint askar_key_entry_list_get_metadata(void *handle, int32 index, _Out_ const char **metadata_out)", //OK
  askar_key_entry_list_get_tags:
    "uint askar_key_entry_list_get_tags(void *handle, int32 index, _Out_ const char **tags_out)", //OK
  askar_key_entry_list_load_local:
    "uint askar_key_entry_list_load_local(void *handle, int32 index, _Out_ void **out)", //OK

  askar_string_list_count:
    "uint askar_string_list_count(void *handle, _Out_ int32 *count_out)", //OK
  askar_string_list_get_item:
    "uint askar_string_list_get_item(void *handle, int32 index, _Out_ const char **item_out)", //OK
  askar_string_list_free: "void askar_string_list_free(void *handle)", //OK

  //secret.rs
  askar_buffer_free: "void askar_buffer_free(SecretBuffer buffer)",

  // --- store.rs : sync (out string) -----------------------------------------
  // ErrorCode askar_store_generate_raw_key(ByteBuffer seed, const char **out)
  askar_store_generate_raw_key:
    "uint32_t askar_store_generate_raw_key(ByteBuffer seed, _Out_ const char **out)",

  // --- store.rs : async (cb + cb_id) ----------------------------------------
  // ErrorCode askar_store_provision(
  //   const char *spec_uri, const char *key_method, const char *pass_key, const char *profile,
  //   int8_t recreate,
  //   void *cb,
  //   uint32_t cb_id
  // )
  askar_store_provision:
    "uint32_t askar_store_provision(const char *spec_uri, const char *key_method, const char *pass_key, const char *profile, int8_t recreate, void *cb, int64_t cb_id)",

  // ErrorCode askar_store_open( ... , void *cb, cb_id )
  askar_store_open:
    "uint32_t askar_store_open(const char *spec_uri, const char *key_method, const char *pass_key, const char *profile, void *cb, uint32_t cb_id)",

  // ErrorCode askar_store_remove(const char *spec_uri, void *cb, cb_id)
  askar_store_remove:
    "uint32_t askar_store_remove(const char *spec_uri, void *cb, uint32_t cb_id)",

  // ErrorCode askar_store_create_profile(uint32_t handle, const char *profile, void *cb, cb_id)
  askar_store_create_profile:
    "uint32_t askar_store_create_profile(uint32_t handle, const char *profile, void *cb, uint32_t cb_id)",

  // ErrorCode askar_store_get_profile_name(uint32_t handle, void *cb, cb_id)
  askar_store_get_profile_name:
    "uint32_t askar_store_get_profile_name(uint32_t handle, void *cb, uint32_t cb_id)",

  // ErrorCode askar_store_list_profiles(uint32_t handle, void *cb, cb_id)
  askar_store_list_profiles:
    "uint32_t askar_store_list_profiles(uint32_t handle, void *cb, uint32_t cb_id)",

  // ErrorCode askar_store_remove_profile(uint32_t handle, const char *profile, void *cb, cb_id)
  askar_store_remove_profile:
    "uint32_t askar_store_remove_profile(uint32_t handle, const char *profile, void *cb, uint32_t cb_id)",

  // ErrorCode askar_store_get_default_profile(uint32_t handle, void *cb, cb_id)
  askar_store_get_default_profile:
    "uint32_t askar_store_get_default_profile(uint32_t handle, void *cb, uint32_t cb_id)",

  // ErrorCode askar_store_set_default_profile(uint32_t handle, const char *profile, void *cb, cb_id)
  askar_store_set_default_profile:
    "uint32_t askar_store_set_default_profile(uint32_t handle, const char *profile, void *cb, uint32_t cb_id)",

  // ErrorCode askar_store_rename_profile(uint32_t handle, const char *from_profile, const char *to_profile, void *cb, cb_id)
  // askar_store_rename_profile:
  //   "uint32_t askar_store_rename_profile(uint32_t handle, const char *from_profile, const char *to_profile, void *cb, uint32_t cb_id)",

  // ErrorCode askar_store_rekey(uint32_t handle, const char *key_method, const char *pass_key, void *cb, cb_id)
  askar_store_rekey:
    "uint32_t askar_store_rekey(uint32_t handle, const char *key_method, const char *pass_key, void *cb, uint32_t cb_id)",

  // ErrorCode askar_store_copy(uint32_t handle, const char *target_uri, const char *key_method, const char *pass_key, int8_t recreate, void *cb, cb_id)
  askar_store_copy:
    "uint32_t askar_store_copy(uint32_t handle, const char *target_uri, const char *key_method, const char *pass_key, int8_t recreate, void *cb, uint32_t cb_id)",

  // ErrorCode askar_store_copy_profile(uint32_t from_handle, uint32_t to_handle, const char *from_profile, const char *to_profile, void *cb, cb_id)
  // askar_store_copy_profile:
  //   "uint32_t askar_store_copy_profile(uint32_t from_handle, uint32_t to_handle, const char *from_profile, const char *to_profile, void *cb, uint32_t cb_id)",

  // ErrorCode askar_store_close(uint32_t handle, void *cb, cb_id)  // cb는 null 가능
  askar_store_close:
    "uint32_t askar_store_close(uint32_t handle, void *cb, uint32_t cb_id)",

  // --- scan APIs -------------------------------------------------------------
  // ErrorCode askar_scan_start(uint32_t store_handle, const char *profile, const char *category, const char *tag_filter,
  //   int64_t offset, int64_t limit, const char *order_by, int8_t descending,
  //   void *cb, cb_id)
  askar_scan_start:
    "uint32_t askar_scan_start(uint32_t handle, const char *profile, const char *category, const char *tag_filter, int64_t offset, int64_t limit, const char *order_by, int8_t descending, void *cb, uint32_t cb_id)",

  // ErrorCode askar_scan_next(uint32_t scan_handle, void *cb, cb_id)
  askar_scan_next:
    "uint32_t askar_scan_next(uint32_t handle, void *cb, uint32_t cb_id)",

  // ErrorCode askar_scan_free(uint32_t scan_handle)
  askar_scan_free: "uint32_t askar_scan_free(uint32_t handle)",

  // --- session APIs ----------------------------------------------------------
  // ErrorCode askar_session_start(uint32_t store_handle, const char *profile, int8_t as_transaction,
  //   void *cb, cb_id)
  askar_session_start:
    "uint32_t askar_session_start(uint32_t handle, const char *profile, int8_t as_transaction, void *cb, uint32_t cb_id)",

  // ErrorCode askar_session_count(uint32_t session_handle, const char *category, const char *tag_filter, void *cb, cb_id)
  askar_session_count:
    "uint32_t askar_session_count(uint32_t handle, const char *category, const char *tag_filter, void *cb, uint32_t cb_id)",

  // ErrorCode askar_session_fetch(uint32_t session_handle, const char *category, const char *name, int8_t for_update, void *cb, cb_id)
  askar_session_fetch:
    "uint32_t askar_session_fetch(uint32_t handle, const char *category, const char *name, int8_t for_update, void *cb, uint32_t cb_id)",

  // ErrorCode askar_session_fetch_all(uint32_t session_handle, const char *category, const char *tag_filter, int64_t limit, const char *order_by, int8_t descending, int8_t for_update, void *cb, cb_id)
  askar_session_fetch_all:
    "uint32_t askar_session_fetch_all(uint32_t handle, const char *category, const char *tag_filter, int64_t limit, const char *order_by, int8_t descending, int8_t for_update, void *cb, uint32_t cb_id)",

  // ErrorCode askar_session_remove_all(uint32_t session_handle, const char *category, const char *tag_filter, void *cb, cb_id)
  askar_session_remove_all:
    "uint32_t askar_session_remove_all(uint32_t handle, const char *category, const char *tag_filter, void *cb, uint32_t cb_id)",

  // ErrorCode askar_session_update(uint32_t session_handle, int8_t operation, const char *category, const char *name, ByteBuffer value, const char *tags, int64_t expiry_ms, void *cb, cb_id)
  askar_session_update:
    "uint32_t askar_session_update(uint32_t handle, int8_t operation, const char *category, const char *name, ByteBuffer value, const char *tags, int64_t expiry_ms, void *cb, uint32_t cb_id)",

  // ErrorCode askar_session_insert_key(uint32_t session_handle, uint32_t key_handle /* LocalKeyHandle */, const char *name, const char *metadata, const char *tags, int64_t expiry_ms, void *cb, cb_id)
  askar_session_insert_key:
    "uint32_t askar_session_insert_key(uint32_t handle, uint32_t key_handle, const char *name, const char *metadata, const char *tags, int64_t expiry_ms, void *cb, uint32_t cb_id)",

  // ErrorCode askar_session_fetch_key(uint32_t session_handle, const char *name, int8_t for_update, void *cb, cb_id)
  askar_session_fetch_key:
    "uint32_t askar_session_fetch_key(uint32_t handle, const char *name, int8_t for_update, void *cb, uint32_t cb_id)",

  // ErrorCode askar_session_fetch_all_keys(uint32_t session_handle, const char *alg, const char *thumbprint, const char *tag_filter, int64_t limit, int8_t for_update, void *cb, cb_id)
  askar_session_fetch_all_keys:
    "uint32_t askar_session_fetch_all_keys(uint32_t handle, const char *alg, const char *thumbprint, const char *tag_filter, int64_t limit, int8_t for_update, void *cb, uint32_t cb_id)",

  // ErrorCode askar_session_update_key(uint32_t session_handle, const char *name, const char *metadata, const char *tags, int64_t expiry_ms, void *cb, cb_id)
  askar_session_update_key:
    "uint32_t askar_session_update_key(uint32_t handle, const char *name, const char *metadata, const char *tags, int64_t expiry_ms, void *cb, uint32_t cb_id)",

  // ErrorCode askar_session_remove_key(uint32_t session_handle, const char *name, void *cb, cb_id)
  askar_session_remove_key:
    "uint32_t askar_session_remove_key(uint32_t handle, const char *name, void *cb, uint32_t cb_id)",

  // ErrorCode askar_session_close(uint32_t session_handle, int8_t commit, void *cb, cb_id)
  askar_session_close:
    "uint32_t askar_session_close(uint32_t handle, int8_t commit, void *cb, uint32_t cb_id)",
};
