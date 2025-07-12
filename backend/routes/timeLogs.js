const express = require('express');
const router = express.Router();
const TimeLog = require('../models/TimeLog');

// Get time logs for a specific employee or all logs
router.get('/', async (req, res) => {
  try {
    const { employeeId, startDate, endDate, action } = req.query;
    
    let query = {};
    
    // Filter by employee ID if provided
    if (employeeId) {
      query.employeeId = employeeId;
    }
    
    // Filter by action (IN/OUT) if provided
    if (action) {
      query.action = action;
    }
    
    // Filter by date range if provided
    if (startDate || endDate) {
      query.rawTimestamp = {};
      if (startDate) {
        query.rawTimestamp.$gte = new Date(startDate).getTime();
      }
      if (endDate) {
        query.rawTimestamp.$lte = new Date(endDate).getTime();
      }
    }
    
    const timeLogs = await TimeLog.find(query)
      .sort({ rawTimestamp: -1 })
      .limit(parseInt(req.query.limit) || 100);
    
    res.json({
      success: true,
      data: timeLogs,
      count: timeLogs.length
    });
  } catch (error) {
    console.error('Error fetching time logs:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create a new time log entry
router.post('/', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      employeeId,
      deviceName,
      action,
      timestamp,
      rawTimestamp,
      latitude,
      longitude,
      accuracy,
      deviceId,
      userAgent
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !employeeId || !action) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: firstName, lastName, employeeId, and action are required'
      });
    }

    // Calculate duration if this is a CHECK OUT
    let duration = undefined;
    if (action === 'OUT') {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const lastCheckIn = await TimeLog.findOne({
        employeeId,
        action: 'IN',
        rawTimestamp: { $gte: todayStart.getTime() }
      }).sort({ rawTimestamp: -1 });

      if (lastCheckIn) {
        const currentTime = rawTimestamp || Date.now();
        const diffMs = currentTime - lastCheckIn.rawTimestamp;
        if (diffMs > 0) {
          const totalMinutes = Math.floor(diffMs / 60000);
          const hours = Math.floor(totalMinutes / 60);
          const minutes = totalMinutes % 60;
          duration = `${hours} hours, ${minutes} minutes`;
        }
      }
    }

    const timeLog = new TimeLog({
      firstName,
      lastName,
      employeeId,
      deviceName,
      action,
      timestamp: timestamp || new Date().toLocaleString(),
      rawTimestamp: rawTimestamp || Date.now(),
      latitude,
      longitude,
      accuracy,
      deviceId,
      userAgent,
      duration
    });

    const savedTimeLog = await timeLog.save();
    
    res.status(201).json({
      success: true,
      data: savedTimeLog,
      message: `Successfully clocked ${action}`
    });
  } catch (error) {
    console.error('Error creating time log:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get time logs for today for a specific employee
router.get('/today/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    
    const todayLogs = await TimeLog.find({
      employeeId,
      rawTimestamp: {
        $gte: todayStart.getTime(),
        $lte: todayEnd.getTime()
      }
    }).sort({ rawTimestamp: 1 });
    
    res.json({
      success: true,
      data: todayLogs,
      count: todayLogs.length
    });
  } catch (error) {
    console.error('Error fetching today\'s logs:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;