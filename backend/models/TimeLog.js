const mongoose = require('mongoose');

const timeLogSchema = new mongoose.Schema({
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
    trim: true
  },
  deviceName: {
    type: String,
    trim: true
  },
  action: {
    type: String,
    required: true,
    enum: ['IN', 'OUT']
  },
  timestamp: {
    type: String,
    required: true
  },
  rawTimestamp: {
    type: Number,
    required: true,
    default: Date.now
  },
  latitude: {
    type: Number
  },
  longitude: {
    type: Number
  },
  accuracy: {
    type: Number
  },
  deviceId: {
    type: String
  },
  userAgent: {
    type: String
  },
  duration: {
    type: String
  }
}, {
  timestamps: true
});

// Index for faster queries
timeLogSchema.index({ employeeId: 1, rawTimestamp: -1 });
timeLogSchema.index({ action: 1, employeeId: 1 });

module.exports = mongoose.model('TimeLog', timeLogSchema);