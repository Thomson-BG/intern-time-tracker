const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const timeLogsRoutes = require('./routes/timeLogs');
const absenceLogsRoutes = require('./routes/absenceLogs');
const adminRoutes = require('./routes/admin');
const { generalLimiter, loginLimiter, timeLogLimiter } = require('./middleware/rateLimiter');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['http://localhost:5173', 'http://localhost:4173'] // Add your production frontend URLs here
    : ['http://localhost:5173', 'http://localhost:4173'], // Vite dev server ports
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply general rate limiting to all requests
app.use(generalLimiter);

// MongoDB connection
const connectDB = async () => {
  try {
    console.log('🚀 Starting MongoDB connection...');
    console.log('📍 Target:', process.env.MONGODB_URI.replace(/:[^:@]*@/, ':***@')); // Hide password in logs
    
    // MongoDB connection options optimized for Atlas
    const options = {
      serverSelectionTimeoutMS: parseInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT) || 10000,
      connectTimeoutMS: parseInt(process.env.MONGODB_CONNECT_TIMEOUT) || 10000,
      maxPoolSize: 10,
      minPoolSize: 1,
      maxIdleTimeMS: 30000,
      bufferCommands: false,
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    console.log(`✅ MongoDB Connected Successfully!`);
    console.log(`📍 Host: ${conn.connection.host}`);
    console.log(`🗄️  Database: ${conn.connection.name}`);
    console.log(`🔗 Connection State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    
    // Test the connection with a ping
    await mongoose.connection.db.admin().ping();
    console.log('🏓 MongoDB ping successful!');
    
    // Log available collections for debugging
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📦 Available collections: ${collections.length > 0 ? collections.map(c => c.name).join(', ') : 'None (will be created on first use)'}`);
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    
    // Provide helpful error messages for common issues
    if (error.message.includes('ETIMEOUT') || error.message.includes('querySrv')) {
      console.error('🌐 Network Error: Cannot reach MongoDB Atlas cluster.');
      console.error('💡 This is typically caused by:');
      console.error('   1. Network restrictions or firewall blocking MongoDB Atlas');
      console.error('   2. DNS resolution issues');
      console.error('   3. IP address not whitelisted in MongoDB Atlas Network Access');
      console.error('   4. Corporate network blocking external database connections');
      console.error('');
      console.error('🔧 Solutions:');
      console.error('   1. Ensure your IP is added to MongoDB Atlas Network Access (0.0.0.0/0 for development)');
      console.error('   2. Check if you\'re behind a corporate firewall');
      console.error('   3. Try connecting from a different network');
      console.error('   4. For development, use a local MongoDB instance:');
      console.error('      MONGODB_URI=mongodb://localhost:27017/intern-time-tracker');
    } else if (error.message.includes('Authentication failed')) {
      console.error('🔐 Authentication Error: Invalid credentials.');
      console.error('💡 Please verify your MongoDB Atlas username and password in the .env file');
      console.error('🔧 Check that the user has proper database permissions');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('🚫 Connection Refused: MongoDB server is not accessible.');
      console.error('💡 Ensure MongoDB is running and accessible');
    } else {
      console.error('🔍 Unexpected error. Full details:', error);
    }
    
    console.error('');
    console.error('📚 For setup help, see: MONGODB_SETUP.md');
    console.error('🔧 Run diagnostic: node mongodb-diagnostic.js');
    
    process.exit(1);
  }
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes with specific rate limiting
app.use('/api/admin/login', loginLimiter);
app.use('/api/time-logs', timeLogLimiter);

// Route definitions
app.use('/api/time-logs', timeLogsRoutes);
app.use('/api/absence-logs', absenceLogsRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  res.status(error.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer();