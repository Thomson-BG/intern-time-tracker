const express = require('express');
const router = express.Router();
const TimeLog = require('../models/FileTimeLog');

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
    
    let timeLogs = await TimeLog.find(query);
    
    // Filter by date range if provided (done in memory for file DB)
    if (startDate || endDate) {
      timeLogs = timeLogs.filter(log => {
        if (startDate && log.rawTimestamp < new Date(startDate).getTime()) {
          return false;
        }
        if (endDate && log.rawTimestamp > new Date(endDate).getTime()) {
          return false;
        }
        return true;
      });
    }
    
    // Sort by rawTimestamp descending and limit
    timeLogs.sort((a, b) => b.rawTimestamp - a.rawTimestamp);
    const limit = parseInt(req.query.limit) || 100;
    timeLogs = timeLogs.slice(0, limit);
    
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
      
      const allLogs = await TimeLog.find({
        employeeId,
        action: 'IN'
      });
      
      // Find last check-in for today
      const todayCheckIns = allLogs.filter(log => log.rawTimestamp >= todayStart.getTime());
      const lastCheckIn = todayCheckIns.sort((a, b) => b.rawTimestamp - a.rawTimestamp)[0];

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

    const timeLogData = {
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
    };

    const savedTimeLog = await TimeLog.create(timeLogData);
    
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
    
    const allLogs = await TimeLog.find({ employeeId });
    
    const todayLogs = allLogs.filter(log => 
      log.rawTimestamp >= todayStart.getTime() && 
      log.rawTimestamp <= todayEnd.getTime()
    ).sort((a, b) => a.rawTimestamp - b.rawTimestamp);
    
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