const { NodeJSAskar } = require('./src/NodeJSAskar')

async function debugSessionStart() {
  console.log('=== Session Start 디버깅 테스트 ===\n');
  
  const askar = new NodeJSAskar();
  let storeHandle = null;
  
  try {
    console.log('1. Askar 인스턴스 생성 완료');
    console.log('2. 네이티브 바인딩 확인...');
    
    // 네이티브 바인딩이 제대로 로드되었는지 확인
    console.log('Native askar 객체:', typeof askar.nativeAskar);
    console.log('askar_session_start 함수:', typeof askar.nativeAskar.askar_session_start);
    
    console.log('3. Store 생성 시도...');
    const seed = new Uint8Array(32).fill(1);
    const rawKey = askar.storeGenerateRawKey({ seed });
    console.log('Raw key 생성 완료:', rawKey.substring(0, 20) + '...');
    
    storeHandle = await askar.storeProvision({
      specUri: 'sqlite://:memory:',
      keyMethod: 'raw',
      passKey: rawKey,
      profile: null,
      recreate: false
    });
    console.log('Store 생성 완료, handle:', storeHandle.handle);
    
    console.log('4. Session Start 파라미터 준비...');
    const sessionParams = {
      storeHandle: storeHandle.handle,
      profile: null,
      asTransaction: 1  // boolean true -> 1 (int8)
    };
    console.log('Session 파라미터:', sessionParams);
    
    console.log('5. promisifyWithResponse 함수 확인...');
    
    console.log('6. Session Start 호출 준비...');
    
    // sessionStart 대신 직접 네이티브 함수를 호출해보자
    console.log('7. 직접 네이티브 함수 호출 시도...');
    
    // 먼저 콜백 없이 파라미터만 확인
    console.log('storeHandle 타입:', typeof storeHandle.handle, '값:', storeHandle.handle);
    console.log('profile 타입:', typeof sessionParams.profile, '값:', sessionParams.profile);
    console.log('asTransaction 타입:', typeof sessionParams.asTransaction, '값:', sessionParams.asTransaction);
    
    // 콜백 함수 생성
    console.log('8. 올바른 콜백 함수 생성...');
    
    // sessionStart 함수를 직접 호출하여 문제를 확인
    console.log('9. sessionStart 함수 직접 호출 시도...');
    
    try {
      // 타임아웃 추가
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('sessionStart 타임아웃 - 5초 경과')), 5000);
      });
      
      const sessionStartPromise = askar.sessionStart({
        storeHandle: storeHandle.handle,
        profile: null,
        asTransaction: true  // boolean 값을 전달 (serialize 함수가 숫자로 변환할 것)
      });
      
      console.log('sessionStart 호출 중...');
      const sessionHandle = await Promise.race([sessionStartPromise, timeoutPromise]);
      
      console.log('sessionStart 성공! handle:', sessionHandle);
      
      // 세션 닫기
      if (sessionHandle) {
        console.log('세션 닫기 시도...');
        await askar.sessionClose({
          sessionHandle: sessionHandle.handle,
          commit: false
        });
        console.log('세션 닫힘');
      }
      
    } catch (error) {
      console.error('sessionStart 호출 중 오류:', error);
      
      // 더 자세한 정보 수집
      if (error.message.includes('타임아웃')) {
        console.log('타임아웃 발생. 콜백이 호출되지 않았거나 응답이 없음');
        
        // 네이티브 바인딩 다시 확인
        console.log('네이티브 함수 시그니처 확인:');
        console.log('askar_session_start:', typeof askar.nativeAskar.askar_session_start);
        
        // 현재 에러 상태 확인
        try {
          const currentError = askar.getCurrentError();
          console.log('현재 Askar 에러:', currentError);
        } catch (e) {
          console.log('getCurrentError 실패:', e.message);
        }
      }
      
      throw error;
    }
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    console.error('스택 트레이스:', error.stack);
    
    try {
      const currentError = askar.getCurrentError();
      console.error('Askar 에러 정보:', currentError);
    } catch (e) {
      console.error('getCurrentError 호출 실패:', e);
    }
  } finally {
    if (storeHandle) {
      try {
        await askar.storeClose({ storeHandle: storeHandle.handle });
        console.log('Store 닫힘');
      } catch (error) {
        console.error('Store 닫기 실패:', error);
      }
    }
  }
  
  console.log('\n=== 디버깅 테스트 완료 ===');
}

// 테스트 실행
if (require.main === module) {
  debugSessionStart()
    .then(() => {
      console.log('\n🎉 디버깅 완료!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 디버깅 실패:', error);
      process.exit(1);
    });
}
