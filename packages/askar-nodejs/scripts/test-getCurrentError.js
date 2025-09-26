#!/usr/bin/env node

/**
 * Simple test runner for getCurrentError function
 * 
 * This script provides a minimal test for the Koffi conversion
 * without requiring a full test framework.
 */

// Use ts-node to run TypeScript directly
require('ts-node').register({
  project: '../tsconfig.json'
})

const { NodeJSAskar } = require('../src/NodeJSAskar')

async function simpleTest() {
  console.log('🧪 Simple getCurrentError Test\n')

  try {
    console.log('Creating NodeJSAskar instance...')
    const askar = new NodeJSAskar()
    
    console.log('Getting version...')
    const version = askar.version()
    console.log(`Askar version: ${version}`)
    
    console.log('Testing getCurrentError...')
    const error = askar.getCurrentError()
    console.log('Current error:', JSON.stringify(error, null, 2))
    
    // Validate the structure
    if (typeof error === 'object' && 
        typeof error.code === 'number' &&
        (error.message === null || typeof error.message === 'string')) {
      console.log('✅ getCurrentError returned valid structure')
      
      if (error.code === 0) {
        console.log('✅ No error state (as expected)')
      } else {
        console.log(`⚠️  Error state detected: code=${error.code}, message="${error.message}"`)
      }
    } else {
      console.log('❌ Invalid error structure returned')
      process.exit(1)
    }
    
    console.log('\n🎉 Simple test completed successfully!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    if (error.stack) {
      console.error('Stack trace:', error.stack)
    }
    process.exit(1)
  }
}

// Run the test
simpleTest().catch(console.error)
