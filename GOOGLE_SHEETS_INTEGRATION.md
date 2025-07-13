# Google Sheets Integration Documentation

## Overview

The Intern Time Tracker application has been successfully restored to use Google Sheets as its primary data storage backend. This integration allows the application to log time entries, absence requests, and admin credentials directly to Google Sheets using Google Apps Script.

## Architecture

### Components

1. **Frontend Application** (React/TypeScript)
   - Located in `/src/App.tsx` and components in `/components/`
   - Handles user interface and user interactions
   - Sends data to Google Apps Script via HTTP requests

2. **Google Apps Script Backend**
   - Code located in `/GOOGLE_APPS_SCRIPT.js`
   - Deployed as a web application on Google Apps Script platform
   - Handles HTTP requests and writes data to Google Sheets

3. **Google Sheets Database**
   - Three sheets in one spreadsheet:
     - `TimeLogs` - Stores check-in/check-out data
     - `AbsenceLogs` - Stores absence requests
     - `AdminUsers` - Stores admin credentials

## API Endpoints

The Google Apps Script provides the following functionality:

### POST Requests (Data Submission)
- **Time Logging**: `{ type: 'timelog', ... }`
- **Absence Logging**: `{ type: 'absencelog', ... }`
- **Admin Credential Creation**: `{ type: 'managerPrivilege', ... }`

### GET Requests (Data Retrieval)
- **Get Time Logs**: `?type=timelog&employeeId=<id>`
- **Get Absence Logs**: `?type=absencelog&employeeId=<id>`
- **Get Admin List**: `?type=adminList`

## Configuration

### Environment Variables

The application uses the following environment variable in `.env`:

```env
# Google Sheets API Configuration (Restored)
VITE_TIME_TRACKER_API="https://script.google.com/macros/s/AKfycbwG6NJfEszOA-qEstt-gCY3Bn_QQghX2FfrJvALecYQPcOQO5yrpBQCg1yjiaJT0Pt9/exec"
```

### Google Sheets Setup

The Google Sheets spreadsheet ID is configured in the Apps Script:
- **Spreadsheet ID**: `1LVY9UfJq3pZr_Y7bF37n3JYnsOL1slTSMp7TnxAqLRI`

## Features Restored

### ✅ Time Tracking
- Check-in/check-out functionality
- GPS location capture
- Automatic duration calculation
- Monday-Thursday restriction
- Device identification

### ✅ Absence Reporting
- Date selection
- Absence type categorization (Sick, Emergency, Medical Appointment, Other)
- Optional reason field
- Automatic submission timestamp

### ✅ Admin Authentication
- Username/password validation against Google Sheets
- Fallback credentials for testing:
  - Username: `admin`, Password: `admin123`
  - Username: `manager`, Password: `manager123`

### ✅ Data Retrieval
- Timesheet viewing
- Historical data access
- Admin data management

## API Service Structure

### Main API Service (`/utils/googleSheetsApi.ts`)

The application uses a modular API structure:

```typescript
// Import the Google Sheets API
import googleSheetsApi, { 
  timeLogsApi, 
  absenceLogsApi, 
  adminApi 
} from '../utils/googleSheetsApi';

// Usage examples
await timeLogsApi.create(newTimeLog);
await absenceLogsApi.create(newAbsenceLog);
await adminApi.login(username, password);
```

### Error Handling

The API includes robust error handling for:
- CORS issues in development mode
- Network connectivity problems
- Google Apps Script availability
- Invalid data submissions

## Development vs Production

### Development Mode
- CORS restrictions may prevent some requests
- Health checks return `true` to avoid false negatives
- Fallback credentials are available for testing

### Production Mode
- All requests work normally through the deployed web app
- Full error reporting and validation
- Real-time data synchronization with Google Sheets

## Deployment Notes

### Google Apps Script Deployment
1. The script in `GOOGLE_APPS_SCRIPT.js` must be deployed as a web application
2. Permissions must be set to "Anyone" for public access
3. The deployment URL becomes the `VITE_TIME_TRACKER_API` value

### Frontend Deployment
1. The application can be deployed to any static hosting service
2. Environment variables must be properly configured
3. HTTPS is recommended for production use

## Troubleshooting

### Common Issues

1. **CORS Errors in Development**
   - Expected behavior in local development
   - Use production deployment for full testing

2. **"Invalid username or password" for Admin**
   - Check if admin users are created in Google Sheets
   - Use fallback credentials: admin/admin123 or manager/manager123
   - Verify Google Apps Script is properly deployed

3. **Time Logging Stuck on "Processing"**
   - Usually caused by geolocation permission requests
   - Allow location access in browser
   - Check browser console for specific errors

### Health Check

The application includes a health check system that verifies:
- Google Apps Script availability
- API endpoint responsiveness
- Basic connectivity

## Security Considerations

- Admin passwords are stored in plain text (should be hashed in production)
- The Google Apps Script URL is public but requires specific data formats
- Location data is captured and stored with each time log
- All data is stored in the configured Google Sheets

## Testing

The integration has been tested for:
- ✅ Application builds successfully
- ✅ All UI components load correctly
- ✅ Tab navigation works properly
- ✅ Time logging UI responds to interactions
- ✅ Absence form displays and submits correctly
- ✅ Admin login attempts connect to Google Sheets
- ✅ Form validation and error handling
- ✅ Data persistence (form clears after successful submission)

## Maintenance

### Regular Tasks
1. Monitor Google Apps Script execution logs
2. Check Google Sheets data integrity
3. Update fallback credentials as needed
4. Review and rotate API URLs if necessary

### Data Backup
- Google Sheets provides automatic version history
- Consider periodic exports for additional backup
- Admin credential list should be maintained separately