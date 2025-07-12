#!/usr/bin/env node

// Simple test script to verify Netlify functions work locally
const { handler: healthHandler } = require('../netlify/functions/health');
const { handler: adminLoginHandler } = require('../netlify/functions/admin-login');
const { handler: timeLogsHandler } = require('../netlify/functions/time-logs');

async function testHealthFunction() {
  console.log('🔍 Testing Health Function...');
  
  const event = {
    httpMethod: 'GET',
    path: '/api/health',
    headers: {},
    body: null
  };

  try {
    const result = await healthHandler(event, {});
    const response = JSON.parse(result.body);
    
    if (result.statusCode === 200 && response.success) {
      console.log('✅ Health function working');
      console.log('   Database:', response.database);
    } else {
      console.log('❌ Health function failed');
    }
  } catch (error) {
    console.log('❌ Health function error:', error.message);
  }
}

async function testAdminLogin() {
  console.log('\n🔍 Testing Admin Login Function...');
  
  const event = {
    httpMethod: 'POST',
    path: '/api/admin-login',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  };

  try {
    const result = await adminLoginHandler(event, {});
    const response = JSON.parse(result.body);
    
    if (result.statusCode === 200 && response.success) {
      console.log('✅ Admin login working');
      console.log('   Admin:', response.admin.firstName, response.admin.lastName);
    } else {
      console.log('❌ Admin login failed');
    }
  } catch (error) {
    console.log('❌ Admin login error:', error.message);
  }
}

async function testTimeLogsPost() {
  console.log('\n🔍 Testing Time Logs POST Function...');
  
  const event = {
    httpMethod: 'POST',
    path: '/api/time-logs',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      firstName: 'Test',
      lastName: 'User',
      employeeId: 'TEST001',
      action: 'IN',
      timestamp: new Date().toISOString()
    })
  };

  try {
    const result = await timeLogsHandler(event, {});
    const response = JSON.parse(result.body);
    
    if (result.statusCode === 201 && response.success) {
      console.log('✅ Time logs POST working');
      console.log('   Message:', response.message);
    } else {
      console.log('❌ Time logs POST failed');
    }
  } catch (error) {
    console.log('❌ Time logs POST error:', error.message);
  }
}

async function testTimeLogsGet() {
  console.log('\n🔍 Testing Time Logs GET Function...');
  
  const event = {
    httpMethod: 'GET',
    path: '/api/time-logs',
    headers: {},
    body: null
  };

  try {
    const result = await timeLogsHandler(event, {});
    const response = JSON.parse(result.body);
    
    if (result.statusCode === 200 && response.success) {
      console.log('✅ Time logs GET working');
      console.log('   Records found:', response.data.length);
    } else {
      console.log('❌ Time logs GET failed');
    }
  } catch (error) {
    console.log('❌ Time logs GET error:', error.message);
  }
}

async function runTests() {
  console.log('🧪 Testing Netlify Functions Locally\n');
  
  await testHealthFunction();
  await testAdminLogin();
  await testTimeLogsPost();
  await testTimeLogsGet();
  
  console.log('\n🎉 Test complete! All functions should be working.');
  console.log('\n📝 Next steps:');
  console.log('   1. Deploy to Netlify');
  console.log('   2. Test the live application');
  console.log('   3. Use admin credentials: admin/admin123');
}

runTests().catch(console.error);