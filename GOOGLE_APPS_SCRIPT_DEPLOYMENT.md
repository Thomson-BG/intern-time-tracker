# 🔧 Google Apps Script Deployment Guide

This guide will help you deploy the corrected Google Apps Script with proper CORS headers to fix the application's check-in/check-out functionality.

## 🚨 Problem

If you're seeing CORS errors in the browser console like:
```
Access to fetch at 'https://script.google.com/macros/s/...' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

This means your Google Apps Script needs to be updated with proper CORS headers.

## ✅ Solution: Deploy the Corrected Script

### Step 1: Access Google Apps Script

1. Go to [Google Apps Script](https://script.google.com/home)
2. Sign in with your Google account

### Step 2: Find or Create Your Project

**Option A: If you have an existing script:**
1. Look for your existing time tracker project in the list
2. Click on it to open the editor

**Option B: If you need to create a new script:**
1. Click "New Project" (+ button)
2. Give it a name like "Intern Time Tracker API"

### Step 3: Replace the Script Code

1. **Delete all existing code** in the editor
2. **Copy the entire contents** of `FINAL_CORRECTED_GOOGLE_APPS_SCRIPT.js` from this repository
3. **Paste it** into the Google Apps Script editor
4. **Save** the project (Ctrl+S or Cmd+S)

### Step 4: Deploy as Web App

1. Click **"Deploy"** button in the top right
2. Select **"New deployment"**
3. Choose type: **"Web app"**
4. Set **Execute as**: "Me"
5. Set **Who has access**: "Anyone"
6. Click **"Deploy"**

### Step 5: Copy the New URL

1. After deployment, you'll get a new Web app URL
2. Copy this URL (it should look like: `https://script.google.com/macros/s/SOME_ID/exec`)

### Step 6: Update Your Application (if needed)

1. If the URL is different from the current one in `utils/googleSheetsApi.ts`, update it:
   ```typescript
   const GOOGLE_SHEETS_API = 'YOUR_NEW_URL_HERE';
   ```

## 🔗 Required Google Sheets Setup

Make sure your Google Sheets has these sheets with the correct names:

1. **"Time Logs"** - for time tracking data
2. **"Absence Logs"** - for absence requests  
3. **"Admin Credentials"** - for admin user management

The sheets should have headers that match the data structures in the application.

## ✅ Testing

After deployment:

1. Open your application
2. Try to check in or check out
3. Check the browser console - CORS errors should be gone
4. Data should now save to your Google Sheets

## 🔍 Troubleshooting

### Still seeing CORS errors?
- Make sure you deployed the script as a **web app** (not just saved it)
- Verify **"Who has access"** is set to **"Anyone"**
- Wait a few minutes for changes to propagate

### App not connecting?
- Verify the URL in `googleSheetsApi.ts` matches your deployment URL
- Check that your Google Sheets has the required sheet names
- Make sure the Google Sheets is accessible (not restricted)

### Data not saving?
- Check the browser console for error messages
- Verify your sheet column headers match the expected format
- Make sure the script has permission to access your Google Sheets

## 📞 Support

If you continue to have issues:

1. Check the browser console for specific error messages
2. Verify all deployment steps were followed correctly
3. Test with a simple browser refresh to clear any cached errors

The application includes helpful error detection and will guide you through common issues.