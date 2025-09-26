// test-logger-custom.js
const { NodeJSAskar } = require('./src/NodeJSAskar')
const { LogLevel } = require('@openwallet-foundation/askar-shared')

console.log('Testing setCustomLogger function with koffi...')

try {
  const askar = new NodeJSAskar()
  console.log('✅ NodeJSAskar instance created')
  
  console.log('Version:', askar.version())
  
  const currentError = askar.getCurrentError()
  console.log('Current error before test:', currentError)
  
  // 커스텀 로거 콜백 함수 정의
  const customLogger = (context, level, target, message, modulePath, file, line) => {
    console.log(`[CUSTOM LOG] Level: ${level}, Target: ${target}, Message: ${message}`)
    console.log(`  Module: ${modulePath}, File: ${file}, Line: ${line}`)
    console.log(`  Context: ${context}`)
  }
  
  // 커스텀 로거 설정 (enabled와 flush는 boolean 값)
  console.log('Setting custom logger...')
  askar.setCustomLogger({
    logLevel: LogLevel.Debug,
    logger: customLogger,
    enabled: true,  // boolean 값
    flush: true     // boolean 값
  })
  console.log('✅ Custom logger set successfully')
  
  // 로그를 생성할 수 있는 작업 수행 (키 생성)
  console.log('\nGenerating key to trigger logging...')
  const key = askar.keyGenerate({
    algorithm: 'ed25519',
    ephemeral: false,
    keyBackend: 'software'
  })
  
  console.log('✅ Key generated successfully:')
  console.log('Key handle:', key.handle)
  
  // 키 알고리즘 조회 (추가 로그 생성)
  const algorithm = askar.keyGetAlgorithm({ localKeyHandle: key })
  console.log('✅ Key algorithm:', algorithm)
  
  // 키 해제
  askar.keyFree({ localKeyHandle: key })
  console.log('✅ Key freed successfully')
  
  // 커스텀 로거 해제
  console.log('\nClearing custom logger...')
  askar.clearCustomLogger()
  console.log('✅ Custom logger cleared')
  
  
  console.log('\n🎉 All custom logger tests passed!')
  
} catch (error) {
  console.error('❌ Test failed:', error)
  
  try {
    const askar = new NodeJSAskar()
    const currentError = askar.getCurrentError()
    console.error('Current error after failure:', currentError)
  } catch (e) {
    console.error('Could not get current error:', e)
  }
  
  process.exit(1)
}
