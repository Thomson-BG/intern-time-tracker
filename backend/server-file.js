const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const fileDB = require('./fileDatabase');
const timeLogsRoutes = require('./routes/fileTimeLogs');
const absenceLogsRoutes = require('./routes/fileAbsenceLogs');
const adminRoutes = require('./routes/fileAdmin');
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

// File Database connection
const connectDB = async () => {
  try {
    await fileDB.connect();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const isConnected = await fileDB.ping();
    res.json({
      success: true,
      message: 'Server is running',
      database: isConnected ? 'Connected' : 'Disconnected',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      databaseType: 'File-based JSON Database'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      message: error.message
    });
  }
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
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️  Database: File-based JSON Database`);
    console.log(`📂 Database path: ./database/`);
    console.log(`🔑 Default admin: admin/admin123`);
  });
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await fileDB.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await fileDB.disconnect();
  process.exit(0);
});

startServer();