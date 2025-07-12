/**
 * MongoDB Connection Test and Configuration Validator
 * This script tests the MongoDB Atlas connection and validates the setup
 */

const mongoose = require('mongoose');
require('dotenv').config();

// ANSI colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function validateConfiguration() {
  log('\n🔧 MongoDB Configuration Validator', colors.bold + colors.blue);
  log('=' .repeat(50), colors.blue);

  // Check environment variables
  log('\n📋 Checking Environment Variables:', colors.yellow);
  
  const requiredVars = ['MONGODB_URI', 'PORT', 'JWT_SECRET'];
  let configValid = true;

  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value) {
      if (varName === 'MONGODB_URI') {
        const maskedUri = value.replace(/:[^:@]*@/, ':***@');
        log(`  ✅ ${varName}: ${maskedUri}`, colors.green);
      } else {
        log(`  ✅ ${varName}: ${value}`, colors.green);
      }
    } else {
      log(`  ❌ ${varName}: Missing!`, colors.red);
      configValid = false;
    }
  }

  if (!configValid) {
    log('\n❌ Configuration validation failed!', colors.red);
    return false;
  }

  log('\n✅ Configuration validation passed!', colors.green);
  return true;
}

async function testDatabaseConnection() {
  log('\n🔌 Testing MongoDB Atlas Connection:', colors.yellow);
  
  try {
    // Connection options optimized for Atlas
    const options = {
      serverSelectionTimeoutMS: 15000, // Increase timeout for testing
      connectTimeoutMS: 15000,
      maxPoolSize: 5,
      minPoolSize: 1,
      maxIdleTimeMS: 30000,
      bufferCommands: false,
    };

    log('  📡 Attempting to connect...', colors.blue);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    
    log(`  ✅ Connected to: ${conn.connection.host}`, colors.green);
    log(`  🗄️  Database: ${conn.connection.name}`, colors.green);
    log(`  🔗 Connection state: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`, colors.green);
    
    // Test database operations
    log('\n🔄 Testing Database Operations:', colors.yellow);
    
    // Ping test
    await mongoose.connection.db.admin().ping();
    log('  ✅ Ping successful', colors.green);
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    log(`  ✅ Collections found: ${collections.length}`, colors.green);
    if (collections.length > 0) {
      collections.forEach(col => log(`    - ${col.name}`, colors.blue));
    }
    
    // Test collection creation (this will create the collection if it doesn't exist)
    const testCollection = mongoose.connection.db.collection('connection_test');
    await testCollection.insertOne({ 
      test: true, 
      timestamp: new Date(),
      message: 'Connection test successful' 
    });
    log('  ✅ Write operation successful', colors.green);
    
    // Clean up test document
    await testCollection.deleteOne({ test: true });
    log('  ✅ Delete operation successful', colors.green);
    
    await mongoose.disconnect();
    log('\n🎉 MongoDB Atlas connection test completed successfully!', colors.bold + colors.green);
    return true;
    
  } catch (error) {
    log('\n❌ MongoDB connection test failed:', colors.red);
    log(`   Error: ${error.message}`, colors.red);
    
    // Provide specific guidance based on error type
    if (error.message.includes('ETIMEOUT') || error.message.includes('querySrv')) {
      log('\n🌐 Network connectivity issue detected:', colors.yellow);
      log('   Possible causes:', colors.yellow);
      log('   1. Internet connection problems', colors.yellow);
      log('   2. DNS resolution issues', colors.yellow);
      log('   3. Firewall blocking MongoDB ports (27017)', colors.yellow);
      log('   4. Corporate network restrictions', colors.yellow);
      log('   5. IP address not whitelisted in MongoDB Atlas', colors.yellow);
    } else if (error.message.includes('Authentication failed')) {
      log('\n🔐 Authentication issue detected:', colors.yellow);
      log('   Please verify:', colors.yellow);
      log('   1. Username and password are correct', colors.yellow);
      log('   2. User has proper database permissions', colors.yellow);
      log('   3. No special characters in password that need URL encoding', colors.yellow);
    } else if (error.message.includes('ECONNREFUSED')) {
      log('\n🚫 Connection refused:', colors.yellow);
      log('   The MongoDB server is not accessible', colors.yellow);
    }
    
    await mongoose.disconnect().catch(() => {});
    return false;
  }
}

async function generateTestConfiguration() {
  log('\n📝 Generating Local Test Configuration:', colors.yellow);
  
  const localConfig = `# Alternative local MongoDB configuration for testing
# Use this if MongoDB Atlas is not accessible
PORT=5000
MONGODB_URI=mongodb://localhost:27017/intern-time-tracker
JWT_SECRET=development-jwt-secret-change-in-production
NODE_ENV=development

# MongoDB Atlas configuration (current)
# PORT=5000
# MONGODB_URI=mongodb+srv://joshuamthomson1985:Bulldog2025@thomsoninnovations.pr5idap.mongodb.net/intern-time-tracker?retryWrites=true&w=majority&appName=ThomsonInnovations
# JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
# NODE_ENV=development`;

  require('fs').writeFileSync('.env.local.example', localConfig);
  log('  ✅ Created .env.local.example with local MongoDB config', colors.green);
  log('  💡 To use local MongoDB, copy .env.local.example to .env', colors.blue);
}

async function validateModels() {
  log('\n🗃️  Validating Database Models:', colors.yellow);
  
  try {
    const TimeLog = require('./models/TimeLog');
    const AbsenceLog = require('./models/AbsenceLog');
    const AdminCredential = require('./models/AdminCredential');
    
    log('  ✅ TimeLog model loaded', colors.green);
    log('  ✅ AbsenceLog model loaded', colors.green);
    log('  ✅ AdminCredential model loaded', colors.green);
    
    // Check schema structure
    log('\n  📊 Model Schema Summary:', colors.blue);
    log(`    TimeLog fields: ${Object.keys(TimeLog.schema.paths).join(', ')}`, colors.blue);
    log(`    AbsenceLog fields: ${Object.keys(AbsenceLog.schema.paths).join(', ')}`, colors.blue);
    log(`    AdminCredential fields: ${Object.keys(AdminCredential.schema.paths).join(', ')}`, colors.blue);
    
    return true;
  } catch (error) {
    log(`  ❌ Model validation failed: ${error.message}`, colors.red);
    return false;
  }
}

async function runFullDiagnostic() {
  log('\n🏥 MongoDB Atlas Configuration Diagnostic', colors.bold + colors.blue);
  log('=' .repeat(60), colors.blue);
  
  const results = {
    config: false,
    models: false,
    connection: false
  };
  
  // Step 1: Validate configuration
  results.config = await validateConfiguration();
  
  // Step 2: Validate models
  results.models = await validateModels();
  
  // Step 3: Test connection (only if config is valid)
  if (results.config) {
    results.connection = await testDatabaseConnection();
  } else {
    log('\n⏭️  Skipping connection test due to configuration issues', colors.yellow);
  }
  
  // Step 4: Generate test configuration
  await generateTestConfiguration();
  
  // Summary
  log('\n📊 Diagnostic Summary:', colors.bold + colors.blue);
  log('=' .repeat(30), colors.blue);
  log(`Configuration: ${results.config ? '✅ PASS' : '❌ FAIL'}`, results.config ? colors.green : colors.red);
  log(`Models: ${results.models ? '✅ PASS' : '❌ FAIL'}`, results.models ? colors.green : colors.red);
  log(`Connection: ${results.connection ? '✅ PASS' : '❌ FAIL'}`, results.connection ? colors.green : colors.red);
  
  const allPassed = results.config && results.models && results.connection;
  
  if (allPassed) {
    log('\n🎉 All tests passed! The application is ready to use.', colors.bold + colors.green);
  } else {
    log('\n⚠️  Some tests failed. Check the details above.', colors.bold + colors.yellow);
    if (!results.connection && results.config && results.models) {
      log('\n💡 The configuration is correct but the database is not accessible.', colors.blue);
      log('   This could be due to network restrictions or MongoDB Atlas settings.', colors.blue);
      log('   The application will work once the network connectivity is resolved.', colors.blue);
    }
  }
  
  log('\nDiagnostic complete!', colors.blue);
}

// Run the diagnostic if this script is executed directly
if (require.main === module) {
  runFullDiagnostic().catch(console.error);
}

module.exports = {
  validateConfiguration,
  testDatabaseConnection,
  validateModels,
  runFullDiagnostic
};