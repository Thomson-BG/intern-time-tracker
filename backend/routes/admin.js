const express = require('express');
const router = express.Router();
const AdminCredential = require('../models/AdminCredential');

// Admin login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    // Find admin by username
    const admin = await AdminCredential.findOne({ username });

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // In a production environment, you should hash passwords
    // For now, we'll do a simple comparison
    if (admin.password !== password) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Return admin info without password
    const { password: _, ...adminData } = admin.toObject();
    
    res.json({
      success: true,
      data: adminData,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Error during admin login:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create new admin credential
router.post('/credentials', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      employeeId,
      username,
      password,
      role
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !employeeId || !username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: firstName, lastName, employeeId, username, and password are required'
      });
    }

    const credential = new AdminCredential({
      firstName,
      lastName,
      employeeId,
      username,
      password, // In production, hash this password
      role: role || 'admin'
    });

    const savedCredential = await credential.save();
    
    // Return credential without password
    const { password: _, ...credentialData } = savedCredential.toObject();
    
    res.status(201).json({
      success: true,
      data: credentialData,
      message: 'Admin credential created successfully'
    });
  } catch (error) {
    console.error('Error creating admin credential:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        error: `${field} already exists`
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all admin credentials (without passwords)
router.get('/credentials', async (req, res) => {
  try {
    const credentials = await AdminCredential.find({}, { password: 0 })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: credentials,
      count: credentials.length
    });
  } catch (error) {
    console.error('Error fetching admin credentials:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;