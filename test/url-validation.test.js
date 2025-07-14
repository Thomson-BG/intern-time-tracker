/**
 * Test to verify Google Apps Script URL is correctly updated
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NEW_URL = 'https://script.google.com/macros/s/AKfycbxzqM__6ZxYynWyIgfoqe1G7YhIVln9qLSk_GRsgJAxe_iY-WJEH80_VqLEtO9mxDUR/exec';
const OLD_URL = 'https://script.google.com/macros/s/AKfycbw-C2m5u7nbISf9ps9AUoCCj5WV_wGf5TNm7E6rXavLMgyBPLjiqxykSHBtQAYjL8el/exec';

function validateUrlInFile(filePath, description) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes(OLD_URL)) {
      console.error(`❌ ${description} still contains old URL`);
      return false;
    }
    
    if (content.includes(NEW_URL)) {
      console.log(`✅ ${description} contains new URL`);
      return true;
    }
    
    console.log(`ℹ️  ${description} does not contain the URL (may not be used in this file)`);
    return true; // Not an error if file doesn't use the URL
  } catch (error) {
    console.error(`❌ Error reading ${description}: ${error.message}`);
    return false;
  }
}

function runUrlValidationTests() {
  console.log('🔍 Validating Google Apps Script URL updates...\n');
  
  const filesToCheck = [
    { path: '.env', description: '.env file' },
    { path: 'utils/apiService.ts', description: 'API Service' },
    { path: 'utils/googleSheetsApi.ts', description: 'Google Sheets API' }
  ];
  
  let allPassed = true;
  
  for (const file of filesToCheck) {
    const fullPath = path.join(__dirname, '..', file.path);
    const passed = validateUrlInFile(fullPath, file.description);
    allPassed = allPassed && passed;
  }
  
  console.log('\n' + '='.repeat(50));
  if (allPassed) {
    console.log('🎉 All URL validation tests passed!');
    process.exit(0);
  } else {
    console.log('❌ Some URL validation tests failed!');
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runUrlValidationTests();
}

export { runUrlValidationTests, NEW_URL, OLD_URL };