/**
 * Simple Google Apps Script for Intern Time Tracker
 * 
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Go to: https://script.google.com/macros/s/AKfycbxzqM__6ZxYynWyIgfoqe1G7YhIVln9qLSk_GRsgJAxe_iY-WJEH80_VqLEtO9mxDUR/exec
 * 2. Replace ALL existing code with this script
 * 3. Save and deploy as web app with "Execute as: Me" and "Who has access: Anyone"
 * 
 * Google Sheets ID: 1LVY9UfJq3pZr_Y7bF37n3JYnsOL1slTSMp7TnxAqLRI
 */

function doPost(e) {
  const params = JSON.parse(e.postData.contents);
  const type = params.type;
  if (type === 'timelog') {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Time Logs");
    const headers = sheet.getDataRange().getValues()[0];
    const row = headers.map(h => params[h] || "");
    sheet.appendRow(row);
    return ContentService.createTextOutput("Time log added");
  } else if (type === 'absencelog') {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Absence Logs");
    const headers = sheet.getDataRange().getValues()[0];
    const row = headers.map(h => params[h] || "");
    sheet.appendRow(row);
    return ContentService.createTextOutput("Absence log added");
  }
  return ContentService.createTextOutput("Invalid type");
}

function doGet(e) {
  const type = e.parameter.type;
  const employeeId = e.parameter.employeeId;
  let sheet;
  if (type === 'timelog') {
    sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Time Logs");
  } else if (type === 'absencelog') {
    sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Absence Logs");
  } else {
    return ContentService.createTextOutput("Invalid type");
  }
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const logs = data.slice(1).filter(row => row[headers.indexOf("employeeId")] == employeeId);
  return ContentService.createTextOutput(JSON.stringify(logs)).setMimeType(ContentService.MimeType.JSON);
}