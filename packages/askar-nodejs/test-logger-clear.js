// test-logger-clear.js
const { NodeJSAskar } = require('./src/NodeJSAskar')
const { LogLevel } = require('@openwallet-foundation/askar-shared')

console.log('Testing clearCustomLogger function with koffi...')

try {
  const askar = new NodeJSAskar()
  console.log('✅ NodeJSAskar instance created')
  
  console.log('Version:', askar.version())
  
  const currentError = askar.getCurrentError()
  console.log('Current error before test:', currentError)
  
  // 먼저 커스텀 로거를 설정
  const customLogger = (context, level, target, message, modulePath, file, line) => {
    console.log(`[CUSTOM LOG] Level: ${level}, Target: ${target}, Message: ${message}`)
  }
  
  console.log('Setting custom logger first...')
  askar.setCustomLogger({
    logLevel: LogLevel.Info,
    logger: customLogger
  })
  console.log('✅ Custom logger set successfully')
  
  // 로그를 생성할 수 있는 작업 수행해서 커스텀 로거가 동작하는지 확인
  console.log('\nGenerating key to test custom logger...')
  const key = askar.keyGenerate({
    algorithm: 'ed25519',
    ephemeral: false,
    keyBackend: 'software'
  })
  console.log('✅ Key generated (should see custom logs above)')
  
  // 커스텀 로거 해제
  console.log('\nClearing custom logger...')
  askar.clearCustomLogger()
  console.log('✅ Custom logger cleared successfully')
  
  // 로거가 해제되었는지 확인하기 위해 다시 작업 수행
  console.log('\nGenerating another key to verify logger is cleared...')
  const key2 = askar.keyGenerate({
    algorithm: 'ed25519',
    ephemeral: false,
    keyBackend: 'software'
  })
  console.log('✅ Second key generated (should NOT see custom logs)')
  
  // 정리
  askar.keyFree({ localKeyHandle: key })
  askar.keyFree({ localKeyHandle: key2 })
  console.log('✅ Keys freed')
  
  console.log('\n🎉 clearCustomLogger test passed!')
  
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
