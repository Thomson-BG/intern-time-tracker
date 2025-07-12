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
      // Get all absence logs
      const absenceLogs = await db.find('absenceLogs');
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: absenceLogs
        })
      };
    }

    if (event.httpMethod === 'POST') {
      const absenceData = JSON.parse(event.body);

      // Validate required fields
      const { firstName, lastName, employeeId, date, reason } = absenceData;
      if (!firstName || !lastName || !employeeId || !date || !reason) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Missing required fields: firstName, lastName, employeeId, date, reason'
          })
        };
      }

      // Create absence log entry
      const absenceLog = {
        firstName,
        lastName,
        employeeId,
        deviceName: absenceData.deviceName || '',
        date,
        absenceType: absenceData.absenceType || 'Other',
        reason,
        submitted: absenceData.submitted || new Date().toISOString()
      };

      const result = await db.insertOne('absenceLogs', absenceLog);

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Absence reported successfully',
          data: { 
            _id: result.insertedId,
            ...absenceLog,
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
    console.error('Absence logs error:', error);
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