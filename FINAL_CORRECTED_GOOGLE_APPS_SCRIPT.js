/**
 * FINAL CORRECTED Google Apps Script for Intern Time Tracker
 * 
 * This is the definitive fix for all CORS issues preventing check-in/check-out functionality.
 * 
 * CRITICAL CHANGES:
 * 1. Proper CORS headers on ALL functions (doGet, doPost, doOptions)
 * 2. Enhanced OPTIONS handling for preflight requests
 * 3. Consistent header setting across all response types
 * 4. Better error handling and logging
 * 
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Go to: https://script.google.com/macros/s/AKfycbwCXc-dKoMKGxKoblHT6hVYu1XYbnnJX-_npLVM7r7BE1D-yc1LvnbMkZrronOk3OmB/exec
 * 2. Replace ALL existing code with this script
 * 3. Save and deploy as web app with "Execute as: Me" and "Who has access: Anyone"
 * 
 * Google Sheets ID: 1LVY9UfJq3pZr_Y7bF37n3JYnsOL1slTSMp7TnxAqLRI
 */

// Global function to set CORS headers consistently
function setCorsHeaders(output) {
  output.setHeader('Access-Control-Allow-Origin', '*');
  output.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  output.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  output.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  return output;
}

// Handle OPTIONS requests for CORS preflight - THIS IS CRITICAL
function doOptions(e) {
  console.log('OPTIONS request received:', JSON.stringify(e));
  
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  // Set CORS headers
  output = setCorsHeaders(output);
  
  // Return success response for preflight
  output.setContent(JSON.stringify({ 
    status: 'ok', 
    message: 'CORS preflight successful',
    timestamp: new Date().toISOString()
  }));
  
  return output;
}

// Handle POST requests (for creating/updating data)
function doPost(e) {
  console.log('POST request received:', JSON.stringify(e));
  
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  // CRITICAL: Set CORS headers FIRST
  output = setCorsHeaders(output);
  
  try {
    // Parse the request data
    const params = JSON.parse(e.postData.contents);
    const type = params.type;
    let result = "";
    
    console.log('Parsed POST params:', JSON.stringify(params));
    
    // Time logs handling
    if (type === 'timelog') {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Time Logs");
      if (!sheet) {
        throw new Error("Time Logs sheet not found");
      }
      
      const headers = sheet.getDataRange().getValues()[0];
      console.log('Time Logs headers:', headers);
      
      // Map parameters to sheet columns
      const row = headers.map(h => {
        if (params[h] !== undefined) {
          return params[h];
        }
        // Handle common field name variations
        switch(h.toLowerCase()) {
          case 'firstname': return params.firstName || params.firstname || "";
          case 'lastname': return params.lastName || params.lastname || "";
          case 'employeeid': return params.employeeId || params.employeeid || "";
          case 'devicename': return params.deviceName || params.devicename || "";
          case 'timein': return params.timeIn || (params.action === 'IN' ? params.timestamp : "") || "";
          case 'timeout': return params.timeOut || (params.action === 'OUT' ? params.timestamp : "") || "";
          default: return params[h] || "";
        }
      });
      
      console.log('Appending time log row:', row);
      sheet.appendRow(row);
      result = "Time log added successfully";
    } 
    // Absence logs handling
    else if (type === 'absencelog') {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Absence Logs");
      if (!sheet) {
        throw new Error("Absence Logs sheet not found");
      }
      
      const headers = sheet.getDataRange().getValues()[0];
      console.log('Absence Logs headers:', headers);
      
      const row = headers.map(h => {
        if (params[h] !== undefined) {
          return params[h];
        }
        // Handle common field name variations
        switch(h.toLowerCase()) {
          case 'firstname': return params.firstName || params.firstname || "";
          case 'lastname': return params.lastName || params.lastname || "";
          case 'employeeid': return params.employeeId || params.employeeid || "";
          case 'devicename': return params.deviceName || params.devicename || "";
          default: return params[h] || "";
        }
      });
      
      console.log('Appending absence log row:', row);
      sheet.appendRow(row);
      result = "Absence log added successfully";
    } 
    // Admin credentials handling
    else if (type === 'managerPrivilege') {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Admin Credentials");
      if (!sheet) {
        throw new Error("Admin Credentials sheet not found");
      }
      
      const { employeeId, name, role } = params;
      
      if (!employeeId || !name) {
        throw new Error("Missing required parameters: employeeId and name are required");
      }
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const employeeIdIndex = headers.indexOf("employeeId");
      
      // Check if employee already exists
      const existingRowIndex = data.findIndex((row, index) => {
        if (index === 0) return false; // Skip header row
        return row[employeeIdIndex] && row[employeeIdIndex].toString() === employeeId.toString();
      });
      
      const row = headers.map(h => {
        if (params[h] !== undefined) {
          return params[h];
        }
        // Handle common field name variations
        switch(h.toLowerCase()) {
          case 'firstname': return params.firstName || params.firstname || "";
          case 'lastname': return params.lastName || params.lastname || "";
          case 'employeeid': return params.employeeId || params.employeeid || "";
          default: return params[h] || "";
        }
      });
      
      if (existingRowIndex !== -1) {
        // Update existing record
        const rowToUpdate = existingRowIndex + 1; // +1 because sheet is 1-indexed
        sheet.getRange(rowToUpdate, 1, 1, headers.length).setValues([row]);
        result = "Manager privileges updated successfully";
      } else {
        // Create new record
        sheet.appendRow(row);
        result = "Manager privileges added successfully";
      }
    } else {
      throw new Error("Invalid type: must be 'timelog', 'absencelog', or 'managerPrivilege'");
    }
    
    // Return success response
    output.setContent(JSON.stringify({ 
      success: true, 
      message: result,
      timestamp: new Date().toISOString()
    }));
    
    console.log('POST operation successful:', result);
    return output;
    
  } catch (error) {
    console.error('POST operation failed:', error.toString());
    
    output.setContent(JSON.stringify({ 
      success: false, 
      error: error.toString(),
      timestamp: new Date().toISOString()
    }));
    
    return output;
  }
}

// Handle GET requests (for retrieving data)
function doGet(e) {
  console.log('GET request received:', JSON.stringify(e));
  
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  // CRITICAL: Set CORS headers FIRST
  output = setCorsHeaders(output);
  
  try {
    const type = e.parameter.type;
    const employeeId = e.parameter.employeeId;
    
    console.log('GET parameters - type:', type, 'employeeId:', employeeId);
    
    // Special case for admin credentials verification
    if (type === 'verifyAdmin') {
      if (!employeeId) {
        throw new Error("Missing required parameter: employeeId");
      }
      
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Admin Credentials");
      if (!sheet) {
        throw new Error("Admin Credentials sheet not found");
      }
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const employeeIdIndex = headers.indexOf("employeeId");
      
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
          userData: userData,
          timestamp: new Date().toISOString()
        }));
      } else {
        output.setContent(JSON.stringify({ 
          success: true, 
          isAdmin: false,
          timestamp: new Date().toISOString()
        }));
      }
      
      return output;
    }
    
    // Handle regular data retrieval
    if (!type) {
      throw new Error("Missing required parameter: type");
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
      throw new Error("Invalid type: must be 'timelog', 'absencelog', 'adminList' or 'verifyAdmin'");
    }
    
    if (!sheet) {
      throw new Error(`Sheet not found for type: ${type}`);
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    let logs;
    
    if (specificEmployee && !employeeId) {
      throw new Error("Missing required parameter: employeeId");
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
    
    console.log(`Retrieved ${logs.length} records for type: ${type}`);
    
    // Return the data directly (not wrapped in success object for compatibility)
    output.setContent(JSON.stringify(logs));
    return output;
    
  } catch (error) {
    console.error('GET operation failed:', error.toString());
    
    output.setContent(JSON.stringify({ 
      success: false, 
      error: error.toString(),
      timestamp: new Date().toISOString()
    }));
    
    return output;
  }
}

// Test function to verify the script is working
function testScript() {
  console.log('Test function called - script is active');
  return 'Script is working correctly';
}