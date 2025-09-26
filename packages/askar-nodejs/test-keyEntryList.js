// test-keyEntryList.js
const koffi = require('koffi')
const { NodeJSAskar } = require('./src/NodeJSAskar')

console.log('Testing keyEntryList functions...')

async function testKeyEntryList() {
  try {
    const askar = new NodeJSAskar()
    console.log('✅ NodeJSAskar instance created')
    
    console.log('Version:', askar.version())
    
    // 1. 임시 in-memory store 생성
    console.log('\n--- Creating in-memory store ---')
    
    // kdf 방식 사용 (더 간단함)
    console.log('Calling storeProvision...')
    let storeHandle
    try {
      // 타임아웃 추가
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('storeProvision timeout after 10 seconds')), 10000)
      })
      
      const storeProvisionPromise = askar.storeProvision({
        specUri: 'sqlite://:memory:',
        keyMethod: 'kdf:argon2i:mod',
        passKey: 'test-password-123',
        profile: null,
        recreate: false
      })
      
      storeHandle = await Promise.race([storeProvisionPromise, timeoutPromise])
      console.log('✅ Store created:', storeHandle.handle)
    } catch (error) {
      console.error('❌ storeProvision failed:', error)
      throw error
    }
    
    // 2. 세션 시작
    console.log('\n--- Starting session ---')
    const sessionHandle = await askar.sessionStart({
      storeHandle,
      profile: null,
      asTransaction: true
    })
    console.log('✅ Session started:', sessionHandle.handle)
    
    // 3. 테스트 키 생성 및 삽입
    console.log('\n--- Generating and inserting test keys ---')
    
    // Ed25519 키 생성
    const ed25519Key = askar.keyGenerate({
      algorithm: 'ed25519',
      ephemeral: false,
      keyBackend: null
    })
    console.log('✅ Ed25519 key generated')
    
    // X25519 키 생성  
    const x25519Key = askar.keyGenerate({
      algorithm: 'x25519',
      ephemeral: false,
      keyBackend: null
    })
    console.log('✅ X25519 key generated')
    
    // 키들을 세션에 삽입
    await askar.sessionInsertKey({
      sessionHandle,
      localKeyHandle: ed25519Key,
      name: 'test-ed25519-key',
      metadata: 'Ed25519 signing key',
      tags: '{"purpose": "signing", "algorithm": "ed25519"}',
      expiryMs: -1
    })
    console.log('✅ Ed25519 key inserted as test-ed25519-key')
    
    await askar.sessionInsertKey({
      sessionHandle,
      localKeyHandle: x25519Key,
      name: 'test-x25519-key',
      metadata: 'X25519 encryption key',
      tags: '{"purpose": "encryption", "algorithm": "x25519"}', 
      expiryMs: -1
    })
    console.log('✅ X25519 key inserted as test-x25519-key')
    
    // 4. sessionFetchAllKeys로 키 엔트리 리스트 가져오기
    console.log('\n--- Fetching all keys ---')
    const keyEntryListHandle = await askar.sessionFetchAllKeys({
      sessionHandle,
      algorithm: null, // 모든 알고리즘
      thumbprint: null,
      tagFilter: null,
      limit: -1,
      forUpdate: false
    })
    
    if (!keyEntryListHandle) {
      throw new Error('Failed to get key entry list handle')
    }
    console.log('✅ Key entry list handle obtained:', keyEntryListHandle.handle)
    
    // 5. keyEntryListCount 테스트
    console.log('\n--- Testing keyEntryListCount ---')
    const keyCount = askar.keyEntryListCount({ keyEntryListHandle })
    console.log('✅ Key count:', keyCount)
    console.log('Expected count: 2 (test-ed25519-key, test-x25519-key)')
    
    if (keyCount === 2) {
      console.log('🎉 Test PASSED: Key count matches expected value')
    } else {
      console.log('❌ Test FAILED: Key count does not match expected value')
    }
    
    // 6. keyEntryListGet* 함수들 테스트
    console.log('\n--- Testing keyEntryListGet* functions ---')
    for (let i = 0; i < keyCount; i++) {
      console.log(`\n--- Testing key entry index ${i} ---`)
      
      // 키 이름 가져오기
      const keyName = askar.keyEntryListGetName({ keyEntryListHandle, index: i })
      console.log(`✅ Key ${i} name: ${keyName}`)
      
      // 키 알고리즘 가져오기
      const algorithm = askar.keyEntryListGetAlgorithm({ keyEntryListHandle, index: i })
      console.log(`✅ Key ${i} algorithm: ${algorithm}`)
      
      // 키 메타데이터 가져오기
      const metadata = askar.keyEntryListGetMetadata({ keyEntryListHandle, index: i })
      console.log(`✅ Key ${i} metadata: ${metadata}`)
      
      // 키 태그 가져오기
      const tags = askar.keyEntryListGetTags({ keyEntryListHandle, index: i })
      console.log(`✅ Key ${i} tags: ${tags}`)
      
      // 예상값 검증
      if (keyName === 'test-ed25519-key') {
        if (algorithm === 'ed25519' && metadata === 'Ed25519 signing key') {
          console.log('🎉 Ed25519 key validation PASSED')
        } else {
          console.log('❌ Ed25519 key validation FAILED')
        }
      } else if (keyName === 'test-x25519-key') {
        if (algorithm === 'x25519' && metadata === 'X25519 encryption key') {
          console.log('🎉 X25519 key validation PASSED')
        } else {
          console.log('❌ X25519 key validation FAILED')
        }
      }
    }
    
    // 7. keyEntryListLoadLocal 테스트
    console.log('\n--- Testing keyEntryListLoadLocal ---')
    for (let i = 0; i < keyCount; i++) {
      console.log(`\n--- Loading local key from index ${i} ---`)
      
      try {
        const localKeyHandle = askar.keyEntryListLoadLocal({ keyEntryListHandle, index: i })
        console.log(`✅ Local key ${i} loaded:`, localKeyHandle.handle)
        
        // 로드된 키의 알고리즘 확인
        const loadedAlgorithm = askar.keyGetAlgorithm({ localKeyHandle })
        console.log(`✅ Loaded key ${i} algorithm: ${loadedAlgorithm}`)
        
        // 원본 알고리즘과 비교
        const originalAlgorithm = askar.keyEntryListGetAlgorithm({ keyEntryListHandle, index: i })
        if (loadedAlgorithm === originalAlgorithm) {
          console.log(`🎉 Algorithm verification PASSED for key ${i}`)
        } else {
          console.log(`❌ Algorithm verification FAILED for key ${i}`)
        }
        
        // 키 메모리 해제
        askar.keyFree({ localKeyHandle })
        console.log(`✅ Local key ${i} freed`)
        
      } catch (error) {
        console.error(`❌ Failed to load local key ${i}:`, error)
      }
    }
    
    // 8. 특정 알고리즘으로 필터링 테스트
    console.log('\n--- Testing filtering by algorithm ---')
    const ed25519Keys = await askar.sessionFetchAllKeys({
      sessionHandle,
      algorithm: 'ed25519',
      thumbprint: null,
      tagFilter: null,
      limit: -1,
      forUpdate: false
    })
    
    if (ed25519Keys) {
      const ed25519Count = askar.keyEntryListCount({ keyEntryListHandle: ed25519Keys })
      console.log('✅ Ed25519 key count:', ed25519Count)
      console.log('Expected count: 1')
      
      if (ed25519Count === 1) {
        console.log('🎉 Algorithm filtering PASSED')
        
        // 로드 테스트
        const localKey = askar.keyEntryListLoadLocal({ keyEntryListHandle: ed25519Keys, index: 0 })
        const algorithm = askar.keyGetAlgorithm({ localKeyHandle: localKey })
        console.log('✅ Filtered key algorithm:', algorithm)
        
        if (algorithm === 'ed25519') {
          console.log('🎉 Filtered key algorithm verification PASSED')
        } else {
          console.log('❌ Filtered key algorithm verification FAILED')
        }
        
        askar.keyFree({ localKeyHandle: localKey })
        console.log('✅ Filtered local key freed')
      } else {
        console.log('❌ Algorithm filtering FAILED')
      }
      
      askar.keyEntryListFree({ keyEntryListHandle: ed25519Keys })
      console.log('✅ Ed25519 key entry list freed')
    }
    
    // 9. 리소스 정리
    console.log('\n--- Cleaning up ---')
    askar.keyEntryListFree({ keyEntryListHandle })
    console.log('✅ Key entry list freed')
    
    // 원본 키들도 해제
    askar.keyFree({ localKeyHandle: ed25519Key })
    askar.keyFree({ localKeyHandle: x25519Key })
    console.log('✅ Original keys freed')
    
    await askar.sessionClose({
      sessionHandle,
      commit: true
    })
    console.log('✅ Session closed')
    
    await askar.storeClose({ storeHandle })
    console.log('✅ Store closed')
    
    console.log('\n🎉 All keyEntryList tests completed successfully!')
    
  } catch (error) {
    console.error('❌ Test failed with error:', error)
    
    // 현재 에러 확인
    try {
      const askar = new NodeJSAskar()
      const currentError = askar.getCurrentError()
      if (currentError && currentError.message !== 'Success') {
        console.error('Current Askar error:', currentError)
      }
    } catch (e) {
      console.error('Failed to get current error:', e)
    }
  }
}

// 테스트 실행
testKeyEntryList()
