const { Key, KeyAlgorithm } = require('@openwallet-foundation/askar-shared');

console.log('=== JWK Debug Test ===');

try {
  // Key 생성
  console.log('1. Generating key...');
  const key = Key.generate(KeyAlgorithm.EcSecp256r1);
  console.log('Key generated successfully');

  // JWK public 가져오기
  console.log('2. Getting JWK public...');
  const jwkPublic = key.jwkPublic;
  console.log('JWK Public:', jwkPublic);
  console.log('JWK Public JSON:', JSON.stringify(jwkPublic));

  // JWK로부터 Key 생성 시도
  console.log('3. Creating key from JWK...');
  const keyFromJwk = Key.fromJwk({ jwk: jwkPublic });
  console.log('Key from JWK created successfully');

  key.handle.free();
  keyFromJwk.handle.free();
} catch (error) {
  console.error('Error:', error);
  console.error('Error code:', error.code);
  console.error('Stack:', error.stack);
}
