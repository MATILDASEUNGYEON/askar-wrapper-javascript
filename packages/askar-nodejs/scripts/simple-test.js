// Simple test for getCurrentError function
// This bypasses complex builds and tests only the essential functionality

const path = require('path')

// Register ts-node to handle TypeScript imports
require('ts-node').register({
  project: path.join(__dirname, '..', 'tsconfig.json'),
  transpileOnly: true,  // Skip type checking for faster startup
  compilerOptions: {
    module: 'commonjs'
  }
})

async function testGetCurrentError() {
  console.log('🧪 Testing getCurrentError function...\n')

  try {
    console.log('1️⃣ Importing NodeJSAskar...')
    const { NodeJSAskar } = require('../src/NodeJSAskar')
    
    console.log('2️⃣ Creating instance...')
    const askar = new NodeJSAskar()
    
    console.log('3️⃣ Testing version function...')
    const version = askar.version()
    console.log(`   ✅ Version: ${version}`)
    
    console.log('4️⃣ Testing getCurrentError...')
    const error = askar.getCurrentError()
    console.log('   Result:', JSON.stringify(error, null, 2))
    
    // Validate structure
    if (typeof error === 'object' && 
        typeof error.code === 'number' &&
        (error.message === null || typeof error.message === 'string')) {
      console.log('   ✅ Valid error structure')
      
      if (error.code === 0) {
        console.log('   ✅ No error state (expected)')
      } else {
        console.log(`   ⚠️  Error state: code=${error.code}, message="${error.message}"`)
      }
      
      console.log('\n🎉 getCurrentError test passed!')
    } else {
      console.log('   ❌ Invalid error structure')
      process.exit(1)
    }
    
  } catch (error) {
    console.error('❌ Test failed:')
    console.error('   Error:', error.message)
    if (error.stack) {
      console.error('   Stack:', error.stack.split('\n').slice(0, 5).join('\n'))
    }
    process.exit(1)
  }
}

// Run the test
testGetCurrentError().catch(console.error)
