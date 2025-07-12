const mongoose = require('mongoose');

const adminCredentialSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  employeeId: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'admin',
    enum: ['admin', 'manager', 'supervisor']
  }
}, {
  timestamps: true
});

// Index for faster queries
adminCredentialSchema.index({ username: 1 });
adminCredentialSchema.index({ employeeId: 1 });

module.exports = mongoose.model('AdminCredential', adminCredentialSchema);