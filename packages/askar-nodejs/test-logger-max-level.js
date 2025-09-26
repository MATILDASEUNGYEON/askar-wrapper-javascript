// test-logger-max-level.js
const { NodeJSAskar } = require('./src/NodeJSAskar')
const { LogLevel } = require('@openwallet-foundation/askar-shared')

console.log('Testing setMaxLogLevel function with koffi...')

try {
  const askar = new NodeJSAskar()
  console.log('✅ NodeJSAskar instance created')
  
  console.log('Version:', askar.version())
  
  const currentError = askar.getCurrentError()
  console.log('Current error before test:', currentError)
  
  // 커스텀 로거 설정 (로그 레벨 필터링을 확인하기 위해)
  const logMessages = []
  const customLogger = (context, level, target, message, modulePath, file, line) => {
    const logEntry = {
      level,
      target,
      message,
      modulePath,
      file,
      line
    }
    logMessages.push(logEntry)
    console.log(`[CUSTOM LOG] Level: ${level}, Target: ${target}, Message: ${message}`)
  }
  
  console.log('Setting custom logger for level testing...')
  askar.setCustomLogger({
    logLevel: LogLevel.Trace, // 최대한 많은 로그를 받도록 설정
    logger: customLogger
  })
  console.log('✅ Custom logger set successfully')
  
  // 다양한 로그 레벨로 테스트
  const logLevels = [
    { name: 'Error', level: LogLevel.Error },
    { name: 'Warn', level: LogLevel.Warn },
    { name: 'Info', level: LogLevel.Info },
    { name: 'Debug', level: LogLevel.Debug },
    { name: 'Trace', level: LogLevel.Trace }
  ]
  
  for (const { name, level } of logLevels) {
    console.log(`\n--- Testing with ${name} level (${level}) ---`)
    logMessages.length = 0 // 로그 메시지 배열 초기화
    
    // 로그 레벨 설정
    askar.setMaxLogLevel({ logLevel: level })
    console.log(`✅ Max log level set to ${name}`)
    
    // 로그를 생성할 수 있는 작업 수행
    const key = askar.keyGenerate({
      algorithm: 'ed25519',
      ephemeral: false,
      keyBackend: 'software'
    })
    
    // 키 알고리즘 조회
    const algorithm = askar.keyGetAlgorithm({ localKeyHandle: key })
    
    // 키 해제
    askar.keyFree({ localKeyHandle: key })
    
    console.log(`Captured ${logMessages.length} log messages at ${name} level`)
    
    // 로그 레벨별로 예상되는 동작 확인
    if (logMessages.length > 0) {
      const maxLogLevel = Math.max(...logMessages.map(log => log.level))
      const minLogLevel = Math.min(...logMessages.map(log => log.level))
      console.log(`Log levels captured: ${minLogLevel} to ${maxLogLevel}`)
    }
  }
  
  // 로거 해제
  console.log('\nClearing custom logger...')
  askar.clearCustomLogger()
  console.log('✅ Custom logger cleared')
  
  console.log('\n🎉 setMaxLogLevel test completed!')
  console.log('Note: Log level filtering behavior may depend on the native library implementation')
  
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
