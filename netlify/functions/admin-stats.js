const db = require('./netlify-database');

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    await db.connect();

    // Get all time logs and absence logs
    const timeLogs = await db.find('timeLogs');
    const absenceLogs = await db.find('absenceLogs');

    // Calculate statistics
    const uniqueStudents = new Set();
    let checkIns = 0;
    let checkOuts = 0;
    let totalMinutes = 0;

    timeLogs.forEach(log => {
      uniqueStudents.add(log.employeeId);
      if (log.action === 'IN') {
        checkIns++;
      } else if (log.action === 'OUT') {
        checkOuts++;
      }
    });

    // Calculate total hours (simplified calculation)
    // In a real app, you'd pair IN/OUT logs to calculate exact durations
    const totalHours = Math.floor(timeLogs.length / 2); // Rough estimate

    const stats = {
      students: uniqueStudents.size,
      checkIns,
      checkOuts,
      absences: absenceLogs.length,
      totalHours,
      totalTimeLogs: timeLogs.length,
      totalAbsenceLogs: absenceLogs.length
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: stats
      })
    };

  } catch (error) {
    console.error('Admin stats error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Failed to get statistics',
        error: error.message
      })
    };
  }
};