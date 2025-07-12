const express = require('express');
const router = express.Router();
const AbsenceLog = require('../models/AbsenceLog');

// Get absence logs for a specific employee or all logs
router.get('/', async (req, res) => {
  try {
    const { employeeId, startDate, endDate } = req.query;
    
    let query = {};
    
    // Filter by employee ID if provided
    if (employeeId) {
      query.employeeId = employeeId;
    }
    
    // Filter by date range if provided
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = startDate;
      }
      if (endDate) {
        query.date.$lte = endDate;
      }
    }
    
    const absenceLogs = await AbsenceLog.find(query)
      .sort({ date: -1 })
      .limit(parseInt(req.query.limit) || 100);
    
    res.json({
      success: true,
      data: absenceLogs,
      count: absenceLogs.length
    });
  } catch (error) {
    console.error('Error fetching absence logs:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create a new absence log entry
router.post('/', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      employeeId,
      deviceName,
      date,
      absenceType,
      reason,
      submitted
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !employeeId || !date || !reason) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: firstName, lastName, employeeId, date, and reason are required'
      });
    }

    const absenceLog = new AbsenceLog({
      firstName,
      lastName,
      employeeId,
      deviceName,
      date,
      absenceType,
      reason,
      submitted: submitted || new Date().toLocaleString()
    });

    const savedAbsenceLog = await absenceLog.save();
    
    res.status(201).json({
      success: true,
      data: savedAbsenceLog,
      message: 'Absence logged successfully'
    });
  } catch (error) {
    console.error('Error creating absence log:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete an absence log
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedLog = await AbsenceLog.findByIdAndDelete(id);
    
    if (!deletedLog) {
      return res.status(404).json({
        success: false,
        error: 'Absence log not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Absence log deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting absence log:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;