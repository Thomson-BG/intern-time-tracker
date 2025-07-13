/**
 * Test suite to verify frontend-backend connectivity
 * This tests the MongoDB/File-based API instead of Google Sheets
 */

const API_BASE_URL = 'http://localhost:5001/api';

async function testHealthCheck() {
    console.log('🏥 Testing health check...');
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const data = await response.json();
        
        if (data.success && data.message === 'Server is running') {
            console.log('✅ Health check passed');
            console.log(`   Database: ${data.database}`);
            console.log(`   Environment: ${data.environment}`);
            console.log(`   Database Type: ${data.databaseType}`);
            return true;
        } else {
            console.log('❌ Health check failed:', data);
            return false;
        }
    } catch (error) {
        console.log('❌ Health check failed with error:', error.message);
        return false;
    }
}

async function testAdminLogin() {
    console.log('🔐 Testing admin login...');
    try {
        const response = await fetch(`${API_BASE_URL}/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'admin',
                password: 'admin123'
            })
        });
        
        const data = await response.json();
        
        if (data.success && data.data.username === 'admin') {
            console.log('✅ Admin login passed');
            console.log(`   Admin: ${data.data.firstName} ${data.data.lastName}`);
            console.log(`   Role: ${data.data.role}`);
            return true;
        } else {
            console.log('❌ Admin login failed:', data);
            return false;
        }
    } catch (error) {
        console.log('❌ Admin login failed with error:', error.message);
        return false;
    }
}

async function testTimeLogsAPI() {
    console.log('⏰ Testing time logs API...');
    try {
        const response = await fetch(`${API_BASE_URL}/time-logs`);
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
            console.log('✅ Time logs API passed');
            console.log(`   Found ${data.count} time log entries`);
            return true;
        } else {
            console.log('❌ Time logs API failed:', data);
            return false;
        }
    } catch (error) {
        console.log('❌ Time logs API failed with error:', error.message);
        return false;
    }
}

async function testAbsenceLogsAPI() {
    console.log('📋 Testing absence logs API...');
    try {
        const response = await fetch(`${API_BASE_URL}/absence-logs`);
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
            console.log('✅ Absence logs API passed');
            console.log(`   Found ${data.count} absence log entries`);
            return true;
        } else {
            console.log('❌ Absence logs API failed:', data);
            return false;
        }
    } catch (error) {
        console.log('❌ Absence logs API failed with error:', error.message);
        return false;
    }
}

async function runAllTests() {
    console.log('🚀 Starting Frontend-Backend Connection Tests\n');
    
    const tests = [
        testHealthCheck,
        testAdminLogin, 
        testTimeLogsAPI,
        testAbsenceLogsAPI
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
        const result = await test();
        if (result) {
            passed++;
        } else {
            failed++;
        }
        console.log(''); // Add spacing between tests
    }
    
    console.log('📊 Test Results:');
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
    
    if (failed === 0) {
        console.log('\n🎉 All tests passed! The application should work correctly.');
        process.exit(0);
    } else {
        console.log('\n⚠️  Some tests failed. Check the backend configuration.');
        process.exit(1);
    }
}

// Run tests if this script is executed directly
if (typeof window === 'undefined') {
    runAllTests();
}