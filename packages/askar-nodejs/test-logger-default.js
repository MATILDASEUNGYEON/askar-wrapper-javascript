// test-logger-default.js
const { NodeJSAskar } = require('./src/NodeJSAskar')
const { LogLevel } = require('@openwallet-foundation/askar-shared')

console.log('Testing setDefaultLogger function with koffi...')

try {
  const askar = new NodeJSAskar()
  console.log('✅ NodeJSAskar instance created')
  
  console.log('Version:', askar.version())
  
  const currentError = askar.getCurrentError()
  console.log('Current error before test:', currentError)
  
  // 기본 로거 설정
  console.log('Setting default logger...')
  askar.setDefaultLogger()
  console.log('✅ Default logger set successfully')
  
  // 로그 레벨을 Info로 설정
  console.log('Setting max log level to Info...')
  askar.setMaxLogLevel({ logLevel: LogLevel.Info })
  console.log('✅ Max log level set to Info')
  
  // 로그를 생성할 수 있는 작업 수행
  console.log('\nGenerating key to trigger default logging...')
  const key = askar.keyGenerate({
    algorithm: 'ed25519',
    ephemeral: false,
    keyBackend: 'software'
  })
  console.log('✅ Key generated successfully')
  console.log('Key handle:', key.handle)
  
  // 키 알고리즘 조회 (추가 로그 생성)
  const algorithm = askar.keyGetAlgorithm({ localKeyHandle: key })
  console.log('✅ Key algorithm:', algorithm)
  
  // 키 해제
  askar.keyFree({ localKeyHandle: key })
  console.log('✅ Key freed successfully')
  
  console.log('\n🎉 setDefaultLogger test passed!')
  console.log('Note: Default logs may appear in stderr or may be filtered by environment settings')
  
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
