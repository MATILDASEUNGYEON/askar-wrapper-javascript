const { NodeJSAskar } = require('./src/NodeJSAskar')

async function testStoreGenerateRawKey() {
  console.log('=== storeGenerateRawKey 테스트 시작 ===\n');
  
  const askar = new NodeJSAskar();
  
  try {
    // 테스트 1: seed 없이 호출 (undefined)
    console.log('테스트 1: seed 없이 호출');
    console.log('옵션:', { seed: undefined });
    
    const rawKey1 = askar.storeGenerateRawKey({ seed: undefined });
    console.log('생성된 키 길이:', rawKey1.length);
    console.log('생성된 키 (처음 20자):', rawKey1.substring(0, 20) + '...');
    console.log('✅ 성공\n');
    
    // 테스트 2: seed 없이 호출 (빈 객체)
    console.log('테스트 2: seed 없이 호출 (빈 객체)');
    console.log('옵션:', {});
    
    const rawKey2 = askar.storeGenerateRawKey({});
    console.log('생성된 키 길이:', rawKey2.length);
    console.log('생성된 키 (처음 20자):', rawKey2.substring(0, 20) + '...');
    console.log('✅ 성공\n');
    
    // 테스트 3: seed로 빈 Uint8Array 제공
    console.log('테스트 3: seed로 빈 Uint8Array 제공');
    const emptySeed = new Uint8Array(0);
    console.log('옵션:', { seed: emptySeed });
    console.log('seed 길이:', emptySeed.length);
    
    const rawKey3 = askar.storeGenerateRawKey({ seed: emptySeed });
    console.log('생성된 키 길이:', rawKey3.length);
    console.log('생성된 키 (처음 20자):', rawKey3.substring(0, 20) + '...');
    console.log('✅ 성공\n');
    
    // 테스트 4: seed로 실제 바이트 배열 제공
    console.log('테스트 4: seed로 실제 바이트 배열 제공');
    const realSeed = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    console.log('옵션:', { seed: realSeed });
    console.log('seed 길이:', realSeed.length);
    console.log('seed 내용:', Array.from(realSeed));
    
    const rawKey4 = askar.storeGenerateRawKey({ seed: realSeed });
    console.log('생성된 키 길이:', rawKey4.length);
    console.log('생성된 키 (처음 20자):', rawKey4.substring(0, 20) + '...');
    console.log('✅ 성공\n');
    
    // 테스트 5: 동일한 seed로 여러 번 호출 (deterministic 확인)
    console.log('테스트 5: 동일한 seed로 여러 번 호출');
    const deterministicSeed = new Uint8Array([42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42]);
    
    const rawKey5a = askar.storeGenerateRawKey({ seed: deterministicSeed });
    const rawKey5b = askar.storeGenerateRawKey({ seed: deterministicSeed });
    
    console.log('첫 번째 호출 결과 (처음 20자):', rawKey5a.substring(0, 20) + '...');
    console.log('두 번째 호출 결과 (처음 20자):', rawKey5b.substring(0, 20) + '...');
    console.log('결과가 동일한가?', rawKey5a === rawKey5b ? '✅ 동일' : '❌ 다름');
    console.log();
    
    // 테스트 6: Buffer를 Uint8Array로 변환하여 사용
    console.log('테스트 6: Buffer를 Uint8Array로 변환하여 사용');
    const bufferSeed = Buffer.from('hello world', 'utf8');
    const uint8ArraySeed = new Uint8Array(bufferSeed);
    console.log('Buffer 내용:', bufferSeed.toString('hex'));
    console.log('Uint8Array 길이:', uint8ArraySeed.length);
    
    const rawKey6 = askar.storeGenerateRawKey({ seed: uint8ArraySeed });
    console.log('생성된 키 길이:', rawKey6.length);
    console.log('생성된 키 (처음 20자):', rawKey6.substring(0, 20) + '...');
    console.log('✅ 성공\n');
    
    console.log('=== 모든 테스트 완료 ===');
    console.log('✅ storeGenerateRawKey 메서드가 모든 케이스에서 정상 작동합니다!');
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    console.error('스택 트레이스:', error.stack);
    process.exit(1);
  }
}

// Store 함수들 통합 테스트 추가
async function testStoreFunctions() {
  console.log('\n=== Store 함수들 통합 테스트 ===\n');
  
  const askar = new NodeJSAskar();
  
  try {
    // 1. Store 생성 테스트
    console.log('테스트 1: Store Provision (생성)');
    const storeUri = 'sqlite://:memory:';
    const passKey = 'test-password-123';
    const keyMethod = 'raw';
    const profile = 'test-profile';
    
    console.log('Store 생성 옵션:', {
      specUri: storeUri,
      keyMethod,
      passKey: '***',
      profile,
      recreate: true
    });
    
    const store = await askar.storeProvision({
      specUri: storeUri,
      keyMethod,
      passKey,
      profile,
      recreate: true
    });
    
    console.log('✅ Store 생성 성공. Handle:', store.handle);
    console.log();
    
    // 2. Store 열기 테스트
    console.log('테스트 2: Store Open (열기)');
    
    const openedStore = await askar.storeOpen({
      specUri: storeUri,
      keyMethod,
      passKey,
      profile
    });
    
    console.log('✅ Store 열기 성공. Handle:', openedStore.handle);
    console.log();
    
    // 3. Profile 관련 테스트
    console.log('테스트 3: Profile 관리');
    
    // 현재 프로필 이름 가져오기
    const currentProfileName = await askar.storeGetProfileName({ storeHandle: openedStore.handle });
    console.log('현재 프로필 이름:', currentProfileName);
    
    // 새 프로필 생성
    const newProfile = 'new-test-profile';
    console.log(`새 프로필 생성: ${newProfile}`);
    
    const createdProfile = await askar.storeCreateProfile({
      storeHandle: openedStore.handle,
      profile: newProfile
    });
    console.log('생성된 프로필 이름:', createdProfile);
    
    // 프로필 목록 조회
    console.log('프로필 목록 조회:');
    const profiles = await askar.storeListProfiles({ storeHandle: openedStore.handle });
    console.log('사용 가능한 프로필들:', profiles);
    
    // 프로필 이름 변경
    const renamedProfile = 'renamed-profile';
    console.log(`프로필 이름 변경: ${newProfile} -> ${renamedProfile}`);
    
    const renameResult = await askar.storeRenameProfile({
      storeHandle: openedStore.handle,
      fromProfile: newProfile,
      toProfile: renamedProfile
    });
    console.log('프로필 이름 변경 결과:', renameResult);
    
    // 변경 후 프로필 목록 다시 조회
    const profilesAfterRename = await askar.storeListProfiles({ storeHandle: openedStore.handle });
    console.log('이름 변경 후 프로필들:', profilesAfterRename);
    
    // 기본 프로필 설정
    console.log(`기본 프로필 설정: ${renamedProfile}`);
    await askar.storeSetDefaultProfile({
      storeHandle: openedStore.handle,
      profile: renamedProfile
    });
    
    // 기본 프로필 조회
    const defaultProfile = await askar.storeGetDefaultProfile({ storeHandle: openedStore.handle });
    console.log('기본 프로필:', defaultProfile);
    
    // 프로필 삭제
    console.log(`프로필 삭제: ${renamedProfile}`);
    const removeResult = await askar.storeRemoveProfile({
      storeHandle: openedStore.handle,
      profile: renamedProfile
    });
    console.log('프로필 삭제 결과:', removeResult);
    
    // 삭제 후 프로필 목록 조회
    const profilesAfterDelete = await askar.storeListProfiles({ storeHandle: openedStore.handle });
    console.log('삭제 후 프로필들:', profilesAfterDelete);
    
    console.log('✅ Profile 관리 테스트 성공\n');
    
    // 4. Store 복사 테스트
    console.log('테스트 4: Store Copy');
    const targetUri = 'sqlite://:memory:target';
    
    console.log('Store 복사:', {
      source: storeUri,
      target: targetUri
    });
    
    await askar.storeCopyTo({
      storeHandle: openedStore.handle,
      targetUri,
      keyMethod,
      passKey,
      recreate: true
    });
    console.log('✅ Store 복사 성공\n');
    
    // 5. Store 닫기
    console.log('테스트 5: Store Close');
    await askar.storeClose({ storeHandle: openedStore.handle });
    console.log('✅ Store 닫기 성공\n');
    
    // 6. Store 제거 테스트
    console.log('테스트 6: Store Remove');
    const removeStoreResult = await askar.storeRemove({ specUri: targetUri });
    console.log('Store 제거 결과:', removeStoreResult);
    console.log('✅ Store 제거 성공\n');
    
    console.log('=== 모든 Store 함수 테스트 완료 ===');
    console.log('✅ 모든 Store 함수들이 정상 작동합니다!');
    
  } catch (error) {
    console.error('❌ Store 함수 테스트 실패:', error.message);
    console.error('스택 트레이스:', error.stack);
    process.exit(1);
  }
}

// 에러 처리 테스트
async function testErrorHandling() {
  console.log('\n=== 에러 처리 테스트 ===\n');
  
  const askar = new NodeJSAskar();
  
  try {
    // 잘못된 URI로 Store 열기
    console.log('테스트 1: 잘못된 URI로 Store 열기');
    try {
      await askar.storeOpen({
        specUri: 'invalid://uri',
        keyMethod: 'raw',
        passKey: 'password',
        profile: 'default'
      });
      console.log('❌ 에러가 발생해야 하는데 성공했습니다.');
    } catch (error) {
      console.log('✅ 예상된 에러 발생:', error.message);
    }
    
    // 존재하지 않는 Store 열기
    console.log('\n테스트 2: 존재하지 않는 Store 열기');
    try {
      await askar.storeOpen({
        specUri: 'sqlite:///nonexistent/path/store.db',
        keyMethod: 'raw',
        passKey: 'password',
        profile: 'default'
      });
      console.log('❌ 에러가 발생해야 하는데 성공했습니다.');
    } catch (error) {
      console.log('✅ 예상된 에러 발생:', error.message);
    }
    
    // 잘못된 핸들로 작업 시도
    console.log('\n테스트 3: 잘못된 핸들로 작업 시도');
    try {
      await askar.storeGetProfileName({ storeHandle: 999999 });
      console.log('❌ 에러가 발생해야 하는데 성공했습니다.');
    } catch (error) {
      console.log('✅ 예상된 에러 발생:', error.message);
    }
    
    console.log('\n✅ 에러 처리 테스트 완료');
    
  } catch (error) {
    console.error('❌ 에러 처리 테스트 중 예상치 못한 오류:', error.message);
  }
}
    console.log('테스트 5: 동일한 seed로 여러 번 호출');
    const deterministicSeed = new Uint8Array([42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42]);
    
    const rawKey5a = askar.storeGenerateRawKey({ seed: deterministicSeed });
    const rawKey5b = askar.storeGenerateRawKey({ seed: deterministicSeed });
    
    console.log('첫 번째 호출 결과 (처음 20자):', rawKey5a.substring(0, 20) + '...');
    console.log('두 번째 호출 결과 (처음 20자):', rawKey5b.substring(0, 20) + '...');
    console.log('결과가 동일한가?', rawKey5a === rawKey5b ? '✅ 동일' : '❌ 다름');
    console.log();
    
    // 테스트 6: Buffer를 Uint8Array로 변환하여 사용
    console.log('테스트 6: Buffer를 Uint8Array로 변환하여 사용');
    const bufferSeed = Buffer.from('hello world', 'utf8');
    const uint8ArraySeed = new Uint8Array(bufferSeed);
    console.log('Buffer 내용:', bufferSeed.toString('hex'));
    console.log('Uint8Array 길이:', uint8ArraySeed.length);
    
    const rawKey6 = askar.storeGenerateRawKey({ seed: uint8ArraySeed });
    console.log('생성된 키 길이:', rawKey6.length);
    console.log('생성된 키 (처음 20자):', rawKey6.substring(0, 20) + '...');
    console.log('✅ 성공\n');
    
    console.log('=== 모든 테스트 완료 ===');
    console.log('✅ storeGenerateRawKey 메서드가 모든 케이스에서 정상 작동합니다!');
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    console.error('스택 트레이스:', error.stack);
    process.exit(1);
  }
}

// 타입 확인을 위한 추가 테스트
function testTypeHandling() {
  console.log('\n=== 타입 처리 테스트 ===');
  
  const askar = new NodeJSAskar();
  
  try {
    // 잘못된 타입 테스트들
    console.log('타입 안전성 테스트:');
    
    // 이 테스트들은 현재 구현에서 어떻게 처리되는지 확인
    const testCases = [
      { name: 'null', value: null },
      { name: 'string', value: 'test' },
      { name: 'number', value: 123 },
      { name: 'array', value: [1, 2, 3] },
      { name: 'plain object', value: { length: 5 } }
    ];
    
    testCases.forEach((testCase, index) => {
      try {
        console.log(`테스트 ${index + 1}: ${testCase.name} (${typeof testCase.value})`);
        const result = askar.storeGenerateRawKey({ seed: testCase.value });
        console.log(`  ✅ 성공: ${result.substring(0, 20)}...`);
      } catch (error) {
        console.log(`  ❌ 실패: ${error.message}`);
      }
    });
    
  } catch (error) {
    console.error('타입 테스트 오류:', error.message);
  }
}

// 메인 실행
if (require.main === module) {
  async function runAllTests() {
    try {
      // 1. storeGenerateRawKey 테스트
      await testStoreGenerateRawKey();
      
      // 2. 타입 처리 테스트
      testTypeHandling();
      
      // 3. Store 함수들 통합 테스트
      await testStoreFunctions();
      
      // 4. 에러 처리 테스트
      await testErrorHandling();
      
      console.log('\n🎉 모든 테스트가 성공적으로 완료되었습니다!');
      
    } catch (error) {
      console.error('\n💥 테스트 실행 중 오류:', error.message);
      console.error('스택 트레이스:', error.stack);
      process.exit(1);
    }
  }
  
  runAllTests();
}

module.exports = { 
  testStoreGenerateRawKey, 
  testTypeHandling, 
  testStoreFunctions, 
  testErrorHandling 
};
