const { NodeJSAskar } = require('./build/NodeJSAskar');

async function testWithTimeout() {
  console.log("=== Testing improved timeout handling ===");
  
  try {
    const askar = new NodeJSAskar();
    
    // Test 1: Normal operation
    console.log("\n--- Test 1: Normal provision (should work) ---");
    const seed = new Uint8Array(32).fill(42);
    const rawKey = askar.storeGenerateRawKey({ seed });
    console.log("Raw key:", rawKey);
    
    const storeHandle = await askar.storeProvision({
      specUri: 'sqlite://:memory:',
      keyMethod: 'raw',
      passKey: rawKey,
      recreate: true
    });
    console.log("✅ Store provisioned:", storeHandle);
    
    // Test session
    const sessionHandle = await askar.sessionStart({
      storeHandle,
      profile: null,
      asTransaction: false
    });
    console.log("✅ Session started:", sessionHandle);
    
    await askar.sessionClose({ sessionHandle, commit: true });
    console.log("✅ Session closed");
    
    await askar.storeClose({ storeHandle });
    console.log("✅ Store closed");
    
    console.log("\n🎉 All tests completed successfully!");
    
    // 강제로 프로세스 종료
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

testWithTimeout();
