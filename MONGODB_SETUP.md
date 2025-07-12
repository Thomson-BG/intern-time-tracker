# MongoDB Setup Instructions for Intern Time Tracker

This guide will help you set up MongoDB for the Intern Time Tracker application. The application has been migrated from Google Sheets/Appwrite to a MongoDB backend for better reliability and data consistency.

## Table of Contents
1. [MongoDB Installation Options](#mongodb-installation-options)
2. [Local MongoDB Setup](#local-mongodb-setup)
3. [MongoDB Atlas Cloud Setup](#mongodb-atlas-cloud-setup)
4. [Backend Configuration](#backend-configuration)
5. [Frontend Configuration](#frontend-configuration)
6. [Running the Application](#running-the-application)
7. [Initial Admin Setup](#initial-admin-setup)
8. [Troubleshooting](#troubleshooting)

## MongoDB Installation Options

You have two main options for running MongoDB:

### Option A: Local MongoDB Installation (Recommended for Development)
- Install MongoDB directly on your machine
- Full control over the database
- No internet required after setup
- Good for development and testing

### Option B: MongoDB Atlas (Recommended for Production)
- Cloud-hosted MongoDB service
- Free tier available
- Automatic backups and scaling
- Good for production deployments

## Local MongoDB Setup

### Windows

1. **Download MongoDB Community Server**
   - Go to https://www.mongodb.com/try/download/community
   - Select "Windows" and download the MSI installer
   - Run the installer and follow the setup wizard
   - Choose "Complete" installation
   - Install MongoDB as a Windows Service (recommended)

2. **Verify Installation**
   ```bash
   # Open Command Prompt and run:
   mongod --version
   mongo --version
   ```

3. **Start MongoDB Service**
   ```bash
   # MongoDB should start automatically as a service
   # If not, run:
   net start MongoDB
   ```

### macOS

1. **Using Homebrew (Recommended)**
   ```bash
   # Install Homebrew if you haven't already
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   
   # Install MongoDB
   brew tap mongodb/brew
   brew install mongodb-community
   ```

2. **Start MongoDB**
   ```bash
   # Start MongoDB as a service
   brew services start mongodb/brew/mongodb-community
   
   # Or run manually
   mongod --config /usr/local/etc/mongod.conf
   ```

3. **Verify Installation**
   ```bash
   mongosh --version
   ```

### Linux (Ubuntu/Debian)

1. **Import MongoDB GPG Key**
   ```bash
   curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
   ```

2. **Add MongoDB Repository**
   ```bash
   echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
   ```

3. **Install MongoDB**
   ```bash
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   ```

4. **Start MongoDB**
   ```bash
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

5. **Verify Installation**
   ```bash
   mongosh --version
   ```

## MongoDB Atlas Cloud Setup

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/atlas
   - Click "Try Free" and create an account

2. **Create a Cluster**
   - Choose "Build a Database"
   - Select "Free" tier (M0 Sandbox)
   - Choose your preferred cloud provider and region
   - Click "Create Cluster"

3. **Configure Database Access**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create a username and secure password
   - Set permissions to "Read and write to any database"
   - Click "Add User"

4. **Configure Network Access**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - For development, click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production, add only your specific IP addresses
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" and click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (it will look like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Backend Configuration

1. **Navigate to Backend Directory**
   ```bash
   cd backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   - Edit the `.env` file in the `backend` directory:

   **For Local MongoDB:**
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/intern-time-tracker
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   ```

   **For MongoDB Atlas:**
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/intern-time-tracker?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   ```

   **Important:** Replace `<username>` and `<password>` with your actual MongoDB Atlas credentials.

4. **Test Backend Connection**
   ```bash
   npm run dev
   ```
   
   You should see:
   ```
   MongoDB Connected: localhost:27017
   Server running on port 5000
   Health check: http://localhost:5000/api/health
   ```

## Frontend Configuration

1. **Navigate to Root Directory**
   ```bash
   cd .. # Go back to the main project directory
   ```

2. **Update Environment Variables**
   - Edit the `.env` file in the root directory:
   ```env
   # MongoDB Backend API Configuration
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

3. **Install Frontend Dependencies** (if not already done)
   ```bash
   npm install
   ```

## Running the Application

### Option 1: Run Both Frontend and Backend Together
```bash
# From the root directory
npm run dev:full
```

This will start:
- Backend server on http://localhost:5000
- Frontend development server on http://localhost:5173
- CSS watcher for Tailwind

### Option 2: Run Frontend and Backend Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Option 3: Production Build
```bash
# Build the frontend
npm run build

# Start backend in production mode
cd backend
npm start

# Serve frontend (optional, for testing)
npm run serve
```

## Initial Admin Setup

1. **Open the Application**
   - Go to http://localhost:5173 in your browser

2. **Create First Admin User**
   - Scroll down to the "Admin Login" section
   - Since there are no admin users yet, you'll need to create one directly in the database

3. **Using MongoDB Shell (mongosh)**
   ```bash
   # Connect to your database
   mongosh "mongodb://localhost:27017/intern-time-tracker"
   
   # Or for Atlas:
   mongosh "mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/intern-time-tracker"
   
   # Create an admin user
   db.admincredentials.insertOne({
     firstName: "Admin",
     lastName: "User",
     employeeId: "ADMIN001",
     username: "admin",
     password: "admin123",
     role: "admin",
     createdAt: new Date(),
     updatedAt: new Date()
   })
   ```

4. **Login with Initial Admin**
   - Username: `admin`
   - Password: `admin123`
   - **Important:** Change this password immediately after first login!

## Database Collections

The application creates the following MongoDB collections:

- **timelogs**: Stores clock-in/out records
- **absencelogs**: Stores absence reports
- **admincredentials**: Stores admin user accounts

## API Endpoints

The backend provides these REST API endpoints:

- `GET /api/health` - Health check
- `GET /api/time-logs` - Get time logs
- `POST /api/time-logs` - Create time log
- `GET /api/time-logs/today/:employeeId` - Get today's logs for employee
- `GET /api/absence-logs` - Get absence logs
- `POST /api/absence-logs` - Create absence log
- `DELETE /api/absence-logs/:id` - Delete absence log
- `POST /api/admin/login` - Admin login
- `POST /api/admin/credentials` - Create admin user
- `GET /api/admin/credentials` - Get all admin users

## Troubleshooting

### Backend Won't Start

1. **Check MongoDB Connection**
   ```bash
   # Test local MongoDB
   mongosh mongodb://localhost:27017
   
   # Test Atlas connection
   mongosh "your-atlas-connection-string"
   ```

2. **Check Port Availability**
   ```bash
   # Check if port 5000 is in use
   netstat -an | grep 5000
   
   # Kill process using port 5000 (if needed)
   # Windows:
   netstat -ano | findstr 5000
   taskkill /PID <process-id> /F
   
   # macOS/Linux:
   lsof -ti:5000 | xargs kill -9
   ```

### Frontend Can't Connect to Backend

1. **Verify Backend is Running**
   - Go to http://localhost:5000/api/health
   - Should return JSON with success: true

2. **Check CORS Settings**
   - The backend is configured to allow localhost:5173
   - If using a different port, update the CORS configuration in `backend/server.js`

3. **Check Environment Variables**
   - Ensure `VITE_API_BASE_URL=http://localhost:5000/api` is set in the frontend `.env`

### Database Connection Issues

1. **Local MongoDB Not Running**
   ```bash
   # Windows
   net start MongoDB
   
   # macOS
   brew services start mongodb/brew/mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

2. **Atlas Connection Issues**
   - Check your username/password in the connection string
   - Verify IP address is whitelisted (0.0.0.0/0 for development)
   - Ensure cluster is running (not paused)

3. **Firewall Issues**
   - Ensure port 27017 is open for local MongoDB
   - For Atlas, ensure port 27017 (MongoDB) and 443 (HTTPS) are open

### Common Error Messages

- **"ECONNREFUSED"**: MongoDB is not running or wrong connection string
- **"Authentication failed"**: Wrong username/password for Atlas
- **"Network is unreachable"**: Firewall or network connectivity issue
- **"Cannot connect to backend server"**: Backend is not running on port 5000

## Data Migration

If you have existing data from Google Sheets, you can migrate it to MongoDB:

1. **Export from Google Sheets to CSV**
2. **Convert CSV to JSON**
3. **Import to MongoDB using mongoimport**

Example migration script:
```bash
# Import time logs
mongoimport --db intern-time-tracker --collection timelogs --type json --jsonArray --file timelogs.json

# Import absence logs
mongoimport --db intern-time-tracker --collection absencelogs --type json --jsonArray --file absencelogs.json
```

## Security Considerations

### For Production Deployment:

1. **Change Default Admin Password**
2. **Use Strong JWT Secret** (generate with `openssl rand -base64 32`)
3. **Enable MongoDB Authentication**
4. **Use Environment Variables for Secrets**
5. **Restrict Network Access** (don't use 0.0.0.0/0 for Atlas)
6. **Enable SSL/HTTPS**
7. **Regular Database Backups**

## Backup and Restore

### Local MongoDB Backup
```bash
# Create backup
mongodump --db intern-time-tracker --out backup/

# Restore backup
mongorestore --db intern-time-tracker backup/intern-time-tracker/
```

### Atlas Backup
- MongoDB Atlas provides automatic backups
- Configure backup frequency in Atlas dashboard
- Download backups as needed

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the server logs for error messages
3. Test the database connection independently
4. Verify all environment variables are set correctly
5. Ensure all dependencies are installed (`npm install`)

The application logs will show detailed error messages to help diagnose connection and configuration issues.