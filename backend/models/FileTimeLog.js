const fileDB = require('../fileDatabase');

class TimeLogModel {
  constructor() {
    this.collection = 'timeLogs';
  }

  async find(query = {}) {
    return await fileDB.find(this.collection, query);
  }

  async findOne(query = {}) {
    return await fileDB.findOne(this.collection, query);
  }

  async create(data) {
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'employeeId', 'action', 'timestamp'];
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`${field} is required`);
      }
    }

    // Validate action enum
    if (!['IN', 'OUT'].includes(data.action)) {
      throw new Error('Action must be either IN or OUT');
    }

    // Add default values
    const timeLogData = {
      ...data,
      rawTimestamp: data.rawTimestamp || Date.now(),
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      employeeId: data.employeeId.trim(),
      deviceName: data.deviceName ? data.deviceName.trim() : undefined
    };

    return await fileDB.create(this.collection, timeLogData);
  }

  async updateOne(query, update) {
    return await fileDB.updateOne(this.collection, query, update);
  }

  async deleteOne(query) {
    return await fileDB.deleteOne(this.collection, query);
  }

  async countDocuments(query = {}) {
    return await fileDB.count(this.collection, query);
  }

  // Static method to maintain compatibility
  static async find(query = {}) {
    const instance = new TimeLogModel();
    return await instance.find(query);
  }

  static async findOne(query = {}) {
    const instance = new TimeLogModel();
    return await instance.findOne(query);
  }

  static async create(data) {
    const instance = new TimeLogModel();
    return await instance.create(data);
  }

  static async updateOne(query, update) {
    const instance = new TimeLogModel();
    return await instance.updateOne(query, update);
  }

  static async deleteOne(query) {
    const instance = new TimeLogModel();
    return await instance.deleteOne(query);
  }

  static async countDocuments(query = {}) {
    const instance = new TimeLogModel();
    return await instance.countDocuments(query);
  }
}

module.exports = TimeLogModel;