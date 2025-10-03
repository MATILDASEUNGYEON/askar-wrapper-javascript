

export const nativeBindings = {
  askar_get_current_error:
    "int64_t askar_get_current_error(_Out_ string *error_json_p_out)",

  askar_key_generate:
    "int64_t askar_key_generate(const char *alg, const char *key_backend, int8 ephemeral, _Out_ void **out)",
  askar_key_from_seed:
    "int64_t askar_key_from_seed(const char *alg, ByteBuffer seed, const char *method, _Out_ void **out)",
  askar_key_from_jwk:
    "int64_t askar_key_from_jwk(ByteBuffer jwk, _Out_ void **out)",
  askar_key_from_public_bytes:
    "int64_t askar_key_from_public_bytes(const char *alg, ByteBuffer public_bytes, _Out_ void **out)",
  askar_key_get_public_bytes:
    "int64_t askar_key_get_public_bytes(void *handle, _Out_ SecretBuffer *out)",
  askar_key_from_secret_bytes:
    "int64_t askar_key_from_secret_bytes(const char *alg, ByteBuffer secret, _Out_ void **out)",
  askar_key_get_secret_bytes:
    "int64_t askar_key_get_secret_bytes(void *handle, _Out_ SecretBuffer *out)",
  askar_key_convert:
    "int64_t askar_key_convert(void *handle, const char *alg, _Out_ void **out)",
  askar_key_from_key_exchange:
    "int64_t askar_key_from_key_exchange(const char *alg, void *sk_handle, void *pk_handle, _Out_ void **out)",
  askar_key_free: "void askar_key_free(void *handle)",
  askar_key_get_algorithm:
    "int64_t askar_key_get_algorithm(void *handle, _Out_ string *out)",
  askar_key_get_ephemeral:
    "int64_t askar_key_get_ephemeral(void *handle, _Out_ int8 *out)",

  askar_key_get_jwk_public:
    "int64_t askar_key_get_jwk_public(void *handle, const char *alg, _Out_ string *out)",
  askar_key_get_jwk_secret:
    "int64_t askar_key_get_jwk_secret(void *handle, _Out_ SecretBuffer *out)",
  askar_key_get_jwk_thumbprint:
    "int64_t askar_key_get_jwk_thumbprint(void *handle, const char *alg, _Out_ string *out)",

  askar_key_aead_random_nonce:
    "int64_t askar_key_aead_random_nonce(void *handle, _Out_ SecretBuffer *out)",
  askar_key_aead_get_params:
    "int64_t askar_key_aead_get_params(void *handle, _Out_ AeadParams *out)",
  askar_key_aead_get_padding:
    "int64_t askar_key_aead_get_padding(void *handle, int64 msg_len, _Out_ int32 *out)",
  askar_key_aead_encrypt:
    "int64_t askar_key_aead_encrypt(void *handle, ByteBuffer message, ByteBuffer nonce, ByteBuffer aad, _Out_ EncryptedBuffer *out)",
  askar_key_aead_decrypt:
    "int64_t askar_key_aead_decrypt(void *handle, ByteBuffer ciphertext, ByteBuffer nonce, ByteBuffer tag, ByteBuffer aad, _Out_ SecretBuffer *out)",

  askar_key_sign_message:
    "int64_t askar_key_sign_message(void *handle, ByteBuffer message, const char *sig_type, _Out_ SecretBuffer *out)",
  askar_key_verify_signature:
    "int64_t askar_key_verify_signature(void *handle, ByteBuffer message, ByteBuffer signature, const char *sig_type, _Out_ int8 *out)",
  askar_key_wrap_key:
    "int64_t askar_key_wrap_key(void *handle, void *other, ByteBuffer nonce, _Out_ EncryptedBuffer *out)",
  askar_key_unwrap_key:
    "int64_t askar_key_unwrap_key(void *handle, const char *alg, ByteBuffer ciphertext, ByteBuffer nonce, ByteBuffer tag, _Out_ void **out)",

  askar_key_crypto_box_random_nonce:
    "int64_t askar_key_crypto_box_random_nonce(_Out_ SecretBuffer *out)",
  askar_key_crypto_box:
    "int64_t askar_key_crypto_box(void *recip_key, void *sender_key, ByteBuffer message, ByteBuffer nonce, _Out_ SecretBuffer *out)",
  askar_key_crypto_box_open:
    "int64_t askar_key_crypto_box_open(void *recip_key, void *sender_key, ByteBuffer message, ByteBuffer nonce, _Out_ SecretBuffer *out)",
  askar_key_crypto_box_seal:
    "int64_t askar_key_crypto_box_seal(void *handle, ByteBuffer message, _Out_ SecretBuffer *out)",
  askar_key_crypto_box_seal_open:
    "int64_t askar_key_crypto_box_seal_open(void *handle, ByteBuffer ciphertext, _Out_ SecretBuffer *out)",
  askar_key_derive_ecdh_es:
    "int64_t askar_key_derive_ecdh_es(const char *alg, void *ephem_key, void *recip_key, ByteBuffer alg_id, ByteBuffer apu, ByteBuffer apv, int8 receive, _Out_ void **out)",
  askar_key_derive_ecdh_1pu:
    "int64_t askar_key_derive_ecdh_1pu(const char *alg, void *ephem_key, void *sender_key, void *recip_key, ByteBuffer alg_id, ByteBuffer apu, ByteBuffer apv, ByteBuffer cc_tag, int8 receive, _Out_ void **out)",
  askar_key_get_supported_backends:
    "int64_t askar_key_get_supported_backends(_Out_ void **out)",

  askar_set_custom_logger:
    "int64_t askar_set_custom_logger(void *context, void *log, void *enabled, void *flush, int32 max_level)",
  askar_clear_custom_logger: "void askar_clear_custom_logger()",
  askar_set_default_logger: "int64_t askar_set_default_logger()",
  askar_set_max_log_level: "int64_t askar_set_max_log_level(int32 max_level)",

  askar_migrate_indy_sdk:
    "int64_t askar_migrate_indy_sdk(const char *spec_uri, const char *wallet_name, const char *wallet_key, const char *kdf_level, void *cb, int64 cb_id)",

  askar_version: "const char *askar_version()",

  askar_entry_list_count:
    "int64_t askar_entry_list_count(void *handle, _Out_ int32 *count_out)",
  askar_entry_list_get_category:
    "int64_t askar_entry_list_get_category(void *handle, int32 index, _Out_ string *category_out)",
  askar_entry_list_get_name:
    "int64_t askar_entry_list_get_name(void *handle, int32 index, _Out_ string *name_out)",
  askar_entry_list_get_value:
    "int64_t askar_entry_list_get_value(void *handle, int32 index, _Out_ SecretBuffer *value_out)",
  askar_entry_list_get_tags:
    "int64_t askar_entry_list_get_tags(void *handle, int32 index, _Out_ string *tags_out)",
  askar_entry_list_free: "void askar_entry_list_free(void *handle)",
  
  askar_key_entry_list_count:
    "int64_t askar_key_entry_list_count(void *handle, _Out_ int32 *count_out)",
  askar_key_entry_list_free: "void askar_key_entry_list_free(void *handle)",
  askar_key_entry_list_get_algorithm:
    "int64_t askar_key_entry_list_get_algorithm(void *handle, int32 index, _Out_ string *alg_out)",
  askar_key_entry_list_get_name:
    "int64_t askar_key_entry_list_get_name(void *handle, int32 index, _Out_ string *name_out)",
  askar_key_entry_list_get_metadata:
    "int64_t askar_key_entry_list_get_metadata(void *handle, int32 index, _Out_ string *metadata_out)",
  askar_key_entry_list_get_tags:
    "int64_t askar_key_entry_list_get_tags(void *handle, int32 index, _Out_ string *tags_out)",
  askar_key_entry_list_load_local:
    "int64_t askar_key_entry_list_load_local(void *handle, int32 index, _Out_ void **out)",

  askar_string_list_count:
    "int64_t askar_string_list_count(void *handle, _Out_ int32 *count_out)",
  askar_string_list_get_item:
    "int64_t askar_string_list_get_item(void *handle, int32 index, _Out_ string *item_out)",
  askar_string_list_free: "void askar_string_list_free(void *handle)",
  askar_buffer_free: "void askar_buffer_free(SecretBuffer buffer)",

  askar_store_generate_raw_key:
    "int64_t askar_store_generate_raw_key(ByteBuffer seed, _Out_ string *out)",
  
  askar_store_provision:
    "int64_t askar_store_provision(const char *spec_uri, const char *key_method, const char *pass_key, const char *profile, int8_t recreate, void *cb, int64_t cb_id)",
  askar_store_open:
    "int64_t askar_store_open(const char *spec_uri, const char *key_method, const char *pass_key, const char *profile, void *cb, uint32_t cb_id)",

  askar_store_remove:
    "int64_t askar_store_remove(const char *spec_uri, void *cb, uint32_t cb_id)",

  askar_store_create_profile:
    "int64_t askar_store_create_profile(uint32_t handle, const char *profile, void *cb, uint32_t cb_id)",

  askar_store_get_profile_name:
    "int64_t askar_store_get_profile_name(uint32_t handle, void *cb, uint32_t cb_id)",

  askar_store_list_profiles:
    "int64_t askar_store_list_profiles(uint32_t handle, void *cb, uint32_t cb_id)",

  askar_store_remove_profile:
    "int64_t askar_store_remove_profile(uint32_t handle, const char *profile, void *cb, uint32_t cb_id)",

  askar_store_get_default_profile:
    "int64_t askar_store_get_default_profile(uint32_t handle, void *cb, uint32_t cb_id)",

  askar_store_set_default_profile:
    "int64_t askar_store_set_default_profile(uint32_t handle, const char *profile, void *cb, uint32_t cb_id)",

  askar_store_rekey:
    "int64_t askar_store_rekey(uint32_t handle, const char *key_method, const char *pass_key, void *cb, uint32_t cb_id)",

  askar_store_copy:
    "int64_t askar_store_copy(uint32_t handle, const char *target_uri, const char *key_method, const char *pass_key, int8_t recreate, void *cb, uint32_t cb_id)",

  askar_store_close:
    "int64_t askar_store_close(uint32_t handle, void *cb, uint32_t cb_id)",

  askar_scan_start:
    "int64_t askar_scan_start(uint32_t handle, const char *profile, const char *category, const char *tag_filter, int64_t offset, int64_t limit, const char *order_by, int8_t descending, void *cb, uint32_t cb_id)",

  askar_scan_next:
    "int64_t askar_scan_next(uint32_t handle, void *cb, uint32_t cb_id)",

  askar_scan_free: "int64_t askar_scan_free(uint32_t handle)",

  askar_session_start:
    "int64_t askar_session_start(uint32_t handle, const char *profile, int8_t as_transaction, void *cb, uint32_t cb_id)",

  askar_session_count:
    "int64_t askar_session_count(size_t handle, const char *category, const char *tag_filter, void *cb, uint32_t cb_id)",

  askar_session_fetch:
    "int64_t askar_session_fetch(size_t handle, const char *category, const char *name, int8_t for_update, void *cb, uint32_t cb_id)",

  askar_session_fetch_all:
    "int64_t askar_session_fetch_all(size_t handle, const char *category, const char *tag_filter, int64_t limit, const char *order_by, int8_t descending, int8_t for_update, void *cb, uint32_t cb_id)",

  askar_session_remove_all:
    "int64_t askar_session_remove_all(size_t handle, const char *category, const char *tag_filter, void *cb, uint32_t cb_id)",

  askar_session_update:
    "int64_t askar_session_update(size_t handle, int8_t operation, const char *category, const char *name, ByteBuffer value, const char *tags, int64_t expiry_ms, void *cb, uint32_t cb_id)",

  askar_session_insert_key:
    "int64_t askar_session_insert_key(size_t handle, void *key_handle, const char *name, const char *metadata, const char *tags, int64_t expiry_ms, void *cb, uint32_t cb_id)",

  askar_session_fetch_key:
    "int64_t askar_session_fetch_key(size_t handle, const char *name, int8_t for_update, void *cb, uint32_t cb_id)",

  askar_session_fetch_all_keys:
    "int64_t askar_session_fetch_all_keys(size_t handle, const char *alg, const char *thumbprint, const char *tag_filter, int64_t limit, int8_t for_update, void *cb, uint32_t cb_id)",

  askar_session_update_key:
    "int64_t askar_session_update_key(size_t handle, const char *name, const char *metadata, const char *tags, int64_t expiry_ms, void *cb, uint32_t cb_id)",

  askar_session_remove_key:
    "int64_t askar_session_remove_key(size_t handle, const char *name, void *cb, uint32_t cb_id)",

  askar_session_close:
    "int64_t askar_session_close(size_t handle, int8_t commit, void *cb, uint32_t cb_id)",
};
