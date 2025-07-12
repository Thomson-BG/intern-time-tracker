# File-Based Database Setup and Documentation

## Overview

This document provides comprehensive documentation for the free, file-based database solution implemented for the Intern Time Tracking System. This solution eliminates the need for external database services and provides a completely local, free alternative to MongoDB Atlas.

## Database Solution

### Technology Used
- **Database Type**: File-based JSON database
- **Storage**: Local filesystem using JSON files
- **Backend Framework**: Node.js with Express
- **Data Persistence**: Automatic JSON file read/write operations
- **Cost**: Completely free (no external services required)

### Database Structure

The database consists of three main collections stored as JSON files:

#### 1. Time Logs (`/backend/database/timeLogs.json`)
```json
{
  "_id": "unique_id",
  "firstName": "John",
  "lastName": "Doe", 
  "employeeId": "EMP001",
  "action": "IN" | "OUT",
  "timestamp": "7/12/2025 3:55:00 PM",
  "rawTimestamp": 1752360917663,
  "latitude": 40.7128,
  "longitude": -74.0060,
  "accuracy": 10,
  "deviceId": "optional",
  "userAgent": "optional",
  "duration": "0 hours, 0 minutes", // Only for OUT actions
  "createdAt": "2025-07-12T22:55:17.663Z",
  "updatedAt": "2025-07-12T22:55:17.663Z"
}
```

#### 2. Absence Logs (`/backend/database/absenceLogs.json`)
```json
{
  "_id": "unique_id",
  "firstName": "Jane",
  "lastName": "Smith",
  "employeeId": "EMP002", 
  "deviceName": "optional",
  "date": "2025-07-13",
  "absenceType": "Sick",
  "reason": "Doctor appointment",
  "submitted": "7/12/2025, 10:55:31 PM",
  "createdAt": "2025-07-12T22:55:31.227Z",
  "updatedAt": "2025-07-12T22:55:31.227Z"
}
```

#### 3. Admin Credentials (`/backend/database/adminCredentials.json`)
```json
{
  "_id": "unique_id",
  "firstName": "Admin",
  "lastName": "User",
  "employeeId": "ADMIN001",
  "username": "admin",
  "password": "admin123", // Note: Should be hashed in production
  "role": "admin",
  "createdAt": "2025-07-12T22:54:46.987Z"
}
```

## Setup Instructions

### Prerequisites
- Node.js (version 14 or higher)
- npm (Node Package Manager)

### Installation Steps

1. **Clone Repository**
   ```bash
   git clone https://github.com/Thomson-BG/intern-time-tracker.git
   cd intern-time-tracker
   ```

2. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Environment Configuration**
   The backend uses a `.env` file with the following configuration:
   ```env
   # File-based Database Configuration
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=development-jwt-secret-change-in-production
   DATABASE_TYPE=file-based
   ```

5. **Start the Backend Server**
   ```bash
   cd backend
   npm start
   ```
   The server will start on `http://localhost:5000`

6. **Start the Frontend Application**
   ```bash
   # In the root directory
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`

## Database Features

### Automatic Initialization
- Database files are created automatically on first startup
- Default admin user is created with credentials: `admin` / `admin123`
- All collections are initialized with proper structure

### Data Operations
- **Create**: Add new records to any collection
- **Read**: Query records with filtering capabilities
- **Update**: Modify existing records
- **Delete**: Remove records from collections

### Data Validation
- Required field validation
- Data type checking
- Unique constraint enforcement (username, employeeId)
- Enum validation for action types and roles

### Performance Features
- In-memory filtering and sorting
- Efficient JSON parsing and serialization
- Automatic timestamping
- ID generation for all records

## API Endpoints

### Health Check
- **GET** `/api/health` - System status and database connectivity

### Time Logs
- **GET** `/api/time-logs` - Retrieve time logs with optional filtering
- **POST** `/api/time-logs` - Create new time log entry
- **GET** `/api/time-logs/today/:employeeId` - Get today's logs for specific employee

### Absence Logs  
- **GET** `/api/absence-logs` - Retrieve absence logs with optional filtering
- **POST** `/api/absence-logs` - Create new absence log entry
- **DELETE** `/api/absence-logs/:id` - Delete specific absence log

### Admin
- **POST** `/api/admin/login` - Admin authentication
- **POST** `/api/admin/credentials` - Create new admin user
- **GET** `/api/admin/credentials` - Get all admin users (without passwords)

## Default Credentials

The system creates a default admin user on first startup:
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: `admin`
- **Employee ID**: `ADMIN001`

## Testing the Application

### Backend API Testing
```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test admin login
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# Test time log creation
curl -X POST http://localhost:5000/api/time-logs \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe", 
    "employeeId": "EMP001",
    "action": "IN",
    "timestamp": "7/12/2025 3:55:00 PM"
  }'
```

### Frontend Testing
1. Navigate to `http://localhost:5173`
2. Fill in personal information (First Name, Last Name, Employee ID)
3. Use CHECK IN/CHECK OUT buttons to log time
4. Use admin login with `admin` / `admin123` to access dashboard
5. View time logs, absence logs, and admin users in dashboard

## Data Backup and Recovery

### Backup
The database files are stored in `/backend/database/`:
- `timeLogs.json`
- `absenceLogs.json`  
- `adminCredentials.json`

To backup data:
```bash
cp -r backend/database/ backup-$(date +%Y%m%d)/
```

### Recovery
To restore data:
```bash
cp -r backup-YYYYMMDD/ backend/database/
```

## Security Considerations

### Current Implementation
- Basic password authentication (plaintext storage)
- Rate limiting on API endpoints
- CORS protection
- Helmet security headers

### Production Recommendations
1. **Password Hashing**: Implement bcrypt for password hashing
2. **JWT Tokens**: Add proper JWT-based authentication
3. **HTTPS**: Use SSL/TLS encryption for production
4. **File Permissions**: Restrict database file access
5. **Input Validation**: Enhanced sanitization and validation

## Advantages of File-Based Database

### Benefits
- **Zero Cost**: No external service fees
- **No Network Dependencies**: Works offline
- **Simple Setup**: No complex configuration
- **Full Control**: Complete data ownership
- **Easy Backup**: Simple file copy operations
- **Portable**: Can be moved between environments easily

### Limitations
- **Concurrency**: Limited concurrent write operations
- **Scalability**: Not suitable for high-volume applications
- **Querying**: Basic filtering capabilities
- **Relationships**: No complex joins or relationships

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using port 5000
   lsof -i :5000
   # Kill the process or change PORT in .env
   ```

2. **Permission Errors**
   ```bash
   # Ensure write permissions to database directory
   chmod 755 backend/database/
   ```

3. **File Corruption**
   ```bash
   # Restore from backup or delete corrupted files to reinitialize
   rm backend/database/*.json
   npm start
   ```

4. **API Connection Issues**
   - Verify backend is running on port 5000
   - Check frontend API base URL configuration
   - Ensure no firewall blocking local connections

## Maintenance

### Regular Tasks
1. **Monitor File Sizes**: Large JSON files may impact performance
2. **Backup Data**: Regular backups of database directory
3. **Log Rotation**: Clean up old log entries if needed
4. **Update Dependencies**: Keep npm packages updated

### Data Cleanup
```javascript
// Example: Remove old time logs (older than 90 days)
const cutoffDate = Date.now() - (90 * 24 * 60 * 60 * 1000);
// Filter timeLogs.json to remove old entries
```

## Migration to External Database

If needed in the future, migration to MongoDB Atlas or other services is straightforward:
1. Export data from JSON files
2. Import to new database
3. Update models to use Mongoose/external DB
4. Update connection configuration

## Support and Contact

For technical support or questions about the database setup:
- **Email**: joshua.m.thomson1985@gmail.com
- **Username**: joshua.m.thomson1985
- **Repository**: Thomson-BG/intern-time-tracker

This file-based database solution provides a robust, free alternative that meets all the requirements for the intern time tracking application while maintaining simplicity and reliability.