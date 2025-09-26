const { NodeJSAskar } = require('./src/NodeJSAskar')

async function testSessionFunctions() {
  console.log('=== Session 함수들 테스트 시작 ===\n');
  
  const askar = new NodeJSAskar();
  let storeHandle = null;
  let sessionHandle = null;
  let keyHandle = null;
  
  try {
    /// 1. Store 생성 (테스트를 위한 준비)
    console.log('테스트 준비: Store 생성');
    try {
      // Raw key 생성
      const seed = new Uint8Array(32).fill(1) // 테스트용 시드
      const rawKey = askar.storeGenerateRawKey({ seed })
      console.log('Raw key 생성됨:', rawKey.substring(0, 20) + '...')
      
      // 타임아웃 추가
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('storeProvision timeout after 10 seconds')), 10000)
      })
      
      const storeProvisionPromise = askar.storeProvision({
        specUri: 'sqlite://:memory:',
        keyMethod: 'raw', // raw 키 방식 사용
        passKey: rawKey,   // 생성된 raw key 사용
        profile: null,
        recreate: false
      })
      
      storeHandle = await Promise.race([storeProvisionPromise, timeoutPromise])
      console.log('✅ Store created:', storeHandle.handle)
    } catch (error) {
      console.error('❌ storeProvision failed:', error)
      throw error
    }
    // ===== sessionStart 테스트 =====
    console.log('2. sessionStart 테스트');
    sessionHandle = await askar.sessionStart({
      storeHandle: storeHandle.handle,
      profile: null,
      asTransaction: true
    });
    console.log('세션 시작됨, handle:', sessionHandle);
    console.log('✅ sessionStart 성공\n');
    
    // ===== sessionCount 테스트 =====
    console.log('3. sessionCount 테스트');
    const countResult = await askar.sessionCount({
      sessionHandle: sessionHandle.handle,
      category: 'test-category',
      tagFilter: null
    });
    console.log('초기 카운트:', countResult);
    console.log('✅ sessionCount 성공\n');
    
    // ===== sessionUpdate 테스트 (데이터 추가) =====
    console.log('4. sessionUpdate 테스트 (INSERT)');
    const testValue = new Uint8Array([1, 2, 3, 4, 5]);
    await askar.sessionUpdate({
      sessionHandle: sessionHandle.handle,
      operation: 0, // INSERT
      category: 'test-category',
      name: 'test-entry-1',
      value: testValue,
      tags: '{"tag1": "value1", "tag2": "value2"}',
      expiryMs: -1
    });
    console.log('데이터 INSERT 완료');
    console.log('✅ sessionUpdate (INSERT) 성공\n');
    
    // 두 번째 데이터 추가
    const testValue2 = new Uint8Array([6, 7, 8, 9, 10]);
    await askar.sessionUpdate({
      sessionHandle: sessionHandle.handle,
      operation: 0, // INSERT
      category: 'test-category',
      name: 'test-entry-2',
      value: testValue2,
      tags: '{"tag1": "value1", "tag3": "value3"}',
      expiryMs: -1
    });
    console.log('두 번째 데이터 INSERT 완료\n');
    
    // ===== sessionCount 테스트 (다시) =====
    console.log('5. sessionCount 테스트 (데이터 추가 후)');
    const countAfterInsert = await askar.sessionCount({
      sessionHandle: sessionHandle.handle,
      category: 'test-category',
      tagFilter: null
    });
    console.log('INSERT 후 카운트:', countAfterInsert);
    console.log('✅ sessionCount 성공\n');
    
    // ===== sessionFetch 테스트 =====
    console.log('6. sessionFetch 테스트');
    const fetchResult = await askar.sessionFetch({
      sessionHandle: sessionHandle.handle,
      category: 'test-category',
      name: 'test-entry-1',
      forUpdate: false
    });
    
    if (fetchResult) {
      console.log('Fetch 결과 handle:', fetchResult);
      
      // 결과 확인
      const count = askar.entryListCount({ entryListHandle: fetchResult.handle });
      console.log('조회된 항목 수:', count);
      
      if (count > 0) {
        const category = askar.entryListGetCategory({ entryListHandle: fetchResult.handle, index: 0 });
        const name = askar.entryListGetName({ entryListHandle: fetchResult.handle, index: 0 });
        const value = askar.entryListGetValue({ entryListHandle: fetchResult.handle, index: 0 });
        const tags = askar.entryListGetTags({ entryListHandle: fetchResult.handle, index: 0 });
        
        console.log('조회된 데이터:');
        console.log('  - Category:', category);
        console.log('  - Name:', name);
        console.log('  - Value:', Array.from(value));
        console.log('  - Tags:', tags);
      }
      
      // 메모리 해제
      askar.entryListFree({ entryListHandle: fetchResult.handle });
    } else {
      console.log('데이터를 찾을 수 없음');
    }
    console.log('✅ sessionFetch 성공\n');
    
    // ===== sessionFetchAll 테스트 =====
    console.log('7. sessionFetchAll 테스트');
    const fetchAllResult = await askar.sessionFetchAll({
      sessionHandle: sessionHandle.handle,
      category: 'test-category',
      tagFilter: null,
      limit: -1,
      orderBy: null,
      descending: false,
      forUpdate: false
    });
    
    if (fetchAllResult) {
      console.log('FetchAll 결과 handle:', fetchAllResult);
      
      const allCount = askar.entryListCount({ entryListHandle: fetchAllResult.handle });
      console.log('조회된 전체 항목 수:', allCount);
      
      for (let i = 0; i < allCount; i++) {
        const category = askar.entryListGetCategory({ entryListHandle: fetchAllResult.handle, index: i });
        const name = askar.entryListGetName({ entryListHandle: fetchAllResult.handle, index: i });
        const value = askar.entryListGetValue({ entryListHandle: fetchAllResult.handle, index: i });
        const tags = askar.entryListGetTags({ entryListHandle: fetchAllResult.handle, index: i });
        
        console.log(`항목 ${i + 1}:`);
        console.log('  - Category:', category);
        console.log('  - Name:', name);
        console.log('  - Value:', Array.from(value));
        console.log('  - Tags:', tags);
      }
      
      // 메모리 해제
      askar.entryListFree({ entryListHandle: fetchAllResult.handle });
    }
    console.log('✅ sessionFetchAll 성공\n');
    
    // ===== sessionUpdate 테스트 (UPDATE) =====
    console.log('8. sessionUpdate 테스트 (UPDATE)');
    const updatedValue = new Uint8Array([10, 20, 30, 40, 50]);
    await askar.sessionUpdate({
      sessionHandle: sessionHandle.handle,
      operation: 1, // UPDATE
      category: 'test-category',
      name: 'test-entry-1',
      value: updatedValue,
      tags: '{"tag1": "updated_value1", "tag4": "value4"}',
      expiryMs: -1
    });
    console.log('데이터 UPDATE 완료');
    console.log('✅ sessionUpdate (UPDATE) 성공\n');
    
    // ===== 중간 커밋 (데이터를 실제로 저장하기 위해) =====
    console.log('중간 커밋: 세션을 커밋해서 데이터를 영구 저장');
    await askar.sessionClose({
      sessionHandle: sessionHandle.handle,
      commit: true
    });
    console.log('세션 커밋됨');
    
    // 새로운 세션 시작
    sessionHandle = await askar.sessionStart({
      storeHandle: storeHandle.handle,
      profile: null,
      asTransaction: true
    });
    console.log('새 세션 시작됨\n');
    
    // 다시 fetch 테스트 (커밋 후)
    console.log('커밋 후 sessionFetch 재테스트');
    const fetchResultAfterCommit = await askar.sessionFetch({
      sessionHandle: sessionHandle.handle,
      category: 'test-category',
      name: 'test-entry-1',
      forUpdate: false
    });
    
    if (fetchResultAfterCommit) {
      console.log('커밋 후 Fetch 결과 handle:', fetchResultAfterCommit);
      const count = askar.entryListCount({ entryListHandle: fetchResultAfterCommit.handle });
      console.log('커밋 후 조회된 항목 수:', count);
      
      if (count > 0) {
        const category = askar.entryListGetCategory({ entryListHandle: fetchResultAfterCommit.handle, index: 0 });
        const name = askar.entryListGetName({ entryListHandle: fetchResultAfterCommit.handle, index: 0 });
        const value = askar.entryListGetValue({ entryListHandle: fetchResultAfterCommit.handle, index: 0 });
        const tags = askar.entryListGetTags({ entryListHandle: fetchResultAfterCommit.handle, index: 0 });
        
        console.log('커밋 후 조회된 데이터:');
        console.log('  - Category:', category);
        console.log('  - Name:', name);
        console.log('  - Value:', Array.from(value));
        console.log('  - Tags:', tags);
      }
      askar.entryListFree({ entryListHandle: fetchResultAfterCommit.handle });
    } else {
      console.log('커밋 후에도 데이터를 찾을 수 없음');
    }
    console.log('✅ 커밋 후 sessionFetch 성공\n');
    
    // ===== 키 관련 테스트 =====
    console.log('9. 키 생성 및 sessionInsertKey 테스트');
    try {
      keyHandle = askar.keyGenerate({ 
        algorithm: 'ed25519',
        ephemeral: false,
        keyBackend: null 
      });
      console.log('키 생성됨, handle:', keyHandle);
      
      await askar.sessionInsertKey({
        sessionHandle: sessionHandle.handle,
        localKeyHandle: keyHandle.handle,
        name: 'test-key-1',
        metadata: '{"description": "Test key for session"}',
        tags: '{"keyType": "ed25519", "usage": "signing"}',
        expiryMs: -1
      });
      console.log('키 INSERT 완료');
      console.log('✅ sessionInsertKey 성공\n');
    } catch (error) {
      console.error('❌ 키 생성/삽입 오류:', error);
      // getCurrentError 호출
      try {
        const currentError = askar.getCurrentError();
        console.error('Askar 에러 정보:', currentError);
      } catch (e) {
        console.error('getCurrentError 호출 실패:', e);
      }
      throw error;
    }
    
    // ===== sessionFetchKey 테스트 =====
    console.log('10. sessionFetchKey 테스트');
    try {
      const fetchKeyResult = await askar.sessionFetchKey({
        sessionHandle: sessionHandle.handle,
        name: 'test-key-1',
        forUpdate: false
      });
      
      if (fetchKeyResult) {
        console.log('Key fetch 결과 handle:', fetchKeyResult);
        
        const keyCount = askar.keyEntryListCount({ keyEntryListHandle: fetchKeyResult.handle });
        console.log('조회된 키 수:', keyCount);
        
        if (keyCount > 0) {
          const algorithm = askar.keyEntryListGetAlgorithm({ keyEntryListHandle: fetchKeyResult.handle, index: 0 });
          const name = askar.keyEntryListGetName({ keyEntryListHandle: fetchKeyResult.handle, index: 0 });
          const metadata = askar.keyEntryListGetMetadata({ keyEntryListHandle: fetchKeyResult.handle, index: 0 });
          const tags = askar.keyEntryListGetTags({ keyEntryListHandle: fetchKeyResult.handle, index: 0 });
          
          console.log('조회된 키 정보:');
          console.log('  - Algorithm:', algorithm);
          console.log('  - Name:', name);
          console.log('  - Metadata:', metadata);
          console.log('  - Tags:', tags);
        }
        
        // 메모리 해제
        askar.keyEntryListFree({ keyEntryListHandle: fetchKeyResult.handle });
      }
      console.log('✅ sessionFetchKey 성공\n');
    } catch (error) {
      console.error('❌ sessionFetchKey 오류:', error);
      try {
        const currentError = askar.getCurrentError();
        console.error('Askar 에러 정보:', currentError);
      } catch (e) {
        console.error('getCurrentError 호출 실패:', e);
      }
    
    // ===== sessionFetchAllKeys 테스트 =====
    console.log('11. sessionFetchAllKeys 테스트');
    try {
      const fetchAllKeysResult = await askar.sessionFetchAllKeys({
        sessionHandle: sessionHandle.handle,
        algorithm: null,
        thumbprint: null,
        tagFilter: null,
        limit: -1,
        forUpdate: false
      });
      
      if (fetchAllKeysResult) {
        console.log('FetchAllKeys 결과 handle:', fetchAllKeysResult);
        
        const allKeysCount = askar.keyEntryListCount({ keyEntryListHandle: fetchAllKeysResult.handle });
        console.log('조회된 전체 키 수:', allKeysCount);
        
        for (let i = 0; i < allKeysCount; i++) {
          const algorithm = askar.keyEntryListGetAlgorithm({ keyEntryListHandle: fetchAllKeysResult.handle, index: i });
          const name = askar.keyEntryListGetName({ keyEntryListHandle: fetchAllKeysResult.handle, index: i });
          const metadata = askar.keyEntryListGetMetadata({ keyEntryListHandle: fetchAllKeysResult.handle, index: i });
          const tags = askar.keyEntryListGetTags({ keyEntryListHandle: fetchAllKeysResult.handle, index: i });
          
          console.log(`키 ${i + 1}:`);
          console.log('  - Algorithm:', algorithm);
          console.log('  - Name:', name);
          console.log('  - Metadata:', metadata);
          console.log('  - Tags:', tags);
        }
        
        // 메모리 해제
        askar.keyEntryListFree({ keyEntryListHandle: fetchAllKeysResult.handle });
      }
      console.log('✅ sessionFetchAllKeys 성공\n');
    } catch (error) {
      console.error('❌ sessionFetchAllKeys 오류:', error);
      try {
        const currentError = askar.getCurrentError();
        console.error('Askar 에러 정보:', currentError);
      } catch (e) {
        console.error('getCurrentError 호출 실패:', e);
      }
    }
    
    // ===== sessionUpdateKey 테스트 =====
    console.log('12. sessionUpdateKey 테스트');
    try {
      await askar.sessionUpdateKey({
        sessionHandle: sessionHandle.handle,
        name: 'test-key-1',
        metadata: '{"description": "Updated test key for session", "updated": true}',
        tags: '{"keyType": "ed25519", "usage": "signing", "status": "updated"}',
        expiryMs: -1
      });
      console.log('키 UPDATE 완료');
      console.log('✅ sessionUpdateKey 성공\n');
    } catch (error) {
      console.error('❌ sessionUpdateKey 오류:', error);
      try {
        const currentError = askar.getCurrentError();
        console.error('Askar 에러 정보:', currentError);
      } catch (e) {
        console.error('getCurrentError 호출 실패:', e);
      }
    }
    
    // ===== sessionRemoveAll 테스트 (일부 데이터) =====
    console.log('13. sessionRemoveAll 테스트 (특정 태그)');
    try {
      const removedCount = await askar.sessionRemoveAll({
        sessionHandle: sessionHandle.handle,
        category: 'test-category',
        tagFilter: '{"tag3": "value3"}'  // test-entry-2만 삭제될 것
      });
      console.log('삭제된 항목 수:', removedCount);
      console.log('✅ sessionRemoveAll 성공\n');
    } catch (error) {
      console.error('❌ sessionRemoveAll 오류:', error);
      try {
        const currentError = askar.getCurrentError();
        console.error('Askar 에러 정보:', currentError);
      } catch (e) {
        console.error('getCurrentError 호출 실패:', e);
      }
    }
    
    // ===== sessionRemoveKey 테스트 =====
    console.log('14. sessionRemoveKey 테스트');
    try {
      await askar.sessionRemoveKey({
        sessionHandle: sessionHandle.handle,
        name: 'test-key-1'
      });
      console.log('키 삭제 완료');
      console.log('✅ sessionRemoveKey 성공\n');
    } catch (error) {
      console.error('❌ sessionRemoveKey 오류:', error);
      try {
        const currentError = askar.getCurrentError();
        console.error('Askar 에러 정보:', currentError);
      } catch (e) {
        console.error('getCurrentError 호출 실패:', e);
      }
    }
    
    // ===== 최종 상태 확인 =====
    console.log('15. 최종 상태 확인');
    try {
      const finalCount = await askar.sessionCount({
        sessionHandle: sessionHandle.handle,
        category: 'test-category',
        tagFilter: null
      });
      console.log('최종 데이터 카운트:', finalCount);
      
      const finalKeyCount = await askar.sessionFetchAllKeys({
        sessionHandle: sessionHandle.handle,
        algorithm: null,
        thumbprint: null,
        tagFilter: null,
        limit: -1,
        forUpdate: false
      });
      
      if (finalKeyCount) {
        const keysRemaining = askar.keyEntryListCount({ keyEntryListHandle: finalKeyCount.handle });
        console.log('최종 키 카운트:', keysRemaining);
        askar.keyEntryListFree({ keyEntryListHandle: finalKeyCount.handle });
      }
      console.log('✅ 최종 상태 확인 완료\n');
    } catch (error) {
      console.error('❌ 최종 상태 확인 오류:', error);
      try {
        const currentError = askar.getCurrentError();
        console.error('Askar 에러 정보:', currentError);
      } catch (e) {
        console.error('getCurrentError 호출 실패:', e);
      }
    }
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
    console.error('에러 스택:', error.stack);
    
    // getCurrentError 호출해보기
    try {
      const currentError = askar.getCurrentError();
      console.error('Askar 에러 정보:', currentError);
    } catch (e) {
      console.error('getCurrentError 호출 실패:', e);
    }
  } finally {
    // 정리 작업
    try {
      if (keyHandle) {
        askar.keyFree({ localKeyHandle: keyHandle.handle });
        console.log('키 핸들 해제됨');
      }
      
      if (sessionHandle) {
        await askar.sessionClose({
          sessionHandle: sessionHandle.handle,
          commit: true
        });
        console.log('세션 닫힘 (커밋됨)');
        console.log('✅ sessionClose 성공');
      }
      
      if (storeHandle) {
        await askar.storeClose({ storeHandle: storeHandle.handle });
        console.log('스토어 닫힘');
      }
    } catch (error) {
      console.error('정리 작업 중 오류:', error);
    }
  }
  
  console.log('\n=== Session 함수들 테스트 완료 ===');
}

// 테스트 실행
if (require.main === module) {
  testSessionFunctions()
    .then(() => {
      console.log('\n🎉 모든 테스트 완료!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 테스트 실패:', error);
      process.exit(1);
    });
} else {
  module.exports = { testSessionFunctions };
}
}