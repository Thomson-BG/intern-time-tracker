import { timeLogsApi } from '../utils/googleSheetsApi';

// Simple test to verify CORS error handling
async function testCorsErrorHandling() {
  console.log('🧪 Testing CORS error handling...');
  
  try {
    // This should trigger CORS errors and our improved error handling
    await timeLogsApi.getAll({ employeeId: 'test' });
    console.log('✅ Request succeeded (CORS might be fixed!)');
  } catch (error) {
    console.log('❌ CORS error detected:', error.message);
    
    if (error.message.includes('GOOGLE_APPS_SCRIPT_UPDATE_REQUIRED')) {
      console.log('✅ Enhanced error handling is working correctly!');
      console.log('📋 Detailed deployment instructions should be shown to the user.');
    }
  }
}

// Export for use in development
if (import.meta.env.DEV) {
  (window as any).testCorsErrorHandling = testCorsErrorHandling;
  console.log('🔧 Dev mode: Run testCorsErrorHandling() in browser console to test error handling');
}

export { testCorsErrorHandling };