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