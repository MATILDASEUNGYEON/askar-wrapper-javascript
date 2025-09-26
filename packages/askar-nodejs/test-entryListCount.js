// test-entryListCount.js
const koffi = require('koffi')
const { NodeJSAskar } = require('./src/NodeJSAskar')

console.log('Testing entryListCount and entryListGet* functions...')

async function testEntryListCount() {
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
      asTransaction: true  // 트랜잭션 모드로 변경
    })
    console.log('✅ Session started:', sessionHandle.handle)
    
    // 3. 테스트 데이터 삽입
    console.log('\n--- Inserting test data ---')
    const testData = [
      { name: 'test-entry-1', value: Buffer.from('value1'), category: 'test-category', tags: '{}' },
      { name: 'test-entry-2', value: Buffer.from('value2'), category: 'test-category', tags: '{"type":"document","priority":"high"}' },
      { name: 'test-entry-3', value: Buffer.from('value3'), category: 'other-category', tags: '{"type":"config"}' }
    ]
    
    for (const data of testData) {
      await askar.sessionUpdate({
        sessionHandle,
        operation: 0, // INSERT (EntryOperation.Insert)
        category: data.category,
        name: data.name,
        value: data.value,
        tags: data.tags,
        expiryMs: -1
      })
      console.log(`✅ Inserted: ${data.name} in ${data.category} with tags: ${data.tags}`)
    }
    
    // 4. sessionFetchAll로 엔트리 리스트 가져오기
    console.log('\n--- Fetching all entries from test-category ---')
    const entryListHandle = await askar.sessionFetchAll({
      sessionHandle,
      category: 'test-category',
      tagFilter: null,
      limit: -1,
      orderBy: null,
      descending: false,
      forUpdate: false
    })
    
    if (!entryListHandle) {
      throw new Error('Failed to get entry list handle')
    }
    console.log('✅ Entry list handle obtained:', entryListHandle.handle)
    
    // 5. entryListCount 테스트
    console.log('\n--- Testing entryListCount ---')
    const count = askar.entryListCount({ entryListHandle })
    console.log('✅ Entry count:', count)
    console.log('Expected count: 2 (test-entry-1, test-entry-2)')
    
    if (count === 2) {
      console.log('🎉 Test PASSED: Count matches expected value')
    } else {
      console.log('❌ Test FAILED: Count does not match expected value')
    }

    // 5.1. entryListGet* 함수들 테스트
    console.log('\n--- Testing entryListGet* functions ---')
    
    // 첫 번째 엔트리 테스트 (index: 0)
    console.log('\n-- Testing entry at index 0 --')
    try {
      const category0 = askar.entryListGetCategory({ entryListHandle, index: 0 })
      console.log('✅ Category at index 0:', category0)
      
      const name0 = askar.entryListGetName({ entryListHandle, index: 0 })
      console.log('✅ Name at index 0:', name0)
      
      const value0 = askar.entryListGetValue({ entryListHandle, index: 0 })
      console.log('✅ Value at index 0:', Buffer.from(value0).toString())
      
      const tags0 = askar.entryListGetTags({ entryListHandle, index: 0 })
      console.log('✅ Tags at index 0:', tags0)
      
      // 예상 값 검증
      if (category0 === 'test-category' && 
          (name0 === 'test-entry-1' || name0 === 'test-entry-2') &&
          (Buffer.from(value0).toString() === 'value1' || Buffer.from(value0).toString() === 'value2') &&
          (tags0 === '{}' || tags0 === '{"type":"document","priority":"high"}')) {
        console.log('🎉 Entry 0 validation PASSED')
      } else {
        console.log('❌ Entry 0 validation FAILED')
        console.log('  Expected: category=test-category, name=test-entry-1/2, value=value1/2, tags={}/complex')
        console.log(`  Actual: category=${category0}, name=${name0}, value=${Buffer.from(value0).toString()}, tags=${tags0}`)
      }
    } catch (error) {
      console.error('❌ Error testing entry at index 0:', error)
    }
    
    // 두 번째 엔트리 테스트 (index: 1)
    console.log('\n-- Testing entry at index 1 --')
    try {
      const category1 = askar.entryListGetCategory({ entryListHandle, index: 1 })
      console.log('✅ Category at index 1:', category1)
      
      const name1 = askar.entryListGetName({ entryListHandle, index: 1 })
      console.log('✅ Name at index 1:', name1)
      
      const value1 = askar.entryListGetValue({ entryListHandle, index: 1 })
      console.log('✅ Value at index 1:', Buffer.from(value1).toString())
      
      const tags1 = askar.entryListGetTags({ entryListHandle, index: 1 })
      console.log('✅ Tags at index 1:', tags1)
      
      // 예상 값 검증
      if (category1 === 'test-category' && 
          (name1 === 'test-entry-1' || name1 === 'test-entry-2') &&
          (Buffer.from(value1).toString() === 'value1' || Buffer.from(value1).toString() === 'value2') &&
          (tags1 === '{}' || tags1 === '{"type":"document","priority":"high"}')) {
        console.log('🎉 Entry 1 validation PASSED')
      } else {
        console.log('❌ Entry 1 validation FAILED')
        console.log('  Expected: category=test-category, name=test-entry-1/2, value=value1/2, tags={}/complex')
        console.log(`  Actual: category=${category1}, name=${name1}, value=${Buffer.from(value1).toString()}, tags=${tags1}`)
      }
    } catch (error) {
      console.error('❌ Error testing entry at index 1:', error)
    }
    
    // 잘못된 인덱스 테스트
    console.log('\n-- Testing invalid index --')
    try {
      const invalidCategory = askar.entryListGetCategory({ entryListHandle, index: 999 })
      console.log('❌ Invalid index should have failed, but got:', invalidCategory)
    } catch (error) {
      console.log('✅ Invalid index correctly threw error:', error.message)
    }
    
    // 6. 다른 카테고리로 테스트
    console.log('\n--- Fetching all entries from other-category ---')
    const entryListHandle2 = await askar.sessionFetchAll({
      sessionHandle,
      category: 'other-category',
      tagFilter: null,
      limit: -1,
      orderBy: null,
      descending: false,
      forUpdate: false
    })
    
    if (entryListHandle2) {
      const count2 = askar.entryListCount({ entryListHandle: entryListHandle2 })
      console.log('✅ Entry count for other-category:', count2)
      console.log('Expected count: 1 (test-entry-3)')
      
      if (count2 === 1) {
        console.log('🎉 Test PASSED: Count matches expected value')
      } else {
        console.log('❌ Test FAILED: Count does not match expected value')
      }
      
      // other-category 엔트리 상세 테스트
      console.log('\n-- Testing other-category entry details --')
      try {
        const categoryOther = askar.entryListGetCategory({ entryListHandle: entryListHandle2, index: 0 })
        console.log('✅ Other category:', categoryOther)
        
        const nameOther = askar.entryListGetName({ entryListHandle: entryListHandle2, index: 0 })
        console.log('✅ Other name:', nameOther)
        
        const valueOther = askar.entryListGetValue({ entryListHandle: entryListHandle2, index: 0 })
        console.log('✅ Other value:', Buffer.from(valueOther).toString())
        
        const tagsOther = askar.entryListGetTags({ entryListHandle: entryListHandle2, index: 0 })
        console.log('✅ Other tags:', tagsOther)
        
        // 예상 값 검증
        if (categoryOther === 'other-category' && 
            nameOther === 'test-entry-3' &&
            Buffer.from(valueOther).toString() === 'value3' &&
            tagsOther === '{"type":"config"}') {
          console.log('🎉 Other category entry validation PASSED')
        } else {
          console.log('❌ Other category entry validation FAILED')
          console.log('  Expected: category=other-category, name=test-entry-3, value=value3, tags={"type":"config"}')
          console.log(`  Actual: category=${categoryOther}, name=${nameOther}, value=${Buffer.from(valueOther).toString()}, tags=${tagsOther}`)
        }
      } catch (error) {
        console.error('❌ Error testing other category entry:', error)
      }
      
      // 엔트리 리스트 해제
      askar.entryListFree({ entryListHandle: entryListHandle2 })
      console.log('✅ Entry list 2 freed')
    }
    
    // 7. 빈 결과 테스트
    console.log('\n--- Testing empty result ---')
    const emptyListHandle = await askar.sessionFetchAll({
      sessionHandle,
      category: 'non-existent-category',
      tagFilter: null,
      limit: -1,
      orderBy: null,
      descending: false,
      forUpdate: false
    })
    
    if (emptyListHandle) {
      const emptyCount = askar.entryListCount({ entryListHandle: emptyListHandle })
      console.log('✅ Empty list count:', emptyCount)
      console.log('Expected count: 0')
      
      if (emptyCount === 0) {
        console.log('🎉 Test PASSED: Empty count is correct')
      } else {
        console.log('❌ Test FAILED: Empty count is not zero')
      }
      
      // 빈 리스트에서 entryListGet* 함수 테스트 (에러 예상)
      console.log('\n-- Testing entryListGet* on empty list --')
      try {
        const emptyCategory = askar.entryListGetCategory({ entryListHandle: emptyListHandle, index: 0 })
        console.log('❌ Empty list access should have failed, but got category:', emptyCategory)
      } catch (error) {
        console.log('✅ Empty list access correctly threw error:', error.message)
      }
      
      // 엔트리 리스트 해제
      askar.entryListFree({ entryListHandle: emptyListHandle })
      console.log('✅ Empty entry list freed')
    } else {
      console.log('✅ No entries found for non-existent category (expected)')
    }
    
    // 8. 리소스 정리
    console.log('\n--- Cleaning up ---')
    askar.entryListFree({ entryListHandle })
    console.log('✅ Entry list freed')
    
    await askar.sessionClose({
      sessionHandle,
      commit: true
    })
    console.log('✅ Session closed')
    
    await askar.storeClose({ storeHandle })
    console.log('✅ Store closed')
    
    console.log('\n🎉 All entryListCount and entryListGet* tests completed successfully!')
    
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
testEntryListCount()

