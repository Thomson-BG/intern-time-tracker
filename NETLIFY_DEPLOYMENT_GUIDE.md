# Netlify Deployment Guide

This guide explains how to deploy the Intern Time Tracker application on Netlify for **FREE** with both frontend and backend functionality.

## 🚀 Quick Deploy

### Option 1: Direct GitHub Integration (Recommended)

1. **Create Netlify Account**
   - Go to [netlify.com](https://netlify.com)
   - Sign up with GitHub account (free)

2. **Deploy from GitHub**
   - Click "New site from Git"
   - Connect your GitHub account
   - Select the `intern-time-tracker` repository
   - Netlify will auto-detect the configuration from `netlify.toml`

3. **Automatic Deployment**
   - Build command: `npm run build` (automatically detected)
   - Publish directory: `dist` (automatically detected)
   - Functions directory: `netlify/functions` (automatically detected)

### Option 2: Manual Deploy

1. **Build the project**
   ```bash
   npm install
   npm run build
   ```

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop the `dist` folder
   - Upload the `netlify` folder for serverless functions

## 🔧 Configuration Details

### Netlify Configuration (`netlify.toml`)
```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[functions]
  directory = "netlify/functions"
```

### Environment Variables
The application automatically uses the correct API endpoints:
- **Development**: `http://localhost:5000/api` (Express.js backend)
- **Production**: `/api` (Netlify functions)

## 📡 API Endpoints (Netlify Functions)

### Available Functions
- `/.netlify/functions/health` → `/api/health`
- `/.netlify/functions/admin-login` → `/api/admin-login`
- `/.netlify/functions/time-logs` → `/api/time-logs`
- `/.netlify/functions/absence-logs` → `/api/absence-logs`
- `/.netlify/functions/admin-stats` → `/api/admin-stats`

### Function Details

#### Health Check
```
GET /api/health
Response: { success: true, message: "Server is running", database: "Connected" }
```

#### Admin Login
```
POST /api/admin-login
Body: { "username": "admin", "password": "admin123" }
Response: { success: true, admin: {...}, token: "..." }
```

#### Time Logs
```
GET /api/time-logs - Get all time logs
POST /api/time-logs - Create new time log
Body: { firstName, lastName, employeeId, action: "IN"|"OUT", ... }
```

#### Absence Logs
```
GET /api/absence-logs - Get all absence logs
POST /api/absence-logs - Create new absence log
Body: { firstName, lastName, employeeId, date, reason, ... }
```

## 💾 Database System

### File-Based Database
- **Type**: JSON file storage in `/tmp` directory
- **Persistence**: Functions are stateless, data resets on cold starts
- **Development**: Perfect for testing and demonstration
- **Collections**: `timeLogs.json`, `absenceLogs.json`, `adminCredentials.json`

### Default Admin Account
- **Username**: `admin`
- **Password**: `admin123`
- **Auto-created**: On first function execution

## 🧪 Testing the Deployment

### 1. Test Health Check
```bash
curl https://your-app.netlify.app/api/health
```

### 2. Test Admin Login
```bash
curl -X POST https://your-app.netlify.app/api/admin-login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 3. Test Time Log Creation
```bash
curl -X POST https://your-app.netlify.app/api/time-logs \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe", 
    "employeeId": "EMP001",
    "action": "IN"
  }'
```

## 🔧 Local Development with Netlify

### Setup Netlify CLI
```bash
npm install -g netlify-cli
netlify dev
```

This runs:
- Frontend on `http://localhost:8888`
- Netlify functions locally
- Simulates production environment

### Traditional Development
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend  
npm run dev
```

## 🌐 Production Deployment Steps

### 1. Deploy to Netlify
- Push code to GitHub
- Netlify auto-deploys from main branch
- Or manually deploy via Netlify dashboard

### 2. Get Your URL
- Netlify provides: `https://random-name.netlify.app`
- Custom domain: Configure in Netlify dashboard

### 3. Test Full Application
- Visit your Netlify URL
- Test admin login (admin/admin123)
- Test time tracking functionality
- Test absence reporting

## 🆓 Why Netlify?

### Advantages
✅ **Completely Free** for this use case  
✅ **Single Deployment** handles frontend + backend  
✅ **Automatic HTTPS** and CDN  
✅ **GitHub Integration** for continuous deployment  
✅ **Serverless Functions** replace Express.js backend  
✅ **No Database Costs** with file-based storage  

### Limitations
⚠️ **Function Timeout**: 10 seconds max execution time  
⚠️ **Storage**: Files reset on cold starts (demo use)  
⚠️ **Concurrent Users**: 1000 requests/hour on free tier  

## 🔒 Security Notes

### Production Considerations
- Change default admin password
- Implement proper authentication (JWT)
- Add input validation
- Consider database upgrade for persistence

### Current Security
- CORS configured for all origins
- Basic input validation
- Rate limiting in original Express.js (not in functions)

## 🚀 Alternative Deployment Options

### Other Free Platforms
1. **Vercel** - Similar to Netlify, great for frontend
2. **Railway** - Good for full-stack apps with databases  
3. **Render** - Free tier with persistent storage
4. **Heroku** - Limited free tier
5. **Firebase** - Google's platform with Firestore

### Recommendation
**Netlify is the best choice** for this application because:
- Zero configuration needed
- Both frontend and backend in one deployment
- Reliable free tier
- Great developer experience

## 📞 Support

If you encounter issues:
1. Check Netlify function logs in dashboard
2. Test API endpoints individually
3. Verify build process completed successfully
4. Check browser console for frontend errors

The deployment provides a production-ready application that works identically to the local development environment.