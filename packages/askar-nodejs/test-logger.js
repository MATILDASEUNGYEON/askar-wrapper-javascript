//test-logger.js
const { NodeJSAskar } = require('./src/NodeJSAskar')
const { LogLevel } = require('@openwallet-foundation/askar-shared')

console.log('Testing Logger with log.rs bindings...')

// 로그 메시지를 수집하기 위한 배열
const collectedLogs = []

// 실제 로그를 트리거하는 함수들
function triggerLogMessages(askar) {
    console.log('\n🔥 Triggering log messages to test logger functionality...')
    
    try {
        // 키 생성으로 로그 메시지 유발
        console.log('   Generating key to trigger logs...')
        const key = askar.keyGenerate({ algorithm: 'ed25519' })
        console.log('   ✅ Key generated successfully')
        
        // 키 정보 조회로 더 많은 로그 유발
        const algorithm = askar.keyGetAlgorithm({ keyHandle: key })
        console.log(`   ✅ Key algorithm: ${algorithm}`)
        
        // 키 해제
        askar.keyFree({ keyHandle: key })
        console.log('   ✅ Key freed successfully')
        
    } catch (error) {
        console.log(`   ⚠️ Error while triggering logs: ${error.message}`)
    }
}

try {
    const askar = new NodeJSAskar()
    console.log('✅ NodeJSAskar instance created')

    console.log('\n--- Testing Default Logger ---')
    try {
        console.log('Step 1: Setting default logger')
        askar.setDefaultLogger()
        console.log('✅ Default logger set successfully')
        
        // Test max log level setting
        console.log('Step 2: Setting max log level to Info')
        askar.setMaxLogLevel({ logLevel: LogLevel.Info })
        console.log('✅ Max log level set to Info')
        
        // 기본 로거로 로그 메시지 트리거
        triggerLogMessages(askar)
        
    } catch (error) {
        console.error('❌ Error occurred while setting default logger:', error.message)
    }

    console.log('\n--- Testing Custom Logger with Log Collection ---')
    
    // 로그를 수집하는 커스텀 로거
    const collectingLogger = (context, level, target, message, modulePath, file, line) => {
        const logLevelNames = ['Off', 'Error', 'Warn', 'Info', 'Debug', 'Trace']
        const levelName = logLevelNames[level] || 'Unknown'
        
        const logEntry = {
            context,
            level,
            levelName,
            target,
            message,
            modulePath,
            file,
            line,
            timestamp: new Date().toISOString()
        }
        
        collectedLogs.push(logEntry)
        
        console.log(`🔍 COLLECTED LOG [${levelName}] ${target}: ${message}`)
        console.log(`   📁 Module: ${modulePath || 'N/A'}`)
        console.log(`   📄 File: ${file || 'N/A'}:${line || 'N/A'}`)
        console.log(`   🎯 Context: ${context}`)
        console.log('   ---')
    }

    try {
        console.log('Step 3: Setting custom logger for log collection')
        
        // Clear any existing custom logger first
        console.log('\n� Clearing any existing custom logger')
        askar.clearCustomLogger()
        console.log('✅ Custom logger cleared')
        
        // Test with Debug level to capture more logs
        console.log('\n🧪 Setting collecting logger with LogLevel.Debug')
        askar.setCustomLogger({
            logLevel: LogLevel.Debug,
            flush: true,
            enabled: true,
            logger: collectingLogger
        })
        console.log('✅ Collecting logger set with Debug level')
        
        // 로그 메시지들을 트리거하여 수집
        triggerLogMessages(askar)
        
        console.log(`\n📊 Collected ${collectedLogs.length} log entries`)
        
    } catch (error) {
        console.error('❌ Error occurred while setting collecting logger:', error.message)
        console.error('Error details:', error)
    }

    console.log('\n--- Testing Logger Clear Functionality ---')
    
    try {
        console.log('\n🧹 Testing clearCustomLogger function')
        
        // Set a simple logger first
        const tempLogger = (context, level, target, message) => {
            console.log(`📝 TEMP LOG: [${level}] ${message}`)
        }
        
        askar.setCustomLogger({
            logLevel: LogLevel.Info,
            flush: false,
            enabled: true,
            logger: tempLogger
        })
        console.log('✅ Temporary logger set')
        
        // Trigger some logs
        triggerLogMessages(askar)
        
        // Clear the logger
        askar.clearCustomLogger()
        console.log('✅ Custom logger cleared successfully')
        
        // Try to trigger logs again (should not appear in custom format)
        console.log('🧪 Triggering logs after clearing custom logger...')
        triggerLogMessages(askar)
        
    } catch (error) {
        console.error('❌ Error occurred while testing clear functionality:', error.message)
    }

    console.log('\n--- Testing Enabled Callback Functionality ---')
    
    const logCounts = { error: 0, warn: 0, info: 0, debug: 0, trace: 0 }
    
    // Enabled callback that only allows certain log levels
    const selectiveEnabledCallback = (context, level) => {
        // Only allow Error (1) and Info (3) levels
        return level === 1 || level === 3 ? 1 : 0
    }
    
    const countingLogger = (context, level, target, message, modulePath, file, line) => {
        const levelNames = ['off', 'error', 'warn', 'info', 'debug', 'trace']
        const levelName = levelNames[level] || 'unknown'
        
        if (logCounts[levelName] !== undefined) {
            logCounts[levelName]++
        }
        
        console.log(`📊 COUNTING LOG [${levelName.toUpperCase()}]: ${message}`)
    }
    
    try {
        console.log('\n🎯 Testing selective enabled callback (only Error and Info)')
        
        // Clear previous logger
        askar.clearCustomLogger()
        
        // Note: enabled callback is commented out in current implementation
        // but we test the structure anyway
        askar.setCustomLogger({
            logLevel: LogLevel.Trace, // Set high level but enabled callback will filter
            flush: false,
            enabled: true, // This maps to enabled parameter in bindings
            logger: countingLogger
        })
        console.log('✅ Counting logger with selective filtering set')
        
        // Trigger various log levels
        triggerLogMessages(askar)
        
        console.log('\n📈 Log Level Counts:')
        Object.entries(logCounts).forEach(([level, count]) => {
            console.log(`   ${level.toUpperCase()}: ${count}`)
        })
        
    } catch (error) {
        console.error('❌ Error occurred while testing enabled callback:', error.message)
    }

    console.log('\n--- Testing Flush Functionality ---')
    
    let flushCount = 0
    const flushTestLogger = (context, level, target, message, modulePath, file, line) => {
        console.log(`🚿 FLUSH LOG [${level}]: ${message}`)
    }
    
    try {
        console.log('\n💧 Testing flush functionality')
        
        askar.clearCustomLogger()
        
        askar.setCustomLogger({
            logLevel: LogLevel.Debug,
            flush: true, // Enable flush
            enabled: true,
            logger: flushTestLogger
        })
        console.log('✅ Flush-enabled logger set')
        
        // Trigger some logs
        triggerLogMessages(askar)
        
        console.log('✅ Flush test completed')
        
    } catch (error) {
        console.error('❌ Error occurred while testing flush:', error.message)
    }

    console.log('\n--- Testing Logger State Management ---')
    
    try {
        console.log('\n🔄 Testing multiple logger switches')
        
        const logger1 = (context, level, target, message) => {
            console.log(`🟦 LOGGER_1 [${level}]: ${message}`)
        }
        
        const logger2 = (context, level, target, message) => {
            console.log(`🟨 LOGGER_2 [${level}]: ${message}`)
        }
        
        // Set first logger
        askar.setCustomLogger({
            logLevel: LogLevel.Info,
            flush: false,
            enabled: true,
            logger: logger1
        })
        console.log('✅ Logger 1 set')
        
        triggerLogMessages(askar)
        
        // Switch to second logger (should replace first)
        askar.setCustomLogger({
            logLevel: LogLevel.Debug,
            flush: true,
            enabled: true,
            logger: logger2
        })
        console.log('✅ Logger 2 set (replacing Logger 1)')
        
        triggerLogMessages(askar)
        
        // Clear all loggers
        askar.clearCustomLogger()
        console.log('✅ All custom loggers cleared')
        
    } catch (error) {
        console.error('❌ Error occurred while testing logger state management:', error.message)
    }
    console.log('\n--- Testing Logger with different flush/enabled combinations ---')
    
    const simpleLogger = (context, level, target, message, modulePath, file, line) => {
        console.log(`📝 Simple Log: [${level}] ${message}`)
    }
    
    const testConfigs = [
        { flush: false, enabled: false, description: 'flush: false, enabled: false' },
        { flush: true, enabled: false, description: 'flush: true, enabled: false' },
        { flush: false, enabled: true, description: 'flush: false, enabled: true' },
        { flush: true, enabled: true, description: 'flush: true, enabled: true' }
    ]
    
    for (const config of testConfigs) {
        try {
            console.log(`\n🔧 Testing configuration: ${config.description}`)
            
            askar.clearCustomLogger()
            
            askar.setCustomLogger({
                logLevel: LogLevel.Info,
                flush: config.flush,
                enabled: config.enabled,
                logger: simpleLogger
            })
            console.log(`✅ Custom logger set successfully with ${config.description}`)
            
            // Trigger a small test
            triggerLogMessages(askar)
            
        } catch (error) {
            console.error(`❌ Error with configuration ${config.description}:`, error.message)
        }
    }

    console.log('\n--- Testing Log Level Bounds ---')
    
    const logLevels = [
        { level: LogLevel.RUST_LOG, name: 'RUST_LOG (-1)' },
        { level: LogLevel.Off, name: 'Off (0)' },
        { level: LogLevel.Error, name: 'Error (1)' },
        { level: LogLevel.Warn, name: 'Warn (2)' },
        { level: LogLevel.Info, name: 'Info (3)' },
        { level: LogLevel.Debug, name: 'Debug (4)' },
        { level: LogLevel.Trace, name: 'Trace (5)' }
    ]
    
    for (const { level, name } of logLevels) {
        try {
            console.log(`\n📊 Testing log level: ${name}`)
            
            askar.clearCustomLogger()
            
            askar.setCustomLogger({
                logLevel: level,
                flush: false,
                enabled: true,
                logger: (context, lvl, target, message, modulePath, file, line) => {
                    console.log(`   📈 Log received at level ${lvl}: ${message}`)
                }
            })
            console.log(`✅ Successfully set custom logger with ${name}`)
            
            // Quick test
            triggerLogMessages(askar)
            
        } catch (error) {
            console.error(`❌ Failed to set logger with ${name}:`, error.message)
        }
    }

    console.log('\n--- Testing Max Log Level Changes ---')
    
    const levelTestLogger = (context, level, target, message) => {
        console.log(`📏 LEVEL TEST [${level}]: ${message}`)
    }
    
    try {
        console.log('\n📊 Testing dynamic max log level changes')
        
        askar.clearCustomLogger()
        
        // Set logger with Trace level initially
        askar.setCustomLogger({
            logLevel: LogLevel.Trace,
            flush: false,
            enabled: true,
            logger: levelTestLogger
        })
        console.log('✅ Logger set with Trace level')
        
        triggerLogMessages(askar)
        
        // Change max level to Error only
        console.log('\n🔽 Changing max log level to Error')
        askar.setMaxLogLevel({ logLevel: LogLevel.Error })
        console.log('✅ Max log level changed to Error')
        
        triggerLogMessages(askar)
        
        // Change max level back to Debug
        console.log('\n🔼 Changing max log level to Debug')
        askar.setMaxLogLevel({ logLevel: LogLevel.Debug })
        console.log('✅ Max log level changed to Debug')
        
        triggerLogMessages(askar)
        
    } catch (error) {
        console.error('❌ Error occurred while testing max log level changes:', error.message)
    }

    console.log('\n--- Testing Error Cases ---')
    
    try {
        console.log('\n🚨 Testing with null logger (should fail)')
        askar.setCustomLogger({
            logLevel: LogLevel.Info,
            flush: false,
            enabled: true,
            logger: null
        })
        console.log('❌ Unexpectedly succeeded with null logger')
    } catch (error) {
        console.log('✅ Correctly failed with null logger:', error.message)
    }
    
    try {
        console.log('\n🚨 Testing with invalid log level (should handle gracefully)')
        askar.setCustomLogger({
            logLevel: 999, // Invalid log level
            flush: false,
            enabled: true,
            logger: (context, level, target, message) => {
                console.log(`Invalid level test: ${message}`)
            }
        })
        console.log('⚠️ Unexpectedly succeeded with invalid log level')
    } catch (error) {
        console.log('✅ Correctly handled invalid log level:', error.message)
    }
    
    try {
        console.log('\n🚨 Testing with undefined logger (should fail)')
        askar.setCustomLogger({
            logLevel: LogLevel.Info,
            flush: false,
            enabled: true,
            logger: undefined
        })
        console.log('❌ Unexpectedly succeeded with undefined logger')
    } catch (error) {
        console.log('✅ Correctly failed with undefined logger:', error.message)
    }

    console.log('\n--- Final Cleanup and Summary ---')
    
    try {
        console.log('\n🧹 Final cleanup')
        askar.clearCustomLogger()
        console.log('✅ All custom loggers cleared')
        
        // Final summary
        console.log(`\n📋 Test Summary:`)
        console.log(`   🔢 Total logs collected: ${collectedLogs.length}`)
        console.log(`   📊 Log level distribution:`)
        
        const levelDistribution = {}
        collectedLogs.forEach(log => {
            levelDistribution[log.levelName] = (levelDistribution[log.levelName] || 0) + 1
        })
        
        Object.entries(levelDistribution).forEach(([level, count]) => {
            console.log(`      ${level}: ${count}`)
        })
        
        if (collectedLogs.length > 0) {
            console.log(`   📝 Sample log entry:`)
            const sample = collectedLogs[0]
            console.log(`      Level: ${sample.levelName} (${sample.level})`)
            console.log(`      Target: ${sample.target}`)
            console.log(`      Message: ${sample.message}`)
            console.log(`      File: ${sample.file}:${sample.line}`)
        }
        
    } catch (error) {
        console.error('❌ Error during final cleanup:', error.message)
    }

} catch (error) {
    console.error('❌ Fatal error occurred:', error.message)
    console.error('Error stack:', error.stack)
    
    try {
        const askar = new NodeJSAskar()
        const currentError = askar.getCurrentError()
        console.log('🔍 Current error from native:', currentError)
    } catch (e) {
        console.error('Could not get current error:', e.message)
    }
}

console.log('\n🎉 Logger testing completed!')