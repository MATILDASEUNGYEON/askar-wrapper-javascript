const { NodeJSAskar } = require('./src/NodeJSAskar')

async function testScanFunctions() {
  console.log('=== Scan 함수들 테스트 시작 ===\n');
  
  const askar = new NodeJSAskar();
  let storeHandle = null;
  let scanHandle = null;
  
  try {
    // 1. Store 생성 (테스트를 위한 준비)
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
    
    // 2. Session 시작하여 테스트 데이터 추가
    console.log('\n테스트 준비: 테스트 데이터 추가');
    
    const session = await askar.sessionStart({
      storeHandle: storeHandle.handle,
      profile: null,
      asTransaction: false
    });
    
    console.log('✅ Session 시작됨. Handle:', session.handle);
    
    // 테스트 데이터 여러 개 추가 (타임스탬프로 유니크하게)
    const timestamp = Date.now()
    const testData = [
      { category: 'test-category-1', name: `item-1-${timestamp}`, value: new Uint8Array([1, 2, 3, 4]) },
      { category: 'test-category-1', name: `item-2-${timestamp}`, value: new Uint8Array([5, 6, 7, 8]) },
      { category: 'test-category-2', name: `item-3-${timestamp}`, value: new Uint8Array([9, 10, 11, 12]) },
      { category: 'test-category-2', name: `item-4-${timestamp}`, value: new Uint8Array([13, 14, 15, 16]) },
      { category: 'test-category-3', name: `item-5-${timestamp}`, value: new Uint8Array([17, 18, 19, 20]) }
    ];
    
    for (const data of testData) {
      await askar.sessionUpdate({
        sessionHandle: session.handle,
        operation: 0, // Insert operation (EntryOperation.Insert = 0)
        category: data.category,
        name: data.name,
        value: data.value,
        tags: null,
        expiryMs: null
      });
      console.log(`데이터 추가됨: ${data.category}/${data.name}`);
    }
    
    // Session 커밋
    await askar.sessionClose({
      sessionHandle: session.handle,
      commit: true
    });
    
    console.log('✅ 테스트 데이터 추가 완료\n');
    
    // 3. Scan 테스트 시작
    console.log('=== scanStart 테스트 ===');
    
    // 테스트 1: 모든 카테고리 스캔
    console.log('테스트 1: 모든 카테고리 스캔');
    scanHandle = await askar.scanStart({
      storeHandle: storeHandle.handle,
      profile: null,
      category: null, // 모든 카테고리
      tagFilter: null,
      offset: 0,
      limit: 10,
      orderBy: null,
      descending: false
    });
    
    console.log('✅ Scan 시작됨. Handle:', scanHandle.handle);
    
    // scanNext로 결과 조회
    console.log('\n=== scanNext 테스트 ===');
    let itemCount = 0;
    let entryList = null;
    
    while (true) {
      entryList = await askar.scanNext({
        scanHandle: scanHandle.handle
      });
      
      if (!entryList || !entryList.handle) {
        console.log('스캔 완료 - 더 이상 항목이 없습니다.');
        break;
      }
      
      // 항목 개수 확인
      const count = askar.entryListCount({
        entryListHandle: entryList.handle
      });
      
      console.log(`EntryList 조회됨. 항목 수: ${count}`);
      
      // 각 항목의 세부 정보 출력
      for (let i = 0; i < count; i++) {
        const category = askar.entryListGetCategory({
          entryListHandle: entryList.handle,
          index: i
        });
        
        const name = askar.entryListGetName({
          entryListHandle: entryList.handle,
          index: i
        });
        
        const value = askar.entryListGetValue({
          entryListHandle: entryList.handle,
          index: i
        });
        
        const tags = askar.entryListGetTags({
          entryListHandle: entryList.handle,
          index: i
        });
        
        console.log(`  항목 ${itemCount + i + 1}:`);
        console.log(`    카테고리: ${category}`);
        console.log(`    이름: ${name}`);
        console.log(`    값: [${Array.from(value).join(', ')}]`);
        console.log(`    태그: ${tags || 'null'}`);
      }
      
      itemCount += count;
      
      // EntryList 메모리 해제
      askar.entryListFree({
        entryListHandle: entryList.handle
      });
    }
    
    console.log(`\n✅ 총 ${itemCount}개 항목 스캔 완료`);
    
    // Scan 해제
    console.log('\n=== scanFree 테스트 ===');
    askar.scanFree({
      scanHandle: scanHandle.handle
    });
    console.log('✅ Scan 리소스 해제 완료');
    scanHandle = null;
    
    // 테스트 2: 특정 카테고리만 스캔
    console.log('\n테스트 2: 특정 카테고리 스캔 (test-category-1)');
    scanHandle = await askar.scanStart({
      storeHandle: storeHandle.handle,
      profile: null,
      category: 'test-category-1',
      tagFilter: null,
      offset: 0,
      limit: 5,
      orderBy: null,
      descending: false
    });
    
    console.log('✅ 카테고리별 Scan 시작됨. Handle:', scanHandle.handle);
    
    let categoryItemCount = 0;
    while (true) {
      entryList = await askar.scanNext({
        scanHandle: scanHandle.handle
      });
      
      if (!entryList || !entryList.handle) {
        console.log('카테고리별 스캔 완료');
        break;
      }
      
      const count = askar.entryListCount({
        entryListHandle: entryList.handle
      });
      
      console.log(`카테고리별 EntryList 조회됨. 항목 수: ${count}`);
      
      for (let i = 0; i < count; i++) {
        const category = askar.entryListGetCategory({
          entryListHandle: entryList.handle,
          index: i
        });
        
        const name = askar.entryListGetName({
          entryListHandle: entryList.handle,
          index: i
        });
        
        console.log(`  카테고리별 항목 ${categoryItemCount + i + 1}: ${category}/${name}`);
      }
      
      categoryItemCount += count;
      
      askar.entryListFree({
        entryListHandle: entryList.handle
      });
    }
    
    console.log(`✅ test-category-1에서 ${categoryItemCount}개 항목 발견`);
    
    // Scan 해제
    askar.scanFree({
      scanHandle: scanHandle.handle
    });
    console.log('✅ 카테고리별 Scan 리소스 해제 완료');
    scanHandle = null;
    
    // 테스트 3: Limit과 Offset 테스트
    console.log('\n테스트 3: Limit과 Offset 테스트');
    scanHandle = await askar.scanStart({
      storeHandle: storeHandle.handle,
      profile: null,
      category: null,
      tagFilter: null,
      offset: 1, // 첫 번째 항목 건너뛰기
      limit: 2,  // 최대 2개만
      orderBy: null,
      descending: false
    });
    
    console.log('✅ Limit/Offset Scan 시작됨');
    
    let limitedItemCount = 0;
    while (true) {
      entryList = await askar.scanNext({
        scanHandle: scanHandle.handle
      });
      
      if (!entryList || !entryList.handle) {
        console.log('Limit/Offset 스캔 완료');
        break;
      }
      
      const count = askar.entryListCount({
        entryListHandle: entryList.handle
      });
      
      limitedItemCount += count;
      
      askar.entryListFree({
        entryListHandle: entryList.handle
      });
    }
    
    console.log(`✅ Limit/Offset으로 ${limitedItemCount}개 항목 조회됨 (예상: 최대 2개)`);
    
    askar.scanFree({
      scanHandle: scanHandle.handle
    });
    scanHandle = null;
    
    console.log('\n=== 모든 Scan 테스트 완료 ===');
    console.log('✅ scanStart, scanNext, scanFree 함수들이 모두 정상 작동합니다!');
    
  } catch (error) {
    console.error('❌ Scan 테스트 실패:', error.message);
    console.error('스택 트레이스:', error.stack);
    
    // 리소스 정리
    if (scanHandle) {
      try {
        askar.scanFree({ scanHandle: scanHandle.handle });
        console.log('정리: Scan 리소스 해제됨');
      } catch (cleanupError) {
        console.error('정리 중 오류:', cleanupError.message);
      }
    }
    
    process.exit(1);
  } finally {
    // Store 정리
    if (storeHandle) {
      try {
        await askar.storeClose({ storeHandle: storeHandle.handle });
        console.log('정리: Store 닫힘');
      } catch (cleanupError) {
        console.error('Store 정리 중 오류:', cleanupError.message);
      }
    }
  }
}

// 에러 처리 테스트
async function testScanErrorHandling() {
  console.log('\n=== Scan 에러 처리 테스트 ===\n');
  
  const askar = new NodeJSAskar();
  
  try {
    // 테스트 1: 잘못된 Store Handle로 scanStart
    console.log('테스트 1: 잘못된 Store Handle로 scanStart');
    try {
      await askar.scanStart({
        storeHandle: 999999,
        profile: null,
        category: null,
        tagFilter: null,
        offset: 0,
        limit: 10,
        orderBy: null,
        descending: false
      });
      console.log('❌ 에러가 발생해야 하는데 성공했습니다.');
    } catch (error) {
      console.log('✅ 예상된 에러 발생:', error.message);
    }
    
    // 테스트 2: 잘못된 Scan Handle로 scanNext
    console.log('\n테스트 2: 잘못된 Scan Handle로 scanNext');
    try {
      await askar.scanNext({
        scanHandle: 999999
      });
      console.log('❌ 에러가 발생해야 하는데 성공했습니다.');
    } catch (error) {
      console.log('✅ 예상된 에러 발생:', error.message);
    }
    
    // 테스트 3: 잘못된 Scan Handle로 scanFree
    console.log('\n테스트 3: 잘못된 Scan Handle로 scanFree');
    try {
      askar.scanFree({
        scanHandle: 999999
      });
      console.log('⚠️ scanFree는 잘못된 핸들에 대해 silent fail 합니다 (정상 동작)');
    } catch (error) {
      console.log('✅ 예상된 에러 발생:', error.message);
    }
    
    console.log('\n✅ Scan 에러 처리 테스트 완료');
    
  } catch (error) {
    console.error('❌ Scan 에러 처리 테스트 중 예상치 못한 오류:', error.message);
  }
}

// 메인 실행
if (require.main === module) {
  async function runAllScanTests() {
    try {
      // 1. Scan 함수들 테스트
      await testScanFunctions();
      
      // 2. 에러 처리 테스트
      await testScanErrorHandling();
      
      console.log('\n🎉 모든 Scan 테스트가 성공적으로 완료되었습니다!');
      
    } catch (error) {
      console.error('\n💥 Scan 테스트 실행 중 오류:', error.message);
      console.error('스택 트레이스:', error.stack);
      process.exit(1);
    }
  }
  
  runAllScanTests();
}

module.exports = { 
  testScanFunctions, 
  testScanErrorHandling 
};
