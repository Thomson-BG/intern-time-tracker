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

  try {
    await db.connect();

    if (event.httpMethod === 'GET') {
      // Get all time logs
      const timeLogs = await db.find('timeLogs');
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: timeLogs
        })
      };
    }

    if (event.httpMethod === 'POST') {
      const timeLogData = JSON.parse(event.body);

      // Validate required fields
      const { firstName, lastName, employeeId, action } = timeLogData;
      if (!firstName || !lastName || !employeeId || !action) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Missing required fields: firstName, lastName, employeeId, action'
          })
        };
      }

      if (!['IN', 'OUT'].includes(action)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Action must be either IN or OUT'
          })
        };
      }

      // Create time log entry
      const timeLog = {
        firstName,
        lastName,
        employeeId,
        deviceName: timeLogData.deviceName || '',
        action,
        timestamp: timeLogData.timestamp || new Date().toISOString(),
        rawTimestamp: timeLogData.rawTimestamp || Date.now(),
        latitude: timeLogData.latitude,
        longitude: timeLogData.longitude,
        accuracy: timeLogData.accuracy,
        deviceId: timeLogData.deviceId,
        userAgent: timeLogData.userAgent,
        duration: timeLogData.duration || ''
      };

      const result = await db.insertOne('timeLogs', timeLog);

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          success: true,
          message: `${action === 'IN' ? 'Check-in' : 'Check-out'} recorded successfully`,
          data: { 
            _id: result.insertedId,
            ...timeLog,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };

  } catch (error) {
    console.error('Time logs error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: error.message
      })
    };
  }
};