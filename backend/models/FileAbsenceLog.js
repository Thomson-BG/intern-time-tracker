const fileDB = require('../fileDatabase');

class AbsenceLogModel {
  constructor() {
    this.collection = 'absenceLogs';
  }

  async find(query = {}) {
    return await fileDB.find(this.collection, query);
  }

  async findOne(query = {}) {
    return await fileDB.findOne(this.collection, query);
  }

  async create(data) {
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'employeeId', 'date', 'reason', 'submitted'];
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`${field} is required`);
      }
    }

    // Prepare absence log data
    const absenceData = {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      employeeId: data.employeeId.trim(),
      deviceName: data.deviceName ? data.deviceName.trim() : undefined,
      date: data.date,
      absenceType: data.absenceType ? data.absenceType.trim() : undefined,
      reason: data.reason.trim(),
      submitted: data.submitted
    };

    return await fileDB.create(this.collection, absenceData);
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

  // Static methods to maintain compatibility
  static async find(query = {}) {
    const instance = new AbsenceLogModel();
    return await instance.find(query);
  }

  static async findOne(query = {}) {
    const instance = new AbsenceLogModel();
    return await instance.findOne(query);
  }

  static async create(data) {
    const instance = new AbsenceLogModel();
    return await instance.create(data);
  }

  static async updateOne(query, update) {
    const instance = new AbsenceLogModel();
    return await instance.updateOne(query, update);
  }

  static async deleteOne(query) {
    const instance = new AbsenceLogModel();
    return await instance.deleteOne(query);
  }

  static async countDocuments(query = {}) {
    const instance = new AbsenceLogModel();
    return await instance.countDocuments(query);
  }
}

module.exports = AbsenceLogModel;