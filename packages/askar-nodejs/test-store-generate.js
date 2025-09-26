const { NodeJSAskar } = require('./build/NodeJSAskar')

const askar = new NodeJSAskar()

console.log('Testing storeGenerateRawKey...')

try {
  // Test with null/undefined seed
  const result1 = askar.storeGenerateRawKey({})
  console.log('Result with empty options:', result1)
} catch (error) {
  console.error('Error with empty options:', error.message)
}

try {
  // Test with empty seed
  const result2 = askar.storeGenerateRawKey({ seed: null })
  console.log('Result with null seed:', result2)
} catch (error) {
  console.error('Error with null seed:', error.message)
}

try {
  // Test with specific seed
  const result3 = askar.storeGenerateRawKey({ seed: Buffer.from('test seed data') })
  console.log('Result with test seed:', result3)
} catch (error) {
  console.error('Error with test seed:', error.message)
}
