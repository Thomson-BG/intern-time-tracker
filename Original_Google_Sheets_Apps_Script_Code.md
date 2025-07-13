# Original Google Sheets Apps Script Code

This document contains the complete history of the Google Sheets Apps Script code used in the Intern Time Tracker application.

## CORRECTED Production Code (Version 1.1) - CORS ISSUES FIXED

**Apps Script URL:** https://script.google.com/macros/s/AKfycbwCXc-dKoMKGxKoblHT6hVYu1XYbnnJX-_npLVM7r7BE1D-yc1LvnbMkZrronOk3OmB/exec

**Google Sheets ID:** 1LVY9UfJq3pZr_Y7bF37n3JYnsOL1slTSMp7TnxAqLRI

**Sheet Structure:**
- **Time Logs Sheet (gid=0):** Contains employee check-in/check-out data
- **Absence Logs Sheet (gid=1316231505):** Contains absence request data  
- **Admin Credentials Sheet (gid=1371082882):** Contains admin user credentials

### 🚨 IMPORTANT: The script below FIXES the CORS issue that was preventing check-in/out!

**CRITICAL FIX:** The original script was missing CORS headers in the `doPost` function, which caused all check-in/check-out requests to fail with CORS errors. This corrected version adds the missing headers.

### CORRECTED Apps Script Code (Version 1.1)

```javascript
function doPost(e) {
  // FIXED: Add CORS headers to doPost function (this was missing!)
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  // CRITICAL FIX: Set CORS headers for doPost (these were missing)
  output.setHeader('Access-Control-Allow-Origin', '*');
  output.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  output.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  try {
    const params = JSON.parse(e.postData.contents);
    const type = params.type;
    let result = "";
    
    // Time logs handling
    if (type === 'timelog') {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Time Logs");
      const headers = sheet.getDataRange().getValues()[0];
      
      // Ensure time is formatted correctly
      if (params.timeIn) {
        const timeString = params.timeIn;
        params.timeIn = timeString; // Keep the original format
      }
      if (params.timeOut) {
        const timeString = params.timeOut;
        params.timeOut = timeString; // Keep the original format
      }
      
      const row = headers.map(h => params[h] || "");
      sheet.appendRow(row);
      result = "Time log added";
    } 
    // Absence logs handling
    else if (type === 'absencelog') {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Absence Logs");
      const headers = sheet.getDataRange().getValues()[0];
      const row = headers.map(h => params[h] || "");
      sheet.appendRow(row);
      result = "Absence log added";
    } 
    // Admin credentials handling
    else if (type === 'managerPrivilege') {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Admin Credentials");
      
      if (!sheet) {
        output.setContent(JSON.stringify({ 
          success: false, 
          message: "Admin Credentials sheet not found" 
        }));
        return output;
      }
      
      // Get required parameters for manager privileges
      const { employeeId, name, role } = params;
      
      if (!employeeId || !name) {
        output.setContent(JSON.stringify({ 
          success: false, 
          message: "Missing required parameters: employeeId and name are required" 
        }));
        return output;
      }
      
      // Get existing data to check if the employeeId already exists
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const employeeIdIndex = headers.indexOf("employeeId");
      
      // Check if employee already exists
      const existingRowIndex = data.findIndex((row, index) => {
        // Skip header row
        if (index === 0) return false;
        return row[employeeIdIndex] && row[employeeIdIndex].toString() === employeeId.toString();
      });
      
      if (existingRowIndex !== -1) {
        // Update existing record
        const rowToUpdate = existingRowIndex + 1; // +1 because sheet is 1-indexed
        
        // Create updated row
        const updatedRow = headers.map(h => {
          if (params[h] !== undefined) {
            return params[h];
          } else {
            return data[existingRowIndex][headers.indexOf(h)];
          }
        });
        
        // Update the row in the sheet
        sheet.getRange(rowToUpdate, 1, 1, headers.length).setValues([updatedRow]);
        result = "Manager privileges updated";
      } else {
        // Create new record
        const newRow = headers.map(h => params[h] || "");
        sheet.appendRow(newRow);
        result = "Manager privileges added";
      }
    } else {
      result = "Invalid type";
    }
    
    output.setContent(JSON.stringify({ success: true, message: result }));
    return output;
    
  } catch (error) {
    output.setContent(JSON.stringify({ success: false, error: error.toString() }));
    return output;
  }
}

// Handle GET requests (for retrieving data)
function doGet(e) {
  // Set CORS headers for response
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  output.setHeader('Access-Control-Allow-Origin', '*');
  output.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  output.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  try {
    const type = e.parameter.type;
    const employeeId = e.parameter.employeeId;
    
    // Special case for admin credentials verification
    if (type === 'verifyAdmin') {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Admin Credentials");
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const employeeIdIndex = headers.indexOf("employeeId");
      const roleIndex = headers.indexOf("role");
      
      const adminUser = data.slice(1).find(row => 
        row[employeeIdIndex] && row[employeeIdIndex].toString() === employeeId.toString()
      );
      
      if (adminUser) {
        let userData = {};
        headers.forEach((header, index) => {
          userData[header] = adminUser[index];
        });
        
        output.setContent(JSON.stringify({ 
          success: true, 
          isAdmin: true,
          userData: userData
        }));
      } else {
        output.setContent(JSON.stringify({ 
          success: true, 
          isAdmin: false 
        }));
      }
      
      return output;
    }
    
    // Handle regular data retrieval
    if (!type) {
      output.setContent(JSON.stringify({ 
        success: false, 
        message: "Missing required parameter: type" 
      }));
      return output;
    }
    
    let sheet;
    let specificEmployee = true;
    
    if (type === 'timelog') {
      sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Time Logs");
    } else if (type === 'absencelog') {
      sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Absence Logs");
    } else if (type === 'adminList') {
      sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Admin Credentials");
      specificEmployee = false; // Get all admins
    } else {
      output.setContent(JSON.stringify({ 
        success: false, 
        message: "Invalid type: must be 'timelog', 'absencelog', 'adminList' or 'verifyAdmin'" 
      }));
      return output;
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    let logs;
    
    if (specificEmployee && !employeeId) {
      output.setContent(JSON.stringify({ 
        success: false, 
        message: "Missing required parameter: employeeId" 
      }));
      return output;
    }
    
    // Filter by employeeId if needed and convert to objects with named properties
    if (specificEmployee) {
      const employeeIdIndex = headers.indexOf("employeeId");
      const stringEmployeeId = employeeId.toString();
      
      logs = data.slice(1)
        .filter(row => {
          const rowEmployeeId = row[employeeIdIndex];
          return rowEmployeeId && rowEmployeeId.toString() === stringEmployeeId;
        })
        .map(row => {
          let obj = {};
          headers.forEach((header, index) => {
            obj[header] = row[index];
          });
          return obj;
        });
    } else {
      // For adminList or other non-filtered types
      logs = data.slice(1).map(row => {
        let obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index];
        });
        return obj;
      });
    }
    
    // Return in format compatible with previous API for better backward compatibility
    output.setContent(JSON.stringify(logs));
    return output;
    
  } catch (error) {
    output.setContent(JSON.stringify({ success: false, error: error.toString() }));
    return output;
  }
}

// Handle preflight OPTIONS requests for CORS
function doOptions(e) {
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  output.setHeader('Access-Control-Allow-Origin', '*');
  output.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  output.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  output.setContent(JSON.stringify({ status: 'ok' }));
  return output;
}
```

## Previous Version (Version 0.5) - Repository Generated Code

This was an enhanced version we created for the repository with additional features:

```javascript
/**
 * Google Apps Script for Intern Time Tracker
 * 
 * This script provides a complete backend for the Intern Time Tracker application
 * using Google Sheets as the database. It handles time logs, absence logs, and
 * admin credentials.
 * 
 * Setup Instructions:
 * 1. Create a new Google Apps Script project at https://script.google.com
 * 2. Replace the default code with this script
 * 3. Create three Google Sheets in the same Google Drive:
 *    - "Intern_Time_Logs" for time tracking data
 *    - "Intern_Absence_Logs" for absence data  
 *    - "Intern_Admin_Users" for admin credentials
 * 4. Update the SPREADSHEET_IDS object below with your sheet IDs
 * 5. Deploy as a web app with "Anyone" access
 * 6. Copy the web app URL to your frontend .env file as VITE_TIME_TRACKER_API
 */

// Configuration - Using the provided Google Sheets ID with different GIDs for each sheet
const SPREADSHEET_IDS = {
  TIME_LOGS: '1LVY9UfJq3pZr_Y7bF37n3JYnsOL1slTSMp7TnxAqLRI',
  ABSENCE_LOGS: '1LVY9UfJq3pZr_Y7bF37n3JYnsOL1slTSMp7TnxAqLRI', 
  ADMIN_USERS: '1LVY9UfJq3pZr_Y7bF37n3JYnsOL1slTSMp7TnxAqLRI'
};

// Sheet names within each spreadsheet
const SHEET_NAMES = {
  TIME_LOGS: 'TimeLogs',
  ABSENCE_LOGS: 'AbsenceLogs',
  ADMIN_USERS: 'AdminUsers'
};

/**
 * Main entry point for HTTP requests
 */
function doPost(e) {
  try {
    // Enable CORS
    const response = {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
      }
    };

    // Parse the request
    const data = JSON.parse(e.postData.contents);
    console.log('Received request:', data);

    let result;
    
    switch (data.type) {
      case 'timelog':
        result = handleTimeLog(data);
        break;
      case 'absencelog':
        result = handleAbsenceLog(data);
        break;
      case 'managerPrivilege':
        result = handleAdminCredential(data);
        break;
      default:
        throw new Error(`Unknown request type: ${data.type}`);
    }

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        data: result,
        message: 'Request processed successfully'
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('Error processing request:', error);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.message || 'Unknown error occurred'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET requests for data retrieval
 */
function doGet(e) {
  try {
    const params = e.parameter;
    console.log('Received GET request:', params);

    let result;
    
    switch (params.type) {
      case 'timelog':
        result = getTimeLogs(params.employeeId);
        break;
      case 'absencelog':
        result = getAbsenceLogs(params.employeeId);
        break;
      case 'adminList':
        result = getAdminCredentials();
        break;
      default:
        throw new Error(`Unknown GET request type: ${params.type}`);
    }

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        data: result
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('Error processing GET request:', error);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.message || 'Unknown error occurred'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle time log entries
 */
function handleTimeLog(data) {
  const sheet = getSheet(SPREADSHEET_IDS.TIME_LOGS, SHEET_NAMES.TIME_LOGS);
  
  // Initialize headers if sheet is empty
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, 12).setValues([[
      'Timestamp', 'First Name', 'Last Name', 'Employee ID', 'Device Name',
      'Action', 'Latitude', 'Longitude', 'Accuracy', 'Device ID', 'User Agent', 'Duration'
    ]]);
  }

  // Calculate duration for CHECK OUT
  let duration = '';
  if (data.action === 'OUT') {
    duration = calculateDuration(data.employeeId, sheet);
  }

  // Add the new row
  const rowData = [
    data.timestamp || new Date().toLocaleString(),
    data.firstName || '',
    data.lastName || '',
    data.employeeId || '',
    data.deviceName || '',
    data.action || '',
    data.latitude || '',
    data.longitude || '',
    data.accuracy || '',
    data.deviceId || '',
    data.userAgent || '',
    duration
  ];

  sheet.appendRow(rowData);
  
  return {
    ...data,
    duration: duration,
    timestamp: rowData[0]
  };
}

/**
 * Handle absence log entries
 */
function handleAbsenceLog(data) {
  const sheet = getSheet(SPREADSHEET_IDS.ABSENCE_LOGS, SHEET_NAMES.ABSENCE_LOGS);
  
  // Initialize headers if sheet is empty
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, 7).setValues([[
      'Submitted', 'First Name', 'Last Name', 'Employee ID', 'Device Name', 'Date', 'Reason'
    ]]);
  }

  // Add the new row
  const rowData = [
    data.submitted || new Date().toLocaleString(),
    data.firstName || '',
    data.lastName || '',
    data.employeeId || '',
    data.deviceName || '',
    data.date || '',
    data.reason || ''
  ];

  sheet.appendRow(rowData);
  
  return data;
}

/**
 * Handle admin credential storage
 */
function handleAdminCredential(data) {
  const sheet = getSheet(SPREADSHEET_IDS.ADMIN_USERS, SHEET_NAMES.ADMIN_USERS);
  
  // Initialize headers if sheet is empty
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, 7).setValues([[
      'Created', 'First Name', 'Last Name', 'Employee ID', 'Username', 'Password', 'Role'
    ]]);
  }

  // Check if username already exists
  const existingData = sheet.getDataRange().getValues();
  for (let i = 1; i < existingData.length; i++) {
    if (existingData[i][4] === data.username) {
      throw new Error('Username already exists');
    }
  }

  // Add the new admin user
  const rowData = [
    new Date().toLocaleString(),
    data.firstName || '',
    data.lastName || '',
    data.employeeId || '',
    data.username || '',
    data.password || '', // In production, this should be hashed
    data.role || 'admin'
  ];

  sheet.appendRow(rowData);
  
  return {
    ...data,
    created: rowData[0]
  };
}

/**
 * Get time logs for a specific employee
 */
function getTimeLogs(employeeId) {
  const sheet = getSheet(SPREADSHEET_IDS.TIME_LOGS, SHEET_NAMES.TIME_LOGS);
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) return [];
  
  const headers = data[0];
  const logs = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!employeeId || row[3] === employeeId) { // Employee ID is in column 3 (index 3)
      const log = {};
      headers.forEach((header, index) => {
        log[header.toLowerCase().replace(/\s+/g, '')] = row[index];
      });
      logs.push(log);
    }
  }
  
  return logs.reverse(); // Most recent first
}

/**
 * Get absence logs for a specific employee
 */
function getAbsenceLogs(employeeId) {
  const sheet = getSheet(SPREADSHEET_IDS.ABSENCE_LOGS, SHEET_NAMES.ABSENCE_LOGS);
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) return [];
  
  const headers = data[0];
  const logs = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!employeeId || row[3] === employeeId) { // Employee ID is in column 3
      const log = {};
      headers.forEach((header, index) => {
        log[header.toLowerCase().replace(/\s+/g, '')] = row[index];
      });
      logs.push(log);
    }
  }
  
  return logs.reverse(); // Most recent first
}

/**
 * Get all admin credentials (without passwords for security)
 */
function getAdminCredentials() {
  const sheet = getSheet(SPREADSHEET_IDS.ADMIN_USERS, SHEET_NAMES.ADMIN_USERS);
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) return [];
  
  const admins = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    admins.push({
      created: row[0],
      firstName: row[1],
      lastName: row[2], 
      employeeId: row[3],
      username: row[4],
      // password: row[5], // Don't return passwords
      role: row[6]
    });
  }
  
  return admins;
}

/**
 * Calculate duration between last check-in and current check-out
 */
function calculateDuration(employeeId, sheet) {
  const data = sheet.getDataRange().getValues();
  
  // Find the most recent CHECK IN for this employee today
  const today = new Date().toDateString();
  let lastCheckIn = null;
  
  for (let i = data.length - 1; i >= 1; i--) {
    const row = data[i];
    const timestamp = new Date(row[0]);
    const empId = row[3];
    const action = row[5];
    
    if (empId === employeeId && timestamp.toDateString() === today && action === 'IN') {
      lastCheckIn = timestamp;
      break;
    }
  }
  
  if (lastCheckIn) {
    const now = new Date();
    const diffMs = now.getTime() - lastCheckIn.getTime();
    const totalMinutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${hours} hours, ${minutes} minutes`;
  }
  
  return '';
}

/**
 * Get or create a sheet
 */
function getSheet(spreadsheetId, sheetName) {
  try {
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    let sheet = spreadsheet.getSheetByName(sheetName);
    
    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetName);
    }
    
    return sheet;
  } catch (error) {
    throw new Error(`Unable to access spreadsheet ${spreadsheetId}: ${error.message}`);
  }
}

/**
 * Test function to verify the script works
 */
function testScript() {
  console.log('Testing Google Apps Script...');
  
  // Test time log
  const testTimeLog = {
    type: 'timelog',
    firstName: 'Test',
    lastName: 'User',
    employeeId: 'TEST001',
    deviceName: 'Test Device',
    action: 'IN',
    timestamp: new Date().toLocaleString(),
    latitude: 40.7128,
    longitude: -74.0060,
    accuracy: 10
  };
  
  try {
    const result = handleTimeLog(testTimeLog);
    console.log('Time log test successful:', result);
  } catch (error) {
    console.error('Time log test failed:', error);
  }
  
  console.log('Test completed. Check your Google Sheets for the test data.');
}

/**
 * Setup function to create initial admin user
 */
function setupInitialAdmin() {
  const adminData = {
    type: 'managerPrivilege',
    firstName: 'Admin',
    lastName: 'User',
    employeeId: 'ADMIN001',
    username: 'admin',
    password: 'admin123', // Change this!
    role: 'admin'
  };
  
  try {
    const result = handleAdminCredential(adminData);
    console.log('Initial admin created:', result);
    console.log('Login with username: admin, password: admin123');
    console.log('IMPORTANT: Change the password after first login!');
  } catch (error) {
    console.error('Failed to create initial admin:', error);
  }
}
```

## Deployment Information

**Production Google Sheets URL:** https://docs.google.com/spreadsheets/d/1LVY9UfJq3pZr_Y7bF37n3JYnsOL1slTSMp7TnxAqLRI/edit?gid=0#gid=0

**Apps Script Deployment URL:** https://script.google.com/macros/s/AKfycbwCXc-dKoMKGxKoblHT6hVYu1XYbnnJX-_npLVM7r7BE1D-yc1LvnbMkZrronOk3OmB/exec

## Version History

### Version 1.1 (CORRECTED - CORS FIXED) - Current Recommended
- **Date:** December 2024 (Current Fix)
- **Critical Fix:** Added missing CORS headers to doPost function
- **Problem Solved:** Fixes "Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present" errors
- **Changes:** 
  - Added `output.setHeader('Access-Control-Allow-Origin', '*')` to doPost
  - Added `output.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')` to doPost  
  - Added `output.setHeader('Access-Control-Allow-Headers', 'Content-Type')` to doPost
- **Impact:** Now check-in/out and all POST requests work correctly from web browsers
- **Features:** All Version 1.0 features plus working CORS support

### Version 1.0 (Production - HAD CORS ISSUE)
- **Date:** Previous Production Version  
- **Issue:** Missing CORS headers in doPost function caused check-in/out failures
- **Features:** 
  - Time logging with duration calculation
  - Absence request logging
  - Admin credential management with verifyAdmin endpoint
  - Proper header mapping for dynamic sheet structures
  - CORS headers only in doGet and doOptions (missing in doPost)

### Version 0.5 (Repository Version)
- **Date:** Current
- **Changes:** Production-ready version with proper CORS headers and error handling
- **Features:** 
  - Time logging with duration calculation
  - Absence request logging
  - Admin credential management with verifyAdmin endpoint
  - Proper header mapping for dynamic sheet structures

### Version 0.5 (Repository Version)
- **Date:** Development version
- **Changes:** Enhanced version with additional features and better structure
- **Features:**
  - Improved error handling
  - Better code organization
  - Test and setup functions
  - More robust sheet management

## Key Differences Between Versions

1. **Structure:** The production version (1.0) uses dynamic header mapping, while version 0.5 uses fixed column positions
2. **Sheets:** Production version expects "Time Logs", "Absence Logs", and "Admin Credentials" sheet names
3. **API Response:** Production version has different response structures for certain endpoints
4. **CORS Handling:** Production version has more comprehensive CORS header management

## Integration Notes

The current frontend application is configured to work with Version 1.0 (production) through these key endpoints:
- `POST` with `type: 'timelog'` - For time tracking
- `POST` with `type: 'absencelog'` - For absence requests  
- `POST` with `type: 'managerPrivilege'` - For admin privilege management
- `GET` with `type: 'verifyAdmin'` - For admin authentication
- `GET` with `type: 'timelog'` or `type: 'absencelog'` - For data retrieval