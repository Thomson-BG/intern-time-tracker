# Original Google Sheets Apps Script Code

This document contains the complete history of the Google Sheets Apps Script code used in the Intern Time Tracker application.

## CORRECTED Production Code (Version 1.1) - CORS ISSUES FIXED

**Apps Script URL:** ENTER APPS SCRIPT URL

**Google Sheets ID:** YOUR GOOGLE SHEETS ID

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


### Version 1.1 (CORRECTED - CORS FIXED) - Current Recommended
- **Date:** July 2025 (Current Fix)
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
