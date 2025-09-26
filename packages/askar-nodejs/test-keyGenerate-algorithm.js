// test-keyGenerate-algorithm.js
const { NodeJSAskar } = require('./src/NodeJSAskar')

console.log('Testing keyGenerate, keyGetAlgorithm, and keyFree functions...')

try {
  const askar = new NodeJSAskar()
  console.log('✅ NodeJSAskar instance created')
  
  console.log('Version:', askar.version())
  
  const currentError = askar.getCurrentError()
  console.log('Current error before test:', currentError)
  
  // 키 생성 테스트
  console.log('Attempting to generate key...')
  const key = askar.keyGenerate({
    algorithm: 'ed25519',
    ephemeral: false,
    keyBackend: 'software'
  })
  
  console.log('✅ Key generated successfully:')
  console.log('Key type:', typeof key)
  console.log('Key handle:', key.handle)
  
  // 키 알고리즘 조회 테스트
  console.log('Attempting to get key algorithm...')
  const algorithm = askar.keyGetAlgorithm({ localKeyHandle: key })
  console.log('✅ Key algorithm:', algorithm)
  
  // 키 해제 테스트
  console.log('Attempting to free key...')
  askar.keyFree({ localKeyHandle: key })
  console.log('✅ Key freed successfully')
  
  // keyFromSeed 테스트 추가
  console.log('\n--- Testing keyFromSeed ---')
  console.log('Attempting to create key from seed...')
  
  // 32바이트 시드 생성 (ed25519용)
  const seed = Buffer.alloc(32)
  for (let i = 0; i < 32; i++) {
    seed[i] = i % 256
  }
  
  // 테스트 1: method가 빈 문자열
  console.log('Test 1: method = ""')
  const keyFromSeed = askar.keyFromSeed({
    algorithm: 'ed25519',
    seed: seed,
    method: '' // 빈 문자열 사용
  })
  
  console.log('✅ Key created from seed successfully:')
  console.log('Key type:', typeof keyFromSeed)
  console.log('Key handle:', keyFromSeed.handle)
  
  // 시드로 생성한 키의 알고리즘 확인
  const seedKeyAlgorithm = askar.keyGetAlgorithm({ localKeyHandle: keyFromSeed })
  console.log('✅ Seed key algorithm:', seedKeyAlgorithm)
  
  // 시드 키 해제
  askar.keyFree({ localKeyHandle: keyFromSeed })
  console.log('✅ Seed key freed successfully')
  
  // 테스트 2: method가 null인 경우 (선택적 매개변수 테스트)
  console.log('\nTest 2: method = null (converted to null string)')
  try {
    const keyFromSeed2 = askar.keyFromSeed({
      algorithm: 'ed25519',
      seed: seed,
      method: null // null 사용
    })
    console.log('✅ Key created with null method')
    const algorithm2 = askar.keyGetAlgorithm({ localKeyHandle: keyFromSeed2 })
    console.log('✅ Algorithm:', algorithm2)
    askar.keyFree({ localKeyHandle: keyFromSeed2 })
    console.log('✅ Key freed')
  } catch (error) {
    console.log('⚠️  Null method test result:', error.message)
  }
  
  const currentErrorAfter = askar.getCurrentError()
  console.log('Current error after test:', currentErrorAfter)
  
  // keyFromJwk 테스트 추가
  console.log('\n--- Testing keyFromJwk ---')
  console.log('Attempting to create key from JWK...')
  
  // ed25519 JWK 생성 (테스트용)
  // 먼저 키를 생성해서 JWK로 내보낸 다음, 그것을 다시 불러오는 테스트
  console.log('Step 1: Generate a key to get JWK')
  const tempKey = askar.keyGenerate({
    algorithm: 'ed25519',
    ephemeral: false,
    keyBackend: 'software'
  })
  console.log('✅ Temporary key generated for JWK export')
  
  // TODO: JWK 내보내기가 구현되면 실제 JWK를 얻어서 테스트
  // 지금은 샘플 ed25519 JWK 사용
  const sampleJwk = {
    "kty": "OKP",
    "crv": "Ed25519",
    "x": "11qYAYKxCrfVS_7TyWQHOg7hcvPapiMlrwIaaPcHURo",
    "d": "nWGxne_9WmC6hEr0kuwsxERJxWl7MmkZcDusAxyuf2A"
  }
  
  try {
    const jwkBuffer = Buffer.from(JSON.stringify(sampleJwk), 'utf-8')
    console.log('JWK buffer length:', jwkBuffer.length)
    
    const keyFromJwk = askar.keyFromJwk({
      jwk: jwkBuffer
    })
    
    console.log('✅ Key created from JWK successfully:')
    console.log('Key type:', typeof keyFromJwk)
    console.log('Key handle:', keyFromJwk.handle)
    
    // JWK로 생성한 키의 알고리즘 확인
    const jwkKeyAlgorithm = askar.keyGetAlgorithm({ localKeyHandle: keyFromJwk })
    console.log('✅ JWK key algorithm:', jwkKeyAlgorithm)
    
    // JWK 키 해제
    askar.keyFree({ localKeyHandle: keyFromJwk })
    console.log('✅ JWK key freed successfully')
    
  } catch (error) {
    console.log('⚠️  JWK test result:', error.message)
  }
  
  // 임시 키 해제
  askar.keyFree({ localKeyHandle: tempKey })
  console.log('✅ Temporary key freed')
  
  const finalError = askar.getCurrentError()
  console.log('Final error status:', finalError)
  
  // keyFromPublicBytes 테스트 추가
  console.log('\n--- Testing keyFromPublicBytes ---')
  console.log('Attempting to create key from public bytes...')
  
  // ed25519 공개 키 바이트 (32바이트)
  // 이것은 알려진 유효한 ed25519 공개 키입니다
  const publicKeyBytes = Buffer.from([
    0xd7, 0x5a, 0x98, 0x01, 0x82, 0xb1, 0x0a, 0xb7,
    0xd5, 0x4b, 0xfe, 0xd3, 0xc9, 0x64, 0x07, 0x3a,
    0x0e, 0xe1, 0x72, 0xf3, 0xda, 0xa6, 0x23, 0x25,
    0xaf, 0x02, 0x1a, 0x68, 0xf7, 0x07, 0x51, 0x1a
  ])
  
  try {
    console.log('Public key bytes length:', publicKeyBytes.length)
    
    const keyFromPublicBytes = askar.keyFromPublicBytes({
      algorithm: 'ed25519',
      publicKey: publicKeyBytes
    })
    
    console.log('✅ Key created from public bytes successfully:')
    console.log('Key type:', typeof keyFromPublicBytes)
    console.log('Key handle:', keyFromPublicBytes.handle)
    
    // 공개 키로 생성한 키의 알고리즘 확인
    const publicKeyAlgorithm = askar.keyGetAlgorithm({ localKeyHandle: keyFromPublicBytes })
    console.log('✅ Public key algorithm:', publicKeyAlgorithm)
    
    // 공개 키는 개인 키 작업을 할 수 없으므로 서명 등은 테스트하지 않음
    console.log('⚠️  Note: This is a public-only key, so private key operations will fail')
    
    // 공개 키 해제
    askar.keyFree({ localKeyHandle: keyFromPublicBytes })
    console.log('✅ Public key freed successfully')
    
    // 테스트 2: 잘못된 길이의 공개 키로 테스트
    console.log('\nTest 2: Invalid public key length')
    try {
      const invalidPublicKey = Buffer.alloc(16) // 잘못된 길이 (16바이트 대신 32바이트여야 함)
      const invalidKey = askar.keyFromPublicBytes({
        algorithm: 'ed25519',
        publicKey: invalidPublicKey
      })
      console.log('❌ Invalid key should have failed but succeeded')
      askar.keyFree({ localKeyHandle: invalidKey })
    } catch (error) {
      console.log('✅ Invalid public key correctly rejected:', error.message)
    }
    
  } catch (error) {
    console.log('⚠️  Public key test result:', error.message)
  }
  
  const finalFinalError = askar.getCurrentError()
  console.log('Final error status after public key tests:', finalFinalError)
  
  // keyGetPublicBytes 테스트 추가
  console.log('\n--- Testing keyGetPublicBytes ---')
  console.log('Attempting to extract public bytes from key...')
  
  try {
    // 테스트용 새 키 생성
    console.log('Step 1: Generate a new key for public bytes extraction')
    const testKey = askar.keyGenerate({
      algorithm: 'ed25519',
      ephemeral: false,
      keyBackend: 'software'
    })
    console.log('✅ Test key generated for public bytes extraction')
    
    // 공개 키 바이트 추출
    console.log('Step 2: Extract public bytes from the generated key')
    const publicBytes = askar.keyGetPublicBytes({ localKeyHandle: testKey })
    
    console.log('✅ Public bytes extracted successfully:')
    console.log('Public bytes type:', typeof publicBytes)
    console.log('Public bytes constructor:', publicBytes.constructor.name)
    console.log('Public bytes length:', publicBytes.length)
    console.log('First 8 bytes:', Array.from(publicBytes.slice(0, 8)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(', '))
    
    // ed25519 공개 키는 32바이트여야 함
    if (publicBytes.length === 32) {
      console.log('✅ Correct public key length for ed25519 (32 bytes)')
    } else {
      console.log('⚠️  Unexpected public key length:', publicBytes.length, 'expected: 32')
    }
    
    // 추출한 공개 키로 새 키 생성해서 검증
    console.log('Step 3: Verify by creating key from extracted public bytes')
    const verifyKey = askar.keyFromPublicBytes({
      algorithm: 'ed25519',
      publicKey: Buffer.from(publicBytes)
    })
    console.log('✅ Verification key created from extracted public bytes')
    
    // 검증 키에서도 공개 키 바이트 추출
    const verifyPublicBytes = askar.keyGetPublicBytes({ localKeyHandle: verifyKey })
    console.log('✅ Public bytes extracted from verification key')
    
    // 두 공개 키 바이트가 동일한지 확인
    const bytesEqual = publicBytes.length === verifyPublicBytes.length && 
                      publicBytes.every((byte, index) => byte === verifyPublicBytes[index])
    
    if (bytesEqual) {
      console.log('✅ Original and verification public bytes match perfectly')
    } else {
      console.log('❌ Public bytes mismatch!')
      console.log('Original:', Array.from(publicBytes.slice(0, 8)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(', '), '...')
      console.log('Verify:  ', Array.from(verifyPublicBytes.slice(0, 8)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(', '), '...')
    }
    
    // 키들 해제
    askar.keyFree({ localKeyHandle: testKey })
    askar.keyFree({ localKeyHandle: verifyKey })
    console.log('✅ Test keys freed successfully')
    
    // 테스트 2: 시드로 생성한 키에서 공개 키 바이트 추출
    console.log('\nTest 2: Extract public bytes from seed-generated key')
    const deterministicSeed = Buffer.alloc(32)
    for (let i = 0; i < 32; i++) {
      deterministicSeed[i] = (i * 7) % 256 // 결정적인 시드
    }
    
    const seedKey = askar.keyFromSeed({
      algorithm: 'ed25519',
      seed: deterministicSeed,
      method: ''
    })
    console.log('✅ Seed key generated')
    
    const seedPublicBytes = askar.keyGetPublicBytes({ localKeyHandle: seedKey })
    console.log('✅ Public bytes extracted from seed key')
    console.log('Seed key public bytes length:', seedPublicBytes.length)
    console.log('Seed key first 8 bytes:', Array.from(seedPublicBytes.slice(0, 8)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(', '))
    
    askar.keyFree({ localKeyHandle: seedKey })
    console.log('✅ Seed key freed')
    
  } catch (error) {
    console.log('❌ keyGetPublicBytes test failed:', error.message)
    console.log('Error stack:', error.stack)
  }
  
  // keyFromSecretBytes 테스트 추가
  console.log('\n--- Testing keyFromSecretBytes ---')
  console.log('Attempting to create key from secret bytes...')
  
  try {
    // 테스트 1: 먼저 키를 생성해서 비밀 키 바이트를 얻은 다음, 그것으로 새 키 생성
    console.log('Step 1: Generate a key to get secret bytes')
    const sourceKey = askar.keyGenerate({
      algorithm: 'ed25519',
      ephemeral: false,
      keyBackend: 'software'
    })
    console.log('✅ Source key generated for secret bytes extraction')
    
    // TODO: keyGetSecretBytes가 구현되면 실제 비밀 키를 얻어서 테스트
    // 지금은 알려진 유효한 ed25519 비밀 키 바이트 사용 (32바이트)
    const secretKeyBytes = Buffer.from([
      0x9d, 0x61, 0xb1, 0x9d, 0xef, 0xfd, 0x5a, 0x60,
      0xba, 0x84, 0x4a, 0xf4, 0x92, 0xec, 0x2c, 0xc4,
      0x44, 0x49, 0xc5, 0x69, 0x7b, 0x32, 0x69, 0x19,
      0x70, 0x3b, 0xac, 0x03, 0x1c, 0xae, 0x7f, 0x60
    ])
    
    console.log('Secret key bytes length:', secretKeyBytes.length)
    
    const keyFromSecretBytes = askar.keyFromSecretBytes({
      algorithm: 'ed25519',
      secretKey: secretKeyBytes
    })
    
    console.log('✅ Key created from secret bytes successfully:')
    console.log('Key type:', typeof keyFromSecretBytes)
    console.log('Key handle:', keyFromSecretBytes.handle)
    
    // 비밀 키로 생성한 키의 알고리즘 확인
    const secretKeyAlgorithm = askar.keyGetAlgorithm({ localKeyHandle: keyFromSecretBytes })
    console.log('✅ Secret key algorithm:', secretKeyAlgorithm)
    
    // 비밀 키로 생성한 키에서 공개 키 바이트 추출해서 검증
    const extractedPublicBytes = askar.keyGetPublicBytes({ localKeyHandle: keyFromSecretBytes })
    console.log('✅ Public bytes extracted from secret key:')
    console.log('Public bytes length:', extractedPublicBytes.length)
    console.log('First 8 bytes:', Array.from(extractedPublicBytes.slice(0, 8)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(', '))
    
    // ed25519에서 이 비밀 키에 대응하는 예상 공개 키 확인
    if (extractedPublicBytes.length === 32) {
      console.log('✅ Correct public key length for ed25519 (32 bytes)')
    } else {
      console.log('⚠️  Unexpected public key length:', extractedPublicBytes.length, 'expected: 32')
    }
    
    // 키들 해제
    askar.keyFree({ localKeyHandle: sourceKey })
    askar.keyFree({ localKeyHandle: keyFromSecretBytes })
    console.log('✅ Secret key test keys freed successfully')
    
    // 테스트 2: 잘못된 길이의 비밀 키로 테스트
    console.log('\nTest 2: Invalid secret key length')
    try {
      const invalidSecretKey = Buffer.alloc(16) // 잘못된 길이 (16바이트 대신 32바이트여야 함)
      const invalidKey = askar.keyFromSecretBytes({
        algorithm: 'ed25519',
        secretKey: invalidSecretKey
      })
      console.log('❌ Invalid secret key should have failed but succeeded')
      askar.keyFree({ localKeyHandle: invalidKey })
    } catch (error) {
      console.log('✅ Invalid secret key correctly rejected:', error.message)
    }
    
    // 테스트 3: 시드에서 생성한 키와 동일한 비밀 키로 키 생성 비교
    console.log('\nTest 3: Deterministic secret key test')
    const deterministicSeed = Buffer.alloc(32)
    for (let i = 0; i < 32; i++) {
      deterministicSeed[i] = (i * 3) % 256 // 결정적인 시드
    }
    
    // 같은 시드로 키 생성
    const seedKey1 = askar.keyFromSeed({
      algorithm: 'ed25519',
      seed: deterministicSeed,
      method: ''
    })
    
    // 같은 시드 값을 비밀 키로 사용 (ed25519에서는 시드가 비밀 키와 같음)
    const secretKey1 = askar.keyFromSecretBytes({
      algorithm: 'ed25519',
      secretKey: deterministicSeed
    })
    
    // 두 키에서 공개 키 바이트 추출해서 비교
    const seedPublicBytes1 = askar.keyGetPublicBytes({ localKeyHandle: seedKey1 })
    const secretPublicBytes1 = askar.keyGetPublicBytes({ localKeyHandle: secretKey1 })
    
    const keysEqual = seedPublicBytes1.length === secretPublicBytes1.length && 
                     seedPublicBytes1.every((byte, index) => byte === secretPublicBytes1[index])
    
    if (keysEqual) {
      console.log('✅ Seed-generated and secret-bytes-generated keys produce identical public keys')
    } else {
      console.log('⚠️  Seed and secret keys produce different public keys (may be expected depending on algorithm)')
      console.log('Seed public:  ', Array.from(seedPublicBytes1.slice(0, 8)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(', '), '...')
      console.log('Secret public:', Array.from(secretPublicBytes1.slice(0, 8)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(', '), '...')
    }
    
    askar.keyFree({ localKeyHandle: seedKey1 })
    askar.keyFree({ localKeyHandle: secretKey1 })
    console.log('✅ Comparison test keys freed')
    
  } catch (error) {
    console.log('❌ keyFromSecretBytes test failed:', error.message)
    console.log('Error stack:', error.stack)
  }
  
  // keyGetSecretBytes 테스트 추가
  console.log('\n--- Testing keyGetSecretBytes ---')
  console.log('Attempting to extract secret bytes from key...')
  
  try {
    // 테스트용 새 키 생성
    console.log('Step 1: Generate a new key for secret bytes extraction')
    const testKey = askar.keyGenerate({
      algorithm: 'ed25519',
      ephemeral: false,
      keyBackend: 'software'
    })
    console.log('✅ Test key generated for secret bytes extraction')
    
    // 비밀 키 바이트 추출
    console.log('Step 2: Extract secret bytes from the generated key')
    const secretBytes = askar.keyGetSecretBytes({ localKeyHandle: testKey })
    
    console.log('✅ Secret bytes extracted successfully:')
    console.log('Secret bytes type:', typeof secretBytes)
    console.log('Secret bytes constructor:', secretBytes.constructor.name)
    console.log('Secret bytes length:', secretBytes.length)
    console.log('First 8 bytes:', Array.from(secretBytes.slice(0, 8)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(', '))
    
    // ed25519 비밀 키는 32바이트여야 함
    if (secretBytes.length === 32) {
      console.log('✅ Correct secret key length for ed25519 (32 bytes)')
    } else {
      console.log('⚠️  Unexpected secret key length:', secretBytes.length, 'expected: 32')
    }
    
    // 추출한 비밀 키로 새 키 생성해서 검증
    console.log('Step 3: Verify by creating key from extracted secret bytes')
    const verifyKey = askar.keyFromSecretBytes({
      algorithm: 'ed25519',
      secretKey: Buffer.from(secretBytes)
    })
    console.log('✅ Verification key created from extracted secret bytes')
    
    // 검증 키에서도 공개 키 바이트 추출해서 원본과 비교
    const originalPublicBytes = askar.keyGetPublicBytes({ localKeyHandle: testKey })
    const verifyPublicBytes = askar.keyGetPublicBytes({ localKeyHandle: verifyKey })
    console.log('✅ Public bytes extracted from both original and verification keys')
    
    // 두 키의 공개 키 바이트가 동일한지 확인
    const publicBytesEqual = originalPublicBytes.length === verifyPublicBytes.length && 
                            originalPublicBytes.every((byte, index) => byte === verifyPublicBytes[index])
    
    if (publicBytesEqual) {
      console.log('✅ Original and verification keys produce identical public bytes')
    } else {
      console.log('❌ Public bytes mismatch!')
      console.log('Original: ', Array.from(originalPublicBytes.slice(0, 8)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(', '), '...')
      console.log('Verify:   ', Array.from(verifyPublicBytes.slice(0, 8)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(', '), '...')
    }
    
    // 키들 해제
    askar.keyFree({ localKeyHandle: testKey })
    askar.keyFree({ localKeyHandle: verifyKey })
    console.log('✅ Test keys freed successfully')
    
    // 테스트 2: 시드로 생성한 키에서 비밀 키 바이트 추출
    console.log('\nTest 2: Extract secret bytes from seed-generated key')
    const deterministicSeed = Buffer.alloc(32)
    for (let i = 0; i < 32; i++) {
      deterministicSeed[i] = (i * 11) % 256 // 결정적인 시드
    }
    
    const seedKey = askar.keyFromSeed({
      algorithm: 'ed25519',
      seed: deterministicSeed,
      method: ''
    })
    console.log('✅ Seed key generated')
    
    const seedSecretBytes = askar.keyGetSecretBytes({ localKeyHandle: seedKey })
    console.log('✅ Secret bytes extracted from seed key')
    console.log('Seed key secret bytes length:', seedSecretBytes.length)
    console.log('Seed key secret first 8 bytes:', Array.from(seedSecretBytes.slice(0, 8)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(', '))
    
    // 시드와 추출된 비밀 키 바이트가 동일한지 확인 (ed25519에서는 시드 = 비밀 키)
    const seedEqual = deterministicSeed.length === seedSecretBytes.length && 
                     deterministicSeed.every((byte, index) => byte === seedSecretBytes[index])
    
    if (seedEqual) {
      console.log('✅ Extracted secret bytes match the original seed (expected for ed25519)')
    } else {
      console.log('⚠️  Extracted secret bytes differ from seed (may be expected depending on key derivation)')
      console.log('Seed:   ', Array.from(deterministicSeed.slice(0, 8)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(', '), '...')
      console.log('Secret: ', Array.from(seedSecretBytes.slice(0, 8)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(', '), '...')
    }
    
    askar.keyFree({ localKeyHandle: seedKey })
    console.log('✅ Seed key freed')
    
    // 테스트 3: 공개 키로만 생성한 키에서 비밀 키 추출 시도 (실패해야 함)
    console.log('\nTest 3: Try to extract secret bytes from public-only key (should fail)')
    const publicOnlyKey = askar.keyFromPublicBytes({
      algorithm: 'ed25519',
      publicKey: Buffer.from([
        0xd7, 0x5a, 0x98, 0x01, 0x82, 0xb1, 0x0a, 0xb7,
        0xd5, 0x4b, 0xfe, 0xd3, 0xc9, 0x64, 0x07, 0x3a,
        0x0e, 0xe1, 0x72, 0xf3, 0xda, 0xa6, 0x23, 0x25,
        0xaf, 0x02, 0x1a, 0x68, 0xf7, 0x07, 0x51, 0x1a
      ])
    })
    
    try {
      const publicOnlySecret = askar.keyGetSecretBytes({ localKeyHandle: publicOnlyKey })
      console.log('❌ Secret bytes extraction from public-only key should have failed but succeeded')
      console.log('Extracted length:', publicOnlySecret.length)
    } catch (error) {
      console.log('✅ Secret bytes extraction from public-only key correctly failed:', error.message)
    }
    
    askar.keyFree({ localKeyHandle: publicOnlyKey })
    console.log('✅ Public-only key freed')
    
  } catch (error) {
    console.log('❌ keyGetSecretBytes test failed:', error.message)
    console.log('Error stack:', error.stack)
  }
  
  // keyConvert 테스트 추가
  console.log('\n--- Testing keyConvert ---')
  console.log('Attempting to convert keys between algorithms...')
  
  try {
    // 테스트 1: ed25519에서 X25519로 변환 (일반적인 변환)
    console.log('Test 1: Convert ed25519 to X25519 (signing to encryption)')
    const sourceKey = askar.keyGenerate({
      algorithm: 'ed25519',
      ephemeral: false,
      keyBackend: 'software'
    })
    console.log('✅ Source ed25519 key generated')
    
    console.log('Original key algorithm:', askar.keyGetAlgorithm({ localKeyHandle: sourceKey }))
    
    try {
      const convertedKey = askar.keyConvert({
        localKeyHandle: sourceKey,
        algorithm: 'x25519'
      })
      
      console.log('✅ Key converted successfully:')
      console.log('Key type:', typeof convertedKey)
      console.log('Key handle:', convertedKey.handle)
      
      // 변환된 키의 알고리즘 확인
      const convertedAlgorithm = askar.keyGetAlgorithm({ localKeyHandle: convertedKey })
      console.log('✅ Converted key algorithm:', convertedAlgorithm)
      
      if (convertedAlgorithm === 'x25519') {
        console.log('✅ Algorithm conversion successful: ed25519 → x25519')
      } else {
        console.log('⚠️  Unexpected converted algorithm:', convertedAlgorithm, 'expected: x25519')
      }
      
      // 변환된 키에서 공개 키 바이트 추출 (길이 확인)
      const convertedPublicBytes = askar.keyGetPublicBytes({ localKeyHandle: convertedKey })
      console.log('✅ Converted key public bytes length:', convertedPublicBytes.length)
      console.log('Converted key first 8 bytes:', Array.from(convertedPublicBytes.slice(0, 8)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(', '))
      
      askar.keyFree({ localKeyHandle: convertedKey })
      console.log('✅ Converted key freed')
      
    } catch (error) {
      console.log('⚠️  ed25519 → x25519 conversion result:', error.message)
    }
    
    askar.keyFree({ localKeyHandle: sourceKey })
    console.log('✅ Source key freed')
    
    // 테스트 2: secp256k1 키 생성 후 변환 시도
    console.log('\nTest 2: Generate secp256k1 key and try conversions')
    try {
      const secp256k1Key = askar.keyGenerate({
        algorithm: 'secp256k1',
        ephemeral: false,
        keyBackend: 'software'
      })
      console.log('✅ secp256k1 key generated')
      console.log('secp256k1 key algorithm:', askar.keyGetAlgorithm({ localKeyHandle: secp256k1Key }))
      
      // secp256k1을 다른 알고리즘으로 변환 시도
      try {
        const convertedSecp = askar.keyConvert({
          localKeyHandle: secp256k1Key,
          algorithm: 'secp256r1'
        })
        console.log('✅ secp256k1 → secp256r1 conversion successful')
        console.log('Converted algorithm:', askar.keyGetAlgorithm({ localKeyHandle: convertedSecp }))
        askar.keyFree({ localKeyHandle: convertedSecp })
      } catch (error) {
        console.log('⚠️  secp256k1 → secp256r1 conversion result:', error.message)
      }
      
      askar.keyFree({ localKeyHandle: secp256k1Key })
      console.log('✅ secp256k1 key freed')
      
    } catch (error) {
      console.log('⚠️  secp256k1 key generation result:', error.message)
    }
    
    // 테스트 3: 지원되지 않는 변환 시도 (오류 확인)
    console.log('\nTest 3: Try unsupported conversion (should fail)')
    const testKey3 = askar.keyGenerate({
      algorithm: 'ed25519',
      ephemeral: false,
      keyBackend: 'software'
    })
    console.log('✅ Test key generated for unsupported conversion')
    
    try {
      const invalidConvert = askar.keyConvert({
        localKeyHandle: testKey3,
        algorithm: 'invalid_algorithm'
      })
      console.log('❌ Invalid conversion should have failed but succeeded')
      askar.keyFree({ localKeyHandle: invalidConvert })
    } catch (error) {
      console.log('✅ Invalid algorithm conversion correctly failed:', error.message)
    }
    
    askar.keyFree({ localKeyHandle: testKey3 })
    console.log('✅ Test key freed')
    
    // 테스트 4: 공개 키로만 생성한 키 변환 시도
    console.log('\nTest 4: Try to convert public-only key')
    const publicOnlyKey2 = askar.keyFromPublicBytes({
      algorithm: 'ed25519',
      publicKey: Buffer.from([
        0xd7, 0x5a, 0x98, 0x01, 0x82, 0xb1, 0x0a, 0xb7,
        0xd5, 0x4b, 0xfe, 0xd3, 0xc9, 0x64, 0x07, 0x3a,
        0x0e, 0xe1, 0x72, 0xf3, 0xda, 0xa6, 0x23, 0x25,
        0xaf, 0x02, 0x1a, 0x68, 0xf7, 0x07, 0x51, 0x1a
      ])
    })
    console.log('✅ Public-only key created for conversion test')
    
    try {
      const convertedPublicKey = askar.keyConvert({
        localKeyHandle: publicOnlyKey2,
        algorithm: 'x25519'
      })
      console.log('✅ Public-only key conversion successful')
      console.log('Converted public key algorithm:', askar.keyGetAlgorithm({ localKeyHandle: convertedPublicKey }))
      askar.keyFree({ localKeyHandle: convertedPublicKey })
    } catch (error) {
      console.log('⚠️  Public-only key conversion result:', error.message)
    }
    
    askar.keyFree({ localKeyHandle: publicOnlyKey2 })
    console.log('✅ Public-only key freed')
    
    // 테스트 5: 변환된 키의 기능 검증
    console.log('\nTest 5: Verify converted key functionality')
    const originalKey = askar.keyGenerate({
      algorithm: 'ed25519',
      ephemeral: false,
      keyBackend: 'software'
    })
    console.log('✅ Original key generated for functionality test')
    
    try {
      const functionalKey = askar.keyConvert({
        localKeyHandle: originalKey,
        algorithm: 'x25519'
      })
      console.log('✅ Key converted for functionality test')
      
      // 변환된 키에서 공개 키와 비밀 키 바이트 추출
      const funcPublicBytes = askar.keyGetPublicBytes({ localKeyHandle: functionalKey })
      console.log('✅ Public bytes extracted from converted key:', funcPublicBytes.length, 'bytes')
      
      try {
        const funcSecretBytes = askar.keyGetSecretBytes({ localKeyHandle: functionalKey })
        console.log('✅ Secret bytes extracted from converted key:', funcSecretBytes.length, 'bytes')
      } catch (error) {
        console.log('⚠️  Secret bytes extraction from converted key:', error.message)
      }
      
      askar.keyFree({ localKeyHandle: functionalKey })
      console.log('✅ Converted functional key freed')
      
    } catch (error) {
      console.log('⚠️  Functional key conversion result:', error.message)
    }
    
    askar.keyFree({ localKeyHandle: originalKey })
    console.log('✅ Original functional key freed')
    
  } catch (error) {
    console.log('❌ keyConvert test failed:', error.message)
    console.log('Error stack:', error.stack)
  }
  
  // keyFromKeyExchange 테스트 추가
  console.log('\n--- Testing keyFromKeyExchange ---')
  try {
    // ed25519 키 쌍 2개 생성
    const key1 = askar.keyGenerate({ algorithm: 'ed25519', ephemeral: false, keyBackend: 'software' })
    const key2 = askar.keyGenerate({ algorithm: 'ed25519', ephemeral: false, keyBackend: 'software' })
    console.log('✅ Two ed25519 keys generated for key exchange')

    // X25519로 변환 (키 교환용)
    const xKey1 = askar.keyConvert({ localKeyHandle: key1, algorithm: 'x25519' })
    const xKey2 = askar.keyConvert({ localKeyHandle: key2, algorithm: 'x25519' })
    console.log('✅ Both keys converted to x25519')

    // keyFromKeyExchange로 공유 비밀키 생성
    const sharedKey = askar.keyFromKeyExchange({
      algorithm: 'x25519',
      skHandle: xKey1,
      pkHandle: xKey2
    })
    console.log('✅ Shared key generated from key exchange')
    console.log('Shared key handle:', sharedKey.handle)

    // 공유키 해제
    askar.keyFree({ localKeyHandle: sharedKey })
    askar.keyFree({ localKeyHandle: xKey1 })
    askar.keyFree({ localKeyHandle: xKey2 })
    askar.keyFree({ localKeyHandle: key1 })
    askar.keyFree({ localKeyHandle: key2 })
    console.log('✅ All key exchange test keys freed')
  } catch (error) {
    console.log('❌ keyFromKeyExchange test failed:', error.message)
  }

  // keyGetEphemeral 테스트 추가
  console.log('\n--- Testing keyGetEphemeral ---')
  try {
    const key = askar.keyGenerate({ algorithm: 'ed25519', ephemeral: true, keyBackend: 'software' })
    const ephemeralFlag = askar.keyGetEphemeral({ localKeyHandle: key })
    console.log('Ephemeral flag (should be 1):', ephemeralFlag)
    if (ephemeralFlag === 1) {
      console.log('✅ Ephemeral key correctly reports ephemeral=1')
    } else {
      console.log('❌ Ephemeral key did not report ephemeral=1')
    }
    askar.keyFree({ localKeyHandle: key })

    const key2 = askar.keyGenerate({ algorithm: 'ed25519', ephemeral: false, keyBackend: 'software' })
    const ephemeralFlag2 = askar.keyGetEphemeral({ localKeyHandle: key2 })
    console.log('Ephemeral flag (should be 0):', ephemeralFlag2)
    if (ephemeralFlag2 === 0) {
      console.log('✅ Non-ephemeral key correctly reports ephemeral=0')
    } else {
      console.log('❌ Non-ephemeral key did not report ephemeral=0')
    }
    askar.keyFree({ localKeyHandle: key2 })
  } catch (error) {
    console.log('❌ keyGetEphemeral test failed:', error.message)
  }
  
  // keyGetJwkPublic, keyGetJwkSecret, keyGetJwkThumbprint 테스트
  console.log('\n--- Testing keyGetJwkPublic, keyGetJwkSecret, keyGetJwkThumbprint ---')
  try {
    const key = askar.keyGenerate({ algorithm: 'ed25519', ephemeral: false, keyBackend: 'software' })
    const jwkPub = askar.keyGetJwkPublic({ localKeyHandle: key, algorithm: 'ed25519' })
    console.log('✅ keyGetJwkPublic:', jwkPub)
    const jwkSecret = askar.keyGetJwkSecret({ localKeyHandle: key })
    console.log('✅ keyGetJwkSecret length:', jwkSecret.length)
    const thumbprint = askar.keyGetJwkThumbprint({ localKeyHandle: key, algorithm: 'ed25519' })
    console.log('✅ keyGetJwkThumbprint:', thumbprint)
    askar.keyFree({ localKeyHandle: key })
  } catch (error) {
    console.log('❌ JWK 관련 함수 테스트 실패:', error.message)
  }

  // keyAeadRandomNonce, keyAeadGetParams, keyAeadGetPadding, keyAeadEncrypt, keyAeadDecrypt 테스트
  console.log('\n--- Testing AEAD 관련 함수 ---')
  try {
    // aes256-gcm 키 생성 (AEAD는 x25519, aes256gcm 등에서만 동작할 수 있음)
    const key = askar.keyGenerate({ algorithm: 'aes256-gcm', ephemeral: false, keyBackend: 'software' })
    // keyAeadRandomNonce
    const nonce = askar.keyAeadRandomNonce({ localKeyHandle: key })
    console.log('✅ keyAeadRandomNonce length:', nonce.length)
    // keyAeadGetParams
    const params = askar.keyAeadGetParams({ localKeyHandle: key })
    console.log('✅ keyAeadGetParams:', params)
    // keyAeadGetPadding
    const padding = askar.keyAeadGetPadding({ localKeyHandle: key, msgLen: 16 })
    console.log('✅ keyAeadGetPadding:', padding)
    // keyAeadEncrypt/Decrypt
    const message = Buffer.from('Hello, AEAD!')
    const aad = Buffer.from('aad')
    const encrypted = askar.keyAeadEncrypt({ localKeyHandle: key, message, nonce, aad })
    console.log('✅ keyAeadEncrypt:', encrypted)
    const decrypted = askar.keyAeadDecrypt({ localKeyHandle: key, ciphertext: encrypted.ciphertext, nonce, tag: encrypted.tag, aad })
    console.log('✅ keyAeadDecrypt:', decrypted.toString())
    askar.keyFree({ localKeyHandle: key })
  } catch (error) {
    console.log('❌ AEAD 관련 함수 테스트 실패:', error.message)
  }

  // keySignMessage, keyVerifySignature 테스트 추가
  console.log('\n--- Testing keySignMessage and keyVerifySignature ---')
  console.log('Attempting to sign and verify messages...')
  
  try {
    // 서명용 키 생성 (ed25519)
    const signingKey = askar.keyGenerate({
      algorithm: 'ed25519',
      ephemeral: false,
      keyBackend: 'software'
    })
    console.log('✅ Signing key generated (ed25519)')
    
    // 테스트 메시지
    const testMessage = Buffer.from('Hello, this is a test message for signing!')
    console.log('Test message:', testMessage.toString())
    console.log('Message length:', testMessage.length)
    
    // 메시지 서명
    console.log('Step 1: Sign the message')
    const signature = askar.keySignMessage({
      localKeyHandle: signingKey,
      message: testMessage,
      sigType: null // ed25519는 기본 서명 타입 사용
    })
    
    console.log('✅ Message signed successfully:')
    console.log('Signature type:', typeof signature)
    console.log('Signature constructor:', signature.constructor.name)
    console.log('Signature length:', signature.length)
    console.log('First 8 bytes:', Array.from(signature.slice(0, 8)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(', '))
    
    // ed25519 서명은 64바이트여야 함
    if (signature.length === 64) {
      console.log('✅ Correct signature length for ed25519 (64 bytes)')
    } else {
      console.log('⚠️  Unexpected signature length:', signature.length, 'expected: 64')
    }
    
    // 서명 검증
    console.log('Step 2: Verify the signature')
    const verificationResult = askar.keyVerifySignature({
      localKeyHandle: signingKey,
      sigType: null,
      message: testMessage,
      signature: signature
    })
    
    console.log('✅ Signature verification result:', verificationResult)
    if (verificationResult === 1) {
      console.log('✅ Signature verification PASSED (1)')
    } else if (verificationResult === 0) {
      console.log('❌ Signature verification FAILED (0)')
    } else {
      console.log('⚠️  Unexpected verification result:', verificationResult)
    }
    
    // 테스트 3: 잘못된 메시지로 검증 (실패해야 함)
    console.log('Step 3: Verify with wrong message (should fail)')
    const wrongMessage = Buffer.from('This is a different message!')
    const wrongVerification = askar.keyVerifySignature({
      localKeyHandle: signingKey,
      sigType: null,
      message: wrongMessage,
      signature: signature
    })
    
    console.log('Wrong message verification result:', wrongVerification)
    if (wrongVerification === 0) {
      console.log('✅ Wrong message correctly rejected (0)')
    } else {
      console.log('❌ Wrong message verification should have failed but passed')
    }
    
    // 테스트 4: 잘못된 서명으로 검증 (실패해야 함)
    console.log('Step 4: Verify with wrong signature (should fail)')
    const wrongSignature = Buffer.alloc(64, 0xFF) // 모든 바이트가 0xFF인 잘못된 서명
    const wrongSigVerification = askar.keyVerifySignature({
      localKeyHandle: signingKey,
      sigType: null,
      message: testMessage,
      signature: wrongSignature
    })
    
    console.log('Wrong signature verification result:', wrongSigVerification)
    if (wrongSigVerification === 0) {
      console.log('✅ Wrong signature correctly rejected (0)')
    } else {
      console.log('❌ Wrong signature verification should have failed but passed')
    }
    
    askar.keyFree({ localKeyHandle: signingKey })
    console.log('✅ Signing key freed successfully')
    
  } catch (error) {
    console.log('❌ keySignMessage/keyVerifySignature test failed:', error.message)
    console.log('Error stack:', error.stack)
  }
  // keyWrapKey, keyUnwrapKey 테스트 추가
  console.log('\n--- Testing keyWrapKey and keyUnwrapKey ---')
  console.log('Attempting to wrap and unwrap keys...')
  
  try {
    // 키 래핑용 키 생성 (aes256-gcm - AEAD 지원)
    const wrappingKey = askar.keyGenerate({
      algorithm: 'aes256-gcm',
      ephemeral: false,
      keyBackend: 'software'
    })
    console.log('✅ Wrapping key generated (aes256-gcm)')
    
    // 래핑될 키 생성 (ed25519)
    const keyToWrap = askar.keyGenerate({
      algorithm: 'ed25519',
      ephemeral: false,
      keyBackend: 'software'
    })
    console.log('✅ Key to wrap generated (ed25519)')
    
    // 논스 생성 (12바이트 - AES-GCM 표준)
    const nonce = Buffer.alloc(12)
    for (let i = 0; i < 12; i++) {
      nonce[i] = Math.floor(Math.random() * 256)
    }
    console.log('✅ Random nonce generated (12 bytes)')
    
    // 키 래핑
    console.log('Step 1: Wrap the key')
    const wrappedKey = askar.keyWrapKey({
      localKeyHandle: wrappingKey,
      nonce: nonce,
      other: keyToWrap.handle
    })
    
    console.log('✅ Key wrapped successfully:')
    console.log('Wrapped key type:', typeof wrappedKey)
    console.log('Ciphertext length:', wrappedKey.ciphertext.length)
    console.log('Tag length:', wrappedKey.tag.length)
    console.log('First 8 bytes of ciphertext:', Array.from(wrappedKey.ciphertext.slice(0, 8)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(', '))
    console.log('Tag bytes:', Array.from(wrappedKey.tag).map(b => '0x' + b.toString(16).padStart(2, '0')).join(', '))
    
    // 키 언래핑
    console.log('Step 2: Unwrap the key')
    const unwrappedKey = askar.keyUnwrapKey({
      localKeyHandle: wrappingKey,
      algorithm: 'ed25519',
      ciphertext: wrappedKey.ciphertext,
      nonce: nonce,
      tag: wrappedKey.tag
    })
    
    console.log('✅ Key unwrapped successfully:')
    console.log('Unwrapped key type:', typeof unwrappedKey)
    console.log('Unwrapped key handle:', unwrappedKey.handle)
    
    // 언래핑된 키의 알고리즘 확인
    const unwrappedAlgorithm = askar.keyGetAlgorithm({ localKeyHandle: unwrappedKey })
    console.log('✅ Unwrapped key algorithm:', unwrappedAlgorithm)
    
    if (unwrappedAlgorithm === 'ed25519') {
      console.log('✅ Unwrapped key has correct algorithm (ed25519)')
    } else {
      console.log('⚠️  Unexpected unwrapped key algorithm:', unwrappedAlgorithm, 'expected: ed25519')
    }
    
    // 원본 키와 언래핑된 키의 공개 키 바이트 비교
    console.log('Step 3: Compare original and unwrapped keys')
    const originalPublicBytes = askar.keyGetPublicBytes({ localKeyHandle: keyToWrap })
    const unwrappedPublicBytes = askar.keyGetPublicBytes({ localKeyHandle: unwrappedKey })
    
    const keysEqual = originalPublicBytes.length === unwrappedPublicBytes.length && 
                     originalPublicBytes.every((byte, index) => byte === unwrappedPublicBytes[index])
    
    if (keysEqual) {
      console.log('✅ Original and unwrapped keys have identical public bytes')
    } else {
      console.log('❌ Original and unwrapped keys have different public bytes')
      console.log('Original:  ', Array.from(originalPublicBytes.slice(0, 8)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(', '), '...')
      console.log('Unwrapped: ', Array.from(unwrappedPublicBytes.slice(0, 8)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(', '), '...')
    }
    
    // 키들 해제
    askar.keyFree({ localKeyHandle: wrappingKey })
    askar.keyFree({ localKeyHandle: keyToWrap })
    askar.keyFree({ localKeyHandle: unwrappedKey })
    console.log('✅ All wrap/unwrap test keys freed successfully')
    
  } catch (error) {
    console.log('❌ keyWrapKey/keyUnwrapKey test failed:', error.message)
    console.log('Error stack:', error.stack)
  }

  // keyCryptoBoxRandomNonce, keyCryptoBox, keyCryptoBoxOpen 테스트 추가
  console.log('\n--- Testing CryptoBox functions ---')
  console.log('Attempting to test crypto box encryption/decryption...')
  
  try {
    // 송신자와 수신자 키 쌍 생성 (x25519)
    const senderKey = askar.keyGenerate({
      algorithm: 'x25519',
      ephemeral: false,
      keyBackend: 'software'
    })
    console.log('✅ Sender key generated (x25519)')
    
    const recipientKey = askar.keyGenerate({
      algorithm: 'x25519',
      ephemeral: false,
      keyBackend: 'software'
    })
    console.log('✅ Recipient key generated (x25519)')
    
    // 랜덤 논스 생성
    console.log('Step 1: Generate random nonce for crypto box')
    const randomNonce = askar.keyCryptoBoxRandomNonce()
    
    console.log('✅ Random nonce generated:')
    console.log('Nonce type:', typeof randomNonce)
    console.log('Nonce length:', randomNonce.length)
    console.log('Nonce bytes:', Array.from(randomNonce.slice(0, 8)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(', '), '...')
    
    // NaCl crypto_box에서 논스는 24바이트여야 함
    if (randomNonce.length === 24) {
      console.log('✅ Correct nonce length for crypto box (24 bytes)')
    } else {
      console.log('⚠️  Unexpected nonce length:', randomNonce.length, 'expected: 24')
    }
    
    // 테스트 메시지
    const plaintext = Buffer.from('Hello, this is a secret message for crypto box!')
    console.log('Plaintext message:', plaintext.toString())
    console.log('Plaintext length:', plaintext.length)
    
    // 암호화 (keyCryptoBox)
    console.log('Step 2: Encrypt message with crypto box')
    const encrypted = askar.keyCryptoBox({
      nonce: randomNonce,
      message: plaintext,
      recipientKey: recipientKey.handle,
      senderKey: senderKey.handle
    })
    
    console.log('✅ Message encrypted successfully:')
    console.log('Encrypted type:', typeof encrypted)
    console.log('Encrypted length:', encrypted.length)
    console.log('First 8 bytes:', Array.from(encrypted.slice(0, 8)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(', '))
    
    // 복호화 (keyCryptoBoxOpen)
    console.log('Step 3: Decrypt message with crypto box')
    const decrypted = askar.keyCryptoBoxOpen({
      nonce: randomNonce,
      message: encrypted,
      senderKey: senderKey.handle,
      recipientKey: recipientKey.handle
    })
    
    console.log('✅ Message decrypted successfully:')
    console.log('Decrypted type:', typeof decrypted)
    console.log('Decrypted length:', decrypted.length)
    console.log('Decrypted message:', Buffer.from(decrypted).toString())
    
    // 원본 메시지와 복호화된 메시지 비교
    const messagesEqual = plaintext.length === decrypted.length && 
                         plaintext.every((byte, index) => byte === decrypted[index])
    
    if (messagesEqual) {
      console.log('✅ Original and decrypted messages match perfectly')
    } else {
      console.log('❌ Original and decrypted messages do not match!')
      console.log('Original: ', plaintext.toString())
      console.log('Decrypted:', Buffer.from(decrypted).toString())
    }
    
    // 키들 해제
    askar.keyFree({ localKeyHandle: senderKey })
    askar.keyFree({ localKeyHandle: recipientKey })
    console.log('✅ Crypto box test keys freed successfully')
    
  } catch (error) {
    console.log('❌ CryptoBox functions test failed:', error.message)
    console.log('Error stack:', error.stack)
  }

  // keyCryptoBoxSeal, keyCryptoBoxSealOpen 테스트 추가
  console.log('\n--- Testing CryptoBoxSeal functions ---')
  console.log('Attempting to test crypto box seal encryption/decryption...')
  
  try {
    // 수신자 키 생성 (x25519)
    const recipientKey = askar.keyGenerate({
      algorithm: 'x25519',
      ephemeral: false,
      keyBackend: 'software'
    })
    console.log('✅ Recipient key generated for seal test (x25519)')
    
    // 테스트 메시지
    const sealPlaintext = Buffer.from('This is a sealed message!')
    console.log('Seal plaintext message:', sealPlaintext.toString())
    console.log('Seal plaintext length:', sealPlaintext.length)
    
    // 봉인 암호화 (keyCryptoBoxSeal) - 익명 암호화
    console.log('Step 1: Seal encrypt message (anonymous encryption)')
    const sealEncrypted = askar.keyCryptoBoxSeal({
      message: sealPlaintext,
      localKeyHandle: recipientKey.handle
    })
    
    console.log('✅ Message seal encrypted successfully:')
    console.log('Seal encrypted type:', typeof sealEncrypted)
    console.log('Seal encrypted length:', sealEncrypted.length)
    console.log('First 8 bytes:', Array.from(sealEncrypted.slice(0, 8)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(', '))
    
    // 봉인 복호화 (keyCryptoBoxSealOpen)
    console.log('Step 2: Seal decrypt message')
    const sealDecrypted = askar.keyCryptoBoxSealOpen({
      ciphertext: sealEncrypted,
      localKeyHandle: recipientKey.handle
    })
    
    console.log('✅ Message seal decrypted successfully:')
    console.log('Seal decrypted type:', typeof sealDecrypted)
    console.log('Seal decrypted length:', sealDecrypted.length)
    console.log('Seal decrypted message:', Buffer.from(sealDecrypted).toString())
    
    // 원본 메시지와 복호화된 메시지 비교
    const sealMessagesEqual = sealPlaintext.length === sealDecrypted.length && 
                             sealPlaintext.every((byte, index) => byte === sealDecrypted[index])
    
    if (sealMessagesEqual) {
      console.log('✅ Original and seal decrypted messages match perfectly')
    } else {
      console.log('❌ Original and seal decrypted messages do not match!')
      console.log('Original:  ', sealPlaintext.toString())
      console.log('Decrypted: ', Buffer.from(sealDecrypted).toString())
    }
    
    // 키 해제
    askar.keyFree({ localKeyHandle: recipientKey })
    console.log('✅ Crypto box seal test key freed successfully')
    
  } catch (error) {
    console.log('❌ CryptoBoxSeal functions test failed:', error.message)
    console.log('Error stack:', error.stack)
  }

  // keyDeriveEcdhEs, keyDeriveEcdh1pu 테스트 추가
  console.log('\n--- Testing ECDH key derivation functions ---')
  console.log('Attempting to test ECDH-ES and ECDH-1PU key derivation...')
  
  try {
    // ECDH용 키들 생성 (x25519)
    const ephemeralKey = askar.keyGenerate({
      algorithm: 'x25519',
      ephemeral: true,
      keyBackend: 'software'
    })
    console.log('✅ Ephemeral key generated (x25519)')
    
    const recipientKey = askar.keyGenerate({
      algorithm: 'x25519',
      ephemeral: false,
      keyBackend: 'software'
    })
    console.log('✅ Recipient key generated (x25519)')
    
    const senderKey = askar.keyGenerate({
      algorithm: 'x25519',
      ephemeral: false,
      keyBackend: 'software'
    })
    console.log('✅ Sender key generated (x25519)')
    
    // ECDH-ES 키 유도 테스트
    console.log('Step 1: Test ECDH-ES key derivation')
    
    // 알고리즘 ID (선택적)
    const algId = Buffer.from('A256GCM')
    const apu = Buffer.from('sender-info')
    const apv = Buffer.from('recipient-info')
    
    try {
      const derivedKeyEs = askar.keyDeriveEcdhEs({
        receive: false, // 키를 송신하는 측
        apv: apv,
        apu: apu,
        algId: algId,
        recipientKey: recipientKey.handle,
        ephemeralKey: ephemeralKey.handle,
        algorithm: 'aes256-gcm' // 유도할 키 알고리즘
      })
      
      console.log('✅ ECDH-ES key derived successfully:')
      console.log('Derived key type:', typeof derivedKeyEs)
      console.log('Derived key handle:', derivedKeyEs.handle)
      
      // 유도된 키의 알고리즘 확인
      const derivedAlgorithm = askar.keyGetAlgorithm({ localKeyHandle: derivedKeyEs })
      console.log('✅ ECDH-ES derived key algorithm:', derivedAlgorithm)
      
      askar.keyFree({ localKeyHandle: derivedKeyEs })
      console.log('✅ ECDH-ES derived key freed')
      
    } catch (error) {
      console.log('⚠️  ECDH-ES key derivation result:', error.message)
    }
    
    // ECDH-1PU 키 유도 테스트
    console.log('Step 2: Test ECDH-1PU key derivation')
    
    const ccTag = Buffer.from('confirmation-tag')
    
    try {
      const derivedKey1pu = askar.keyDeriveEcdh1pu({
        senderKey: senderKey.handle,
        recipientKey: recipientKey.handle,
        algorithm: 'aes256-gcm',
        algId: algId,
        apu: apu,
        apv: apv,
        ccTag: ccTag,
        ephemeralKey: ephemeralKey.handle,
        receive: false
      })
      
      console.log('✅ ECDH-1PU key derived successfully:')
      console.log('Derived key type:', typeof derivedKey1pu)
      console.log('Derived key handle:', derivedKey1pu.handle)
      
      // 유도된 키의 알고리즘 확인
      const derived1puAlgorithm = askar.keyGetAlgorithm({ localKeyHandle: derivedKey1pu })
      console.log('✅ ECDH-1PU derived key algorithm:', derived1puAlgorithm)
      
      askar.keyFree({ localKeyHandle: derivedKey1pu })
      console.log('✅ ECDH-1PU derived key freed')
      
    } catch (error) {
      console.log('⚠️  ECDH-1PU key derivation result:', error.message)
    }
    
    // 키들 해제
    askar.keyFree({ localKeyHandle: ephemeralKey })
    askar.keyFree({ localKeyHandle: recipientKey })
    askar.keyFree({ localKeyHandle: senderKey })
    console.log('✅ All ECDH test keys freed successfully')
    
  } catch (error) {
    console.log('❌ ECDH key derivation test failed:', error.message)
    console.log('Error stack:', error.stack)
  }

  // keyGetSupportedBackends 테스트 추가
  console.log('\n--- Testing keyGetSupportedBackends ---')
  console.log('Attempting to get supported backends...')
  
  try {
    const supportedBackends = askar.keyGetSupportedBackends()
    
    console.log('✅ Supported backends retrieved successfully:')
    console.log('Backends type:', typeof supportedBackends)
    console.log('Backends array length:', supportedBackends.length)
    console.log('Supported backends:')
    
    supportedBackends.forEach((backend, index) => {
      console.log(`  ${index + 1}. ${backend}`)
    })
    
    // 일반적인 백엔드들 확인
    const expectedBackends = ['software']
    const foundExpected = expectedBackends.filter(backend => supportedBackends.includes(backend))
    
    if (foundExpected.length > 0) {
      console.log('✅ Found expected backends:', foundExpected.join(', '))
    } else {
      console.log('⚠️  No expected backends found')
    }
    
    if (supportedBackends.length > 0) {
      console.log('✅ At least one backend is supported')
    } else {
      console.log('❌ No backends are supported (unexpected)')
    }
    
  } catch (error) {
    console.log('❌ keyGetSupportedBackends test failed:', error.message)
    console.log('Error stack:', error.stack)
  }

  
} catch (error) {
  console.error('❌ Error occurred:', error.message)
  console.error('Stack:', error.stack)
  
  // Askar 인스턴스가 있으면 에러 정보 확인
  try {
    const askar = new NodeJSAskar()
    const currentError = askar.getCurrentError()
    console.log('Current error from native:', currentError)
  } catch (e) {
    console.error('Could not get current error:', e.message)
  }
}