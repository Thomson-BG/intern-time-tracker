# SBRA - School Bus Reporting Application

## Overview

SBRA (School Bus Reporting Application) is a modern, dark-themed time tracking and absence management system designed specifically for high school student interns. Built with React, TypeScript, Tailwind CSS, and MongoDB, it features a sleek glass morphism design with comprehensive functionality for professional time management.

## 🚀 Recent Updates - MongoDB Migration

**The application has been fully migrated from Google Sheets/Appwrite to MongoDB for better reliability and data consistency.**

### What's New:
- ✅ **MongoDB Backend**: Robust database with proper indexing and relationships
- ✅ **Express.js API**: RESTful API endpoints for all operations
- ✅ **Improved Performance**: Faster data operations and better scalability
- ✅ **Better Error Handling**: Comprehensive error management and validation
- ✅ **Admin Management**: Built-in admin user creation and management
- ✅ **Data Security**: Rate limiting, input validation, and secure practices

## Features

### ✨ Core Functionality
- **Time Tracking**: Clock in/out with GPS location verification
- **Absence Reporting**: Submit and track absence requests with detailed categorization
- **Digital Timesheet**: View, filter, and download timesheet records as PDF
- **Admin Panel**: Comprehensive management tools for supervisors
- **Real-time Status**: Live feedback and status updates
- **MongoDB Integration**: Reliable data storage with automatic backups

### 🎨 Design & User Experience
- **Dark Theme**: Professional black background with glass morphism effects
- **Student-Focused**: Age-appropriate language and intuitive interface
- **Mobile-First**: Responsive design optimized for phones and tablets
- **Accessibility**: High contrast ratios and keyboard navigation
- **Interactive Onboarding**: Helpful tooltips and guidance for first-time users

### 📚 Student Support
- **Help Center**: Comprehensive FAQ section with student-specific guidance
- **Feature Suggestions**: Research-based recommendations for future enhancements
- **Onboarding Tooltips**: Interactive guidance for new users
- **Professional Language**: Workplace-appropriate terminology to prepare students

### 🔧 Technical Features
- **MongoDB Database**: Scalable and reliable data storage
- **Express.js Backend**: RESTful API with proper error handling
- **Location Services**: GPS verification for attendance accuracy
- **Data Validation**: Comprehensive input validation and error handling
- **Performance Optimized**: Fast loading and smooth animations
- **Rate Limiting**: Protection against abuse and excessive requests

## Architecture

### Technology Stack
- **Frontend**: React 18+ with TypeScript
- **Backend**: Node.js with Express.js
- **Database**: MongoDB (local or MongoDB Atlas)
- **Styling**: Tailwind CSS with custom glass morphism effects
- **Icons**: Font Awesome 6
- **PDF Generation**: jsPDF with AutoTable
- **Build Tool**: Vite

### Project Structure
```
├── src/                  # React frontend
│   ├── components/       # React components
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript definitions
│   └── App.tsx          # Main application component
├── backend/             # Node.js/Express backend
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API route handlers
│   ├── middleware/      # Express middleware
│   └── server.js        # Backend entry point
├── components/          # Legacy components (being phased out)
├── utils/              # Legacy utilities (being phased out)
└── MONGODB_SETUP.md    # Detailed MongoDB setup guide
```

## Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn package manager
- MongoDB (local installation or MongoDB Atlas account)

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd intern-time-tracker
   ```

2. **Install dependencies:**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   cd ..
   ```

3. **Set up MongoDB:**
   
   **For detailed MongoDB setup instructions, see [MONGODB_SETUP.md](./MONGODB_SETUP.md)**
   
   **Quick setup for local development:**
   ```bash
   # Install MongoDB locally (see MONGODB_SETUP.md for detailed instructions)
   # Or create a free MongoDB Atlas cluster
   ```

4. **Configure environment variables:**
   
   **Backend (.env in backend directory):**
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/intern-time-tracker
   JWT_SECRET=your-super-secret-jwt-key
   NODE_ENV=development
   ```
   
   **Frontend (.env in root directory):**
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

5. **Start the application:**
   ```bash
   # Option 1: Run both frontend and backend together
   npm run dev:full
   
   # Option 2: Run separately (use two terminals)
   # Terminal 1 - Backend:
   cd backend && npm run dev
   
   # Terminal 2 - Frontend:
   npm run dev
   ```

6. **Create initial admin user:**
   ```bash
   # Connect to MongoDB and create admin user
   mongosh mongodb://localhost:27017/intern-time-tracker
   
   db.admincredentials.insertOne({
     firstName: "Admin",
     lastName: "User", 
     employeeId: "ADMIN001",
     username: "admin",
     password: "admin123",
     role: "admin",
     createdAt: new Date()
   })
   ```

7. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api/health
   - Login with username: `admin`, password: `admin123`

### Available Scripts

#### Frontend Scripts
- `npm run dev` - Start frontend development server with CSS watcher
- `npm run dev:full` - Start both frontend and backend together
- `npm run build` - Build optimized production bundle
- `npm run serve` - Preview production build

#### Backend Scripts  
- `npm run dev:backend` - Start backend development server
- `cd backend && npm run dev` - Start backend with auto-reload
- `cd backend && npm start` - Start backend in production mode

## MongoDB Setup

For detailed MongoDB installation and configuration instructions, see **[MONGODB_SETUP.md](./MONGODB_SETUP.md)**.

The setup guide covers:
- Local MongoDB installation (Windows, macOS, Linux)
- MongoDB Atlas cloud setup
- Database configuration
- Initial admin user creation
- Troubleshooting common issues

## API Documentation

The backend provides RESTful API endpoints:

### Time Logs
- `GET /api/time-logs` - Get time logs with optional filters
- `POST /api/time-logs` - Create new time log entry
- `GET /api/time-logs/today/:employeeId` - Get today's logs for employee

### Absence Logs
- `GET /api/absence-logs` - Get absence logs with optional filters  
- `POST /api/absence-logs` - Create new absence log entry
- `DELETE /api/absence-logs/:id` - Delete absence log

### Admin
- `POST /api/admin/login` - Admin authentication
- `POST /api/admin/credentials` - Create new admin user
- `GET /api/admin/credentials` - Get all admin users

### Health Check
- `GET /api/health` - Backend health check

## Usage Guide

### For Students
1. **First Time Setup**: Fill in your personal information (name, employee ID)
2. **Clock In**: Click "CHECK IN" when you arrive at your work location
3. **Clock Out**: Click "CHECK OUT" when you finish your shift
4. **Report Absences**: Use the "Report Absence" tab for sick days or time off
5. **View Records**: Check your timesheet and download PDF reports
6. **Get Help**: Visit the "Student Help" tab for FAQs and guidance

### For Administrators
1. **Login**: Use admin credentials to access management features
2. **View Reports**: Monitor all student time logs and absences
3. **Download Data**: Export comprehensive reports in multiple formats
4. **Manage Users**: Create new admin accounts and view system statistics

## Security & Privacy

- **Database Security**: MongoDB with proper indexing and validation
- **API Security**: Rate limiting, input validation, and error handling
- **Location Data**: Used only for attendance verification, stored securely
- **Data Encryption**: All sensitive data is encrypted in transit
- **Access Control**: Role-based permissions for students vs. administrators
- **Privacy Compliance**: Designed with student privacy regulations in mind

## Deployment

### Development
```bash
npm run dev:full
```

### Production
```bash
# Build frontend
npm run build

# Start backend
cd backend && npm start

# Serve frontend (optional)
npm run serve
```

For production deployment, consider:
- Using PM2 for backend process management
- Setting up MongoDB Atlas for cloud database
- Configuring reverse proxy (nginx)
- Enabling HTTPS
- Setting up automated backups

## Migration from Legacy Systems

If you're migrating from the previous Google Sheets or Appwrite setup:

1. **Export existing data** from your current system
2. **Follow the MongoDB setup guide** in [MONGODB_SETUP.md](./MONGODB_SETUP.md)
3. **Import data** using MongoDB tools (mongoimport)
4. **Update environment variables** to point to the new MongoDB backend
5. **Test the migration** with a few sample entries

## Feature Roadmap

### High Priority
- QR Code check-in for contactless operation
- Offline functionality for poor connectivity areas
- Advanced analytics dashboard
- Automated report generation

### Medium Priority
- Achievement badges for student engagement
- Weather alerts integration
- Voice command support
- Schedule calendar integration

### Future Enhancements
- Progressive Web App (PWA) installation
- Multi-language support (Spanish, etc.)
- Mobile app (React Native)
- Integration with school management systems

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

This project follows modern web development best practices:
- TypeScript for type safety
- Component-based architecture
- Responsive design principles
- Accessibility standards (WCAG 2.1)
- Performance optimization
- RESTful API design
- Database best practices

## Troubleshooting

### Common Issues

1. **Backend won't start**: Check MongoDB connection and port availability
2. **Frontend can't connect**: Verify backend is running and environment variables are set
3. **Database errors**: Ensure MongoDB is running and accessible
4. **Build failures**: Clear node_modules and reinstall dependencies

For detailed troubleshooting, see [MONGODB_SETUP.md](./MONGODB_SETUP.md).

## License

This project is designed for educational use in school transportation management.

## Support

For technical issues or feature requests:
1. Check the [MongoDB Setup Guide](./MONGODB_SETUP.md)
2. Review the troubleshooting section
3. Check backend logs for error messages
4. Verify all environment variables are configured correctly
