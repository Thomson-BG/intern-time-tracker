# ITS - Intern Tracking Systems

A comprehensive time and absence tracking application for high school interns, featuring both traditional Express.js backend and modern Netlify serverless deployment options.

## 🚀 Quick Deploy Options

### Option 1: Netlify (Recommended - Completely Free)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Thomson-BG/intern-time-tracker)

- **Zero Configuration**: Automatic setup from `netlify.toml`
- **Free Hosting**: Frontend + Backend serverless functions
- **Instant Deployment**: GitHub integration for continuous deployment

[📖 Complete Netlify Deployment Guide](./NETLIFY_DEPLOYMENT_GUIDE.md)

### Option 2: Traditional Local Development
```bash
# Terminal 1: Backend
cd backend && npm install && npm start

# Terminal 2: Frontend  
npm install && npm run dev
```

## 🎯 Features

### Core Functionality
- ⏰ **Time Tracking**: Check-in/check-out with geolocation
- 📅 **Absence Reporting**: Submit absence requests with reasons  
- 👨‍💼 **Admin Dashboard**: Complete administrative interface
- 📊 **Statistics**: Real-time tracking metrics
- 📄 **Data Export**: PDF, CSV, and HTML reports

### Technical Features
- 🌐 **Dual Deployment**: Express.js OR Netlify serverless
- 📱 **Mobile Responsive**: Mobile-first design
- 🔒 **Authentication**: Admin login system
- 💾 **File Database**: Zero-cost storage solution
- 🎨 **Modern UI**: Dark theme with glass morphism

## 📋 Default Admin Credentials

```
Username: admin
Password: admin123
```

## 🛠️ Technology Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Leaflet** for maps

### Backend Options
1. **Express.js** (Traditional)
   - File-based JSON database
   - RESTful API endpoints
   - CORS and security middleware

2. **Netlify Functions** (Serverless)
   - Zero-config deployment
   - Automatic scaling
   - Built-in HTTPS

## 📁 Project Structure

```
intern-time-tracker/
├── src/                    # React frontend source
├── components/            # React components
├── utils/                 # API services and utilities
├── backend/              # Express.js server (optional)
├── netlify/functions/    # Serverless functions for Netlify
├── netlify.toml          # Netlify configuration
└── NETLIFY_DEPLOYMENT_GUIDE.md
```

## 🔧 Environment Configuration

The application automatically detects the deployment environment:

- **Development**: Uses `http://localhost:5000/api`
- **Production**: Uses relative URLs (`/api`)

## 📊 API Endpoints

### Health & Status
- `GET /api/health` - System health check

### Authentication  
- `POST /api/admin-login` - Admin authentication

### Time Tracking
- `GET /api/time-logs` - Retrieve time logs
- `POST /api/time-logs` - Create time entries

### Absence Management
- `GET /api/absence-logs` - Retrieve absence logs  
- `POST /api/absence-logs` - Submit absence requests

## 🧪 Testing

### Test Health Endpoint
```bash
curl https://your-app.netlify.app/api/health
```

### Test Admin Login
```bash
curl -X POST https://your-app.netlify.app/api/admin-login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## 🌟 Deployment Comparison

| Feature | Express.js Local | Netlify Serverless |
|---------|------------------|-------------------|
| Cost | Free | Free |
| Setup Complexity | Medium | Zero-config |
| Scaling | Manual | Automatic |
| Database | File-based | File-based |
| HTTPS | Manual | Automatic |
| Domain | localhost | Custom available |
| Deployment | Manual | GitHub integration |

## 📚 Documentation

- [📖 Netlify Deployment Guide](./NETLIFY_DEPLOYMENT_GUIDE.md) - Complete deployment instructions
- [📄 File Database Documentation](./FILE_DATABASE_DOCUMENTATION.md) - Database system details

## 🆓 Why This Setup?

This application is designed to be **completely free** to deploy and use:

✅ **No External Database Costs** - File-based storage  
✅ **No Server Costs** - Netlify free tier  
✅ **No Domain Costs** - Netlify provides subdomain  
✅ **No Maintenance** - Serverless auto-scaling  

Perfect for schools, small organizations, or demonstration purposes.

## 🔮 Future Enhancements

- Persistent database integration (MongoDB, PostgreSQL)
- Advanced reporting and analytics
- Multi-organization support
- Mobile app versions
- Real-time notifications

## 📞 Support

For deployment issues or questions:
1. Check the [Netlify Deployment Guide](./NETLIFY_DEPLOYMENT_GUIDE.md)
2. Review function logs in Netlify dashboard
3. Test API endpoints individually
4. Check browser developer console

## 📄 License

This project is open source and available under the MIT License.