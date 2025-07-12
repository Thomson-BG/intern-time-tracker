const mongoose = require('mongoose');

const absenceLogSchema = new mongoose.Schema({
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
  date: {
    type: String,
    required: true
  },
  absenceType: {
    type: String,
    trim: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  submitted: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
absenceLogSchema.index({ employeeId: 1, date: -1 });

module.exports = mongoose.model('AbsenceLog', absenceLogSchema);