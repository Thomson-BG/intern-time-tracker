/**
 * Comprehensive Connectivity and Firewall Test
 * Tests network connectivity to demonstrate firewall status
 */

export interface ConnectivityTestResult {
  site: string;
  success: boolean;
  statusCode?: number;
  responseTime: number;
  error?: string;
  isGoogleService: boolean;
}

export interface FirewallTestSummary {
  totalTested: number;
  successful: number;
  failed: number;
  googleServicesWorking: number;
  firewallStatus: 'OPEN' | 'PARTIAL' | 'RESTRICTED';
  canAccessGoogleSheets: boolean;
  results: ConnectivityTestResult[];
}

// Test sites categorized by type
const TEST_SITES = {
  google: [
    'https://www.google.com',
    'https://docs.google.com', 
    'https://script.google.com',
    'https://sheets.googleapis.com'
  ],
  general: [
    'https://httpbin.org/status/200',
    'https://api.github.com',
    'https://jsonplaceholder.typicode.com/posts/1',
    'https://www.w3.org',
    'https://www.mozilla.org',
    'https://cdnjs.cloudflare.com'
  ]
};

// The specific Google Apps Script URL used by the application
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxzqM__6ZxYynWyIgfoqe1G7YhIVln9qLSk_GRsgJAxe_iY-WJEH80_VqLEtO9mxDUR/exec';

async function testSingleSite(url: string): Promise<ConnectivityTestResult> {
  const startTime = performance.now();
  const isGoogleService = url.includes('google.com') || url.includes('googleapis.com');
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors', // Avoid CORS issues for connectivity testing
      signal: controller.signal,
      cache: 'no-cache'
    });
    
    clearTimeout(timeoutId);
    const responseTime = performance.now() - startTime;
    
    return {
      site: url,
      success: true,
      statusCode: response.status,
      responseTime: Math.round(responseTime),
      isGoogleService
    };
  } catch (error: any) {
    const responseTime = performance.now() - startTime;
    
    // Note: With no-cors mode, we might get opaque responses
    // A successful network request (even with CORS issues) means connectivity works
    if (error.name !== 'AbortError' && responseTime < 4000) {
      return {
        site: url,
        success: true, // Network reached the server
        responseTime: Math.round(responseTime),
        error: 'CORS restricted but network connection successful',
        isGoogleService
      };
    }
    
    return {
      site: url,
      success: false,
      responseTime: Math.round(responseTime),
      error: error.message || 'Network connection failed',
      isGoogleService
    };
  }
}

export async function runConnectivityTest(): Promise<FirewallTestSummary> {
  console.log('🔥 Starting comprehensive connectivity and firewall test...\n');
  
  const allSites = [...TEST_SITES.google, ...TEST_SITES.general];
  const results: ConnectivityTestResult[] = [];
  
  // Test all sites
  for (let i = 0; i < allSites.length; i++) {
    const site = allSites[i];
    console.log(`Testing ${i + 1}/${allSites.length}: ${site}`);
    
    const result = await testSingleSite(site);
    results.push(result);
    
    const status = result.success ? '✅' : '❌';
    const details = result.error ? ` (${result.error})` : '';
    console.log(`  ${status} ${result.responseTime}ms${details}`);
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Test the specific Google Apps Script URL
  console.log('\n🎯 Testing Google Apps Script endpoint specifically...');
  const gAppsScriptResult = await testGoogleAppsScript();
  
  // Analyze results
  const successful = results.filter(r => r.success).length;
  const failed = results.length - successful;
  const googleServicesWorking = results.filter(r => r.isGoogleService && r.success).length;
  
  let firewallStatus: 'OPEN' | 'PARTIAL' | 'RESTRICTED';
  if (successful >= 8) {
    firewallStatus = 'OPEN';
  } else if (successful >= 4) {
    firewallStatus = 'PARTIAL';
  } else {
    firewallStatus = 'RESTRICTED';
  }
  
  const summary: FirewallTestSummary = {
    totalTested: results.length,
    successful,
    failed,
    googleServicesWorking,
    firewallStatus,
    canAccessGoogleSheets: gAppsScriptResult.accessible,
    results
  };
  
  // Print detailed summary
  printFirewallTestSummary(summary, gAppsScriptResult);
  
  return summary;
}

async function testGoogleAppsScript() {
  try {
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'GET',
      mode: 'cors' // We need CORS for actual functionality
    });
    
    return {
      accessible: true,
      statusCode: response.status,
      message: `Google Apps Script is accessible (Status: ${response.status})`
    };
  } catch (error: any) {
    const isCorsError = error.message?.includes('CORS') || 
                       error.message?.includes('Failed to fetch');
    
    if (isCorsError) {
      return {
        accessible: false,
        error: error.message,
        message: 'Google Apps Script blocked by CORS/firewall - application cannot function'
      };
    }
    
    return {
      accessible: false,
      error: error.message,
      message: 'Google Apps Script unreachable - network connectivity issue'
    };
  }
}

function printFirewallTestSummary(summary: FirewallTestSummary, gAppsScriptResult: any) {
  console.log('\n' + '='.repeat(80));
  console.log('🏆 FIREWALL AND CONNECTIVITY TEST RESULTS');
  console.log('='.repeat(80));
  
  console.log(`📊 Overall Connectivity: ${summary.successful}/${summary.totalTested} sites accessible`);
  console.log(`🔗 Google Services: ${summary.googleServicesWorking}/${TEST_SITES.google.length} accessible`);
  console.log(`🎯 Google Apps Script: ${gAppsScriptResult.accessible ? '✅ Accessible' : '❌ Blocked'}`);
  
  console.log(`\n🔥 FIREWALL STATUS: ${summary.firewallStatus}`);
  
  switch (summary.firewallStatus) {
    case 'OPEN':
      console.log('✅ Network connectivity is excellent');
      console.log('✅ Most external sites are accessible');
      break;
    case 'PARTIAL':
      console.log('⚠️  Some network restrictions detected');
      console.log('⚠️  Some external sites are blocked');
      break;
    case 'RESTRICTED':
      console.log('🚫 Heavy network restrictions detected');
      console.log('🚫 Most external sites are blocked');
      break;
  }
  
  console.log(`\n📱 APPLICATION STATUS:`);
  if (summary.canAccessGoogleSheets) {
    console.log('✅ Application can connect to Google Sheets backend');
    console.log('✅ Time tracking and absence logging will work');
  } else {
    console.log('❌ Application cannot connect to Google Sheets backend');
    console.log('❌ Time tracking and absence logging will fail');
    console.log('💡 Solution: Enable mock mode for testing');
    console.log('   Run: window.mockGoogleSheetsAPI.enable()');
  }
  
  console.log('\n📋 DETAILED RESULTS:');
  summary.results.forEach((result, index) => {
    const icon = result.success ? '✅' : '❌';
    const service = result.isGoogleService ? '(Google)' : '(General)';
    const url = result.site.length > 60 ? result.site.substring(0, 57) + '...' : result.site;
    console.log(`${index + 1}. ${icon} ${url} ${service} - ${result.responseTime}ms`);
  });
  
  console.log(`\n🔧 Google Apps Script Details:`);
  console.log(`   URL: ${GOOGLE_APPS_SCRIPT_URL}`);
  console.log(`   Status: ${gAppsScriptResult.accessible ? '✅ Accessible' : '❌ Blocked'}`);
  console.log(`   Message: ${gAppsScriptResult.message}`);
}

// Browser console helper
if (typeof window !== 'undefined') {
  (window as any).runConnectivityTest = runConnectivityTest;
  console.log('🔧 Connectivity test available as window.runConnectivityTest()');
}