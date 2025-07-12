const express = require('express');
const router = express.Router();
const AdminCredential = require('../models/FileAdminCredential');

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
    const { password: _, ...adminData } = admin;
    
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

    const credentialData = {
      firstName,
      lastName,
      employeeId,
      username,
      password, // In production, hash this password
      role: role || 'admin'
    };

    const savedCredential = await AdminCredential.create(credentialData);
    
    // Return credential without password
    const { password: _, ...credentialDataResponse } = savedCredential;
    
    res.status(201).json({
      success: true,
      data: credentialDataResponse,
      message: 'Admin credential created successfully'
    });
  } catch (error) {
    console.error('Error creating admin credential:', error);
    
    // Handle duplicate errors
    if (error.message.includes('already exists')) {
      return res.status(400).json({
        success: false,
        error: error.message
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
    const credentials = await AdminCredential.find({});
    
    // Remove passwords from response
    const safeCredentials = credentials.map(cred => {
      const { password, ...safeCred } = cred;
      return safeCred;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
      success: true,
      data: safeCredentials,
      count: safeCredentials.length
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