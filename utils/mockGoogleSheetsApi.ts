// Mock Google Sheets API for testing when firewall blocks Google services
// This simulates the Google Apps Script behavior for development/testing

interface MockTimeLog {
  _id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  deviceName?: string;
  action: 'IN' | 'OUT';
  timestamp: string;
  rawTimestamp: number;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  deviceId?: string;
  userAgent?: string;
  duration?: string;
}

interface MockAbsenceLog {
  _id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  deviceName?: string;
  date: string;
  reason: string;
  submitted: string;
}

class MockGoogleSheetsAPI {
  private timeLogs: MockTimeLog[] = [];
  private absenceLogs: MockAbsenceLog[] = [];
  private isEnabled: boolean = false;

  constructor() {
    console.log('🔧 Mock Google Sheets API initialized');
    console.log('📋 This simulates Google Apps Script when network connectivity is restricted');
  }

  enable() {
    this.isEnabled = true;
    console.log('✅ Mock Google Sheets API enabled - simulating working connectivity');
  }

  disable() {
    this.isEnabled = false;
    console.log('❌ Mock Google Sheets API disabled - simulating network restrictions');
  }

  async mockRequest(url: string, options: any = {}) {
    if (!this.isEnabled) {
      throw new Error('Mock API is disabled - simulating network connectivity issues');
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

    const urlObj = new URL(url);
    const type = urlObj.searchParams.get('type');
    const employeeId = urlObj.searchParams.get('employeeId');

    if (options.method === 'POST') {
      const data = JSON.parse(options.body);
      return this.handlePost(data);
    } else {
      return this.handleGet(type, employeeId);
    }
  }

  private handlePost(data: any) {
    if (data.type === 'timelog') {
      const newLog: MockTimeLog = {
        _id: `mock-${Date.now()}-${Math.random()}`,
        firstName: data.firstName,
        lastName: data.lastName,
        employeeId: data.employeeId,
        deviceName: data.deviceName || '',
        action: data.action,
        timestamp: data.timestamp,
        rawTimestamp: new Date(data.timestamp).getTime(),
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy,
        deviceId: data.deviceId,
        userAgent: data.userAgent,
        duration: this.calculateDuration(data.employeeId, data.action),
      };

      this.timeLogs.push(newLog);
      console.log('📝 Mock: Time log created', newLog);
      
      return {
        success: true,
        data: newLog,
        message: 'Time log added successfully (MOCK MODE)',
        duration: newLog.duration
      };
    } else if (data.type === 'absencelog') {
      const newLog: MockAbsenceLog = {
        _id: `mock-${Date.now()}-${Math.random()}`,
        firstName: data.firstName,
        lastName: data.lastName,
        employeeId: data.employeeId,
        deviceName: data.deviceName || '',
        date: data.date,
        reason: data.reason,
        submitted: data.submitted,
      };

      this.absenceLogs.push(newLog);
      console.log('📝 Mock: Absence log created', newLog);
      
      return {
        success: true,
        data: newLog,
        message: 'Absence log added successfully (MOCK MODE)'
      };
    }

    throw new Error('Invalid request type');
  }

  private handleGet(type: string, employeeId: string) {
    if (type === 'timelog') {
      const logs = employeeId 
        ? this.timeLogs.filter(log => log.employeeId === employeeId)
        : this.timeLogs;
      
      console.log(`🔍 Mock: Retrieved ${logs.length} time logs for employee ${employeeId || 'all'}`);
      return logs;
    } else if (type === 'absencelog') {
      const logs = employeeId 
        ? this.absenceLogs.filter(log => log.employeeId === employeeId)
        : this.absenceLogs;
      
      console.log(`🔍 Mock: Retrieved ${logs.length} absence logs for employee ${employeeId || 'all'}`);
      return logs;
    }

    return [];
  }

  private calculateDuration(employeeId: string, action: string): string {
    if (action === 'IN') return '';
    
    const employeeLogs = this.timeLogs
      .filter(log => log.employeeId === employeeId)
      .sort((a, b) => b.rawTimestamp - a.rawTimestamp);
    
    const lastCheckIn = employeeLogs.find(log => log.action === 'IN');
    if (!lastCheckIn) return '';
    
    const checkInTime = new Date(lastCheckIn.timestamp);
    const checkOutTime = new Date();
    const durationMs = checkOutTime.getTime() - checkInTime.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  }

  // Get current state for testing
  getState() {
    return {
      enabled: this.isEnabled,
      timeLogs: this.timeLogs.length,
      absenceLogs: this.absenceLogs.length,
      data: {
        timeLogs: this.timeLogs,
        absenceLogs: this.absenceLogs
      }
    };
  }

  // Clear all data (for testing)
  clear() {
    this.timeLogs = [];
    this.absenceLogs = [];
    console.log('🧹 Mock: All data cleared');
  }

  // Add sample data for testing
  addSampleData() {
    const sampleTimeLogs: MockTimeLog[] = [
      {
        _id: 'sample-1',
        firstName: 'John',
        lastName: 'Doe', 
        employeeId: 'EMP001',
        action: 'IN',
        timestamp: '7/14/2025, 8:00:00 AM',
        rawTimestamp: Date.now() - 8 * 60 * 60 * 1000,
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 10,
        deviceId: 'sample-device',
        userAgent: 'Sample User Agent'
      },
      {
        _id: 'sample-2',
        firstName: 'John',
        lastName: 'Doe',
        employeeId: 'EMP001', 
        action: 'OUT',
        timestamp: '7/14/2025, 5:00:00 PM',
        rawTimestamp: Date.now() - 1 * 60 * 60 * 1000,
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 15,
        deviceId: 'sample-device',
        userAgent: 'Sample User Agent',
        duration: '9h 0m'
      }
    ];

    const sampleAbsenceLogs: MockAbsenceLog[] = [
      {
        _id: 'absence-1',
        firstName: 'Jane',
        lastName: 'Smith',
        employeeId: 'EMP002',
        date: '2025-07-13',
        reason: 'Doctor appointment',
        submitted: '7/12/2025, 3:00:00 PM'
      }
    ];

    this.timeLogs.push(...sampleTimeLogs);
    this.absenceLogs.push(...sampleAbsenceLogs);
    
    console.log('📊 Mock: Sample data added');
    console.log(`  - ${sampleTimeLogs.length} time logs`);
    console.log(`  - ${sampleAbsenceLogs.length} absence logs`);
  }
}

// Create global instance
const mockGoogleSheetsAPI = new MockGoogleSheetsAPI();

// Expose for browser console testing
if (typeof window !== 'undefined') {
  (window as any).mockGoogleSheetsAPI = mockGoogleSheetsAPI;
  console.log('🔧 Mock Google Sheets API available as window.mockGoogleSheetsAPI');
  console.log('📋 Commands:');
  console.log('  mockGoogleSheetsAPI.enable()    - Enable mock mode');
  console.log('  mockGoogleSheetsAPI.disable()   - Disable mock mode');
  console.log('  mockGoogleSheetsAPI.addSampleData() - Add test data');
  console.log('  mockGoogleSheetsAPI.getState()  - View current state');
  console.log('  mockGoogleSheetsAPI.clear()     - Clear all data');
}

export default mockGoogleSheetsAPI;