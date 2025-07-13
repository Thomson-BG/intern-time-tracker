/**
 * CORRECTED Google Apps Script for Intern Time Tracker
 * 
 * This script fixes the CORS issues that were preventing the application from working.
 * The main fix is adding proper CORS headers to the doPost function.
 * 
 * IMPORTANT: Replace the existing Google Apps Script code with this corrected version.
 * 
 * Apps Script URL: https://script.google.com/macros/s/AKfycbwCXc-dKoMKGxKoblHT6hVYu1XYbnnJX-_npLVM7r7BE1D-yc1LvnbMkZrronOk3OmB/exec
 * Google Sheets ID: 1LVY9UfJq3pZr_Y7bF37n3JYnsOL1slTSMp7TnxAqLRI
 */

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

// Handle GET requests (for retrieving data) - Already has CORS headers
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

// Handle preflight OPTIONS requests for CORS - Already correct
function doOptions(e) {
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  output.setHeader('Access-Control-Allow-Origin', '*');
  output.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  output.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  output.setContent(JSON.stringify({ status: 'ok' }));
  return output;
}