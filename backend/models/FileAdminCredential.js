const fileDB = require('../fileDatabase');

class AdminCredentialModel {
  constructor() {
    this.collection = 'adminCredentials';
  }

  async find(query = {}) {
    return await fileDB.find(this.collection, query);
  }

  async findOne(query = {}) {
    return await fileDB.findOne(this.collection, query);
  }

  async create(data) {
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'employeeId', 'username', 'password'];
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`${field} is required`);
      }
    }

    // Validate role enum
    const validRoles = ['admin', 'manager', 'supervisor'];
    if (data.role && !validRoles.includes(data.role)) {
      throw new Error('Role must be admin, manager, or supervisor');
    }

    // Check for unique constraints
    const existingByUsername = await this.findOne({ username: data.username.trim() });
    if (existingByUsername) {
      throw new Error('Username already exists');
    }

    const existingByEmployeeId = await this.findOne({ employeeId: data.employeeId.trim() });
    if (existingByEmployeeId) {
      throw new Error('Employee ID already exists');
    }

    // Prepare admin data
    const adminData = {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      employeeId: data.employeeId.trim(),
      username: data.username.trim(),
      password: data.password, // Note: In production, this should be hashed
      role: data.role || 'admin'
    };

    return await fileDB.create(this.collection, adminData);
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
    const instance = new AdminCredentialModel();
    return await instance.find(query);
  }

  static async findOne(query = {}) {
    const instance = new AdminCredentialModel();
    return await instance.findOne(query);
  }

  static async create(data) {
    const instance = new AdminCredentialModel();
    return await instance.create(data);
  }

  static async updateOne(query, update) {
    const instance = new AdminCredentialModel();
    return await instance.updateOne(query, update);
  }

  static async deleteOne(query) {
    const instance = new AdminCredentialModel();
    return await instance.deleteOne(query);
  }

  static async countDocuments(query = {}) {
    const instance = new AdminCredentialModel();
    return await instance.countDocuments(query);
  }
}

module.exports = AdminCredentialModel;