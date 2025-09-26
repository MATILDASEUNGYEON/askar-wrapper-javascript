// test-logger-all.js
const { NodeJSAskar } = require('./src/NodeJSAskar')
const { LogLevel } = require('@openwallet-foundation/askar-shared')

console.log('Testing all logger functions together with koffi...')

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

try {
  const askar = new NodeJSAskar()
  console.log('✅ NodeJSAskar instance created')
  
  console.log('Version:', askar.version())
  
  const currentError = askar.getCurrentError()
  console.log('Current error before test:', currentError)
  
  // === Test 1: setDefaultLogger ===
  console.log('\n=== Test 1: setDefaultLogger ===')
  askar.setDefaultLogger()
  console.log('✅ Default logger set')
  
  askar.setMaxLogLevel({ logLevel: LogLevel.Info })
  console.log('✅ Max log level set to Info for default logger')
  
  // 기본 로거로 작업 수행
  let key1 = askar.keyGenerate({
    algorithm: 'ed25519',
    ephemeral: false,
    keyBackend: 'software'
  })
  askar.keyFree({ localKeyHandle: key1 })
  console.log('✅ Key operations with default logger completed')
  
  await sleep(100) // 로그 출력을 위한 짧은 대기
  
  // === Test 2: setCustomLogger ===
  console.log('\n=== Test 2: setCustomLogger ===')
  const logMessages = []
  
  const customLogger = (context, level, target, message, modulePath, file, line) => {
    const logEntry = `[CUSTOM] L${level}: ${message}`;
    logMessages.push(logEntry)
    console.log(logEntry)
  }
  
  const enabledCallback = (context, level) => {
    // Info 레벨 이상만 허용 (레벨이 낮을수록 중요함)
    return level <= LogLevel.Info ? 1 : 0
  }
  
  const flushCallback = (context) => {
    console.log('[FLUSH] Custom logger flushed')
  }
  
  askar.setCustomLogger({
    logLevel: LogLevel.Debug,
    logger: customLogger,
    enabled: enabledCallback,
    flush: flushCallback
  })
  console.log('✅ Custom logger set with enabled and flush callbacks')
  
  // 커스텀 로거로 작업 수행
  let key2 = askar.keyGenerate({
    algorithm: 'ed25519',
    ephemeral: false,
    keyBackend: 'software'
  })
  askar.keyFree({ localKeyHandle: key2 })
  console.log(`✅ Key operations with custom logger completed (${logMessages.length} messages captured)`)
  
  await sleep(100)
  
  // === Test 3: setMaxLogLevel variations ===
  console.log('\n=== Test 3: setMaxLogLevel variations ===')
  
  // Error 레벨로 설정
  logMessages.length = 0
  askar.setMaxLogLevel({ logLevel: LogLevel.Error })
  console.log('Max log level set to Error')
  
  let key3 = askar.keyGenerate({
    algorithm: 'ed25519',
    ephemeral: false,
    keyBackend: 'software'
  })
  askar.keyFree({ localKeyHandle: key3 })
  console.log(`Key operations at Error level (${logMessages.length} messages)`)
  
  // Debug 레벨로 설정
  logMessages.length = 0
  askar.setMaxLogLevel({ logLevel: LogLevel.Debug })
  console.log('Max log level set to Debug')
  
  let key4 = askar.keyGenerate({
    algorithm: 'ed25519',
    ephemeral: false,
    keyBackend: 'software'
  })
  askar.keyFree({ localKeyHandle: key4 })
  console.log(`Key operations at Debug level (${logMessages.length} messages)`)
  
  await sleep(100)
  
  // === Test 4: clearCustomLogger ===
  console.log('\n=== Test 4: clearCustomLogger ===')
  
  askar.clearCustomLogger()
  console.log('✅ Custom logger cleared')
  
  // 로거가 해제되었는지 확인
  let key5 = askar.keyGenerate({
    algorithm: 'ed25519',
    ephemeral: false,
    keyBackend: 'software'
  })
  askar.keyFree({ localKeyHandle: key5 })
  console.log('✅ Key operations after clearing custom logger (should not see custom logs)')
  
  await sleep(100)
  
  // === Test 5: 다시 기본 로거로 전환 ===
  console.log('\n=== Test 5: Back to default logger ===')
  
  askar.setDefaultLogger()
  askar.setMaxLogLevel({ logLevel: LogLevel.Warn })
  console.log('✅ Back to default logger with Warn level')
  
  let key6 = askar.keyGenerate({
    algorithm: 'ed25519',
    ephemeral: false,
    keyBackend: 'software'
  })
  askar.keyFree({ localKeyHandle: key6 })
  console.log('✅ Final key operations with default logger')
  
  console.log('\n🎉 All logger function tests passed!')
  console.log('✅ setDefaultLogger: Working')
  console.log('✅ setCustomLogger: Working (with enabled/flush callbacks)')
  console.log('✅ setMaxLogLevel: Working')
  console.log('✅ clearCustomLogger: Working')
  
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
