# MongoDB Atlas Setup Guide for Intern Time Tracker

This guide provides step-by-step instructions for setting up MongoDB Atlas with the specific credentials provided for the intern-time-tracker application.

## 🔑 Provided Configuration

The following MongoDB Atlas configuration has been set up:

- **Username**: `joshuamthomson1985`
- **Password**: `Bulldog2025`
- **Cluster**: `thomsoninnovations.pr5idap.mongodb.net`
- **Database**: `intern-time-tracker`
- **Application Name**: `ThomsonInnovations`

## 📁 Files Configured

### 1. Backend Environment Variables (`backend/.env`)
```env
# MongoDB Atlas Configuration
PORT=5000
MONGODB_URI=mongodb+srv://joshuamthomson1985:Bulldog2025@thomsoninnovations.pr5idap.mongodb.net/intern-time-tracker?retryWrites=true&w=majority&appName=ThomsonInnovations

# JWT Secret (change this in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Environment
NODE_ENV=development

# Connection timeout settings
MONGODB_CONNECT_TIMEOUT=10000
MONGODB_SERVER_SELECTION_TIMEOUT=10000
```

### 2. Enhanced Connection Handling
The backend server (`server.js`) has been updated with:
- ✅ Optimized connection options for MongoDB Atlas
- ✅ Comprehensive error handling and diagnostics
- ✅ Clear error messages for common connection issues
- ✅ Automatic retry mechanisms
- ✅ Connection state monitoring

### 3. Model Optimizations
Fixed duplicate index warnings in `AdminCredential.js` by removing redundant index declarations.

## 🚀 Quick Start

### Start the Application

1. **Backend Server**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Frontend Application**:
   ```bash
   # In the root directory
   npm install
   npm run dev:full  # Starts both frontend and backend
   ```

3. **Access the Application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api/health

## 🧪 Testing the Configuration

### Run the Diagnostic Tool
```bash
cd backend
node mongodb-diagnostic.js
```

This will:
- ✅ Validate all environment variables
- ✅ Check database model definitions
- ✅ Test MongoDB Atlas connectivity
- ✅ Generate alternative configurations

### Manual Connection Test
```bash
cd backend
node test-connection.js
```

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. Network Connectivity Issues
**Error**: `querySrv ETIMEOUT` or `ECONNREFUSED`

**Solutions**:
- Ensure your IP address is whitelisted in MongoDB Atlas
- Check if you're behind a corporate firewall
- Try connecting from a different network
- Verify internet connectivity

#### 2. Authentication Errors
**Error**: `Authentication failed`

**Solutions**:
- Verify username and password in `.env` file
- Check that the database user has proper permissions
- Ensure no special characters need URL encoding

#### 3. IP Whitelist Issues
**Problem**: Connection works locally but fails in production

**Solutions**:
1. Go to MongoDB Atlas dashboard
2. Navigate to "Network Access"
3. Add your server's IP address
4. For development, use `0.0.0.0/0` (allow all IPs)

## 🌍 MongoDB Atlas Dashboard Access

To manage your cluster:
1. Visit: https://cloud.mongodb.com/
2. Sign in with your MongoDB Atlas account
3. Select the "ThomsonInnovations" project
4. Manage your cluster settings

### Key Settings to Verify:
- **Database Access**: User `joshuamthomson1985` has read/write access
- **Network Access**: Your IP addresses are whitelisted
- **Cluster Status**: Cluster is running (not paused)

## 🗄️ Database Structure

The application will automatically create these collections:
- `timelogs` - Clock in/out records
- `absencelogs` - Absence reports
- `admincredentials` - Admin user accounts

## 🔒 Security Considerations

### For Production:
1. **Change Default Settings**:
   - Generate a strong JWT secret: `openssl rand -base64 32`
   - Use environment-specific database names

2. **IP Whitelisting**:
   - Remove `0.0.0.0/0` (allow all IPs)
   - Add only specific server IP addresses

3. **User Permissions**:
   - Create database-specific users
   - Use principle of least privilege

## 📊 Monitoring and Maintenance

### Health Checks
- Backend health: http://localhost:5000/api/health
- MongoDB connection status is logged on startup

### Logs to Monitor
- Connection success/failure messages
- Database operation errors
- Authentication attempts

## 🛠️ Alternative Configurations

### Local Development (if Atlas is not accessible)
Create a `backend/.env.local`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/intern-time-tracker
JWT_SECRET=development-jwt-secret
NODE_ENV=development
```

### Docker Setup (optional)
```bash
# Run local MongoDB in Docker
docker run -d --name mongodb -p 27017:27017 mongo:latest
```

## 📞 Support

If you encounter issues:

1. **Check the logs**: Look for detailed error messages in the backend console
2. **Run diagnostics**: Use `node mongodb-diagnostic.js`
3. **Verify Atlas settings**: Check Network Access and Database Access in Atlas dashboard
4. **Test connectivity**: Try connecting with MongoDB Compass using the same connection string

## 🎯 Next Steps

After successful setup:
1. Create your first admin user via the admin panel
2. Test time logging functionality
3. Verify data persistence in MongoDB Atlas
4. Set up production environment variables
5. Configure backup strategies

---

**Configuration completed**: ✅ MongoDB Atlas connection ready
**Status**: Ready for testing and deployment