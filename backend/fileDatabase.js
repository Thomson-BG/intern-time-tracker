const fs = require('fs').promises;
const path = require('path');

class FileDatabase {
  constructor() {
    this.databasePath = path.join(__dirname, 'database');
    this.collections = {
      timeLogs: path.join(this.databasePath, 'timeLogs.json'),
      absenceLogs: path.join(this.databasePath, 'absenceLogs.json'),
      adminCredentials: path.join(this.databasePath, 'adminCredentials.json')
    };
    this.connected = false;
  }

  async ensureDirectoryExists() {
    try {
      await fs.access(this.databasePath);
    } catch {
      await fs.mkdir(this.databasePath, { recursive: true });
    }
  }

  async ensureFileExists(filePath, defaultData = []) {
    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2));
    }
  }

  async connect() {
    try {
      console.log('🚀 Starting File Database connection...');
      await this.ensureDirectoryExists();
      
      // Initialize collection files
      await this.ensureFileExists(this.collections.timeLogs, []);
      await this.ensureFileExists(this.collections.absenceLogs, []);
      
      // Initialize admin credentials with default admin user
      const defaultAdmin = [{
        _id: this.generateId(),
        firstName: 'Admin',
        lastName: 'User',
        employeeId: 'ADMIN001',
        username: 'admin',
        password: 'admin123', // Note: In production, this should be hashed
        role: 'admin',
        createdAt: new Date().toISOString()
      }];
      await this.ensureFileExists(this.collections.adminCredentials, defaultAdmin);
      
      this.connected = true;
      console.log('✅ File Database Connected Successfully!');
      console.log(`📍 Database Path: ${this.databasePath}`);
      console.log('📦 Collections initialized: timeLogs, absenceLogs, adminCredentials');
      console.log('🔑 Default admin user created: admin/admin123');
      
      return true;
    } catch (error) {
      console.error('❌ File Database connection error:', error.message);
      throw error;
    }
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  async readCollection(collection) {
    try {
      const data = await fs.readFile(this.collections[collection], 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading collection ${collection}:`, error.message);
      return [];
    }
  }

  async writeCollection(collection, data) {
    try {
      await fs.writeFile(this.collections[collection], JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`Error writing collection ${collection}:`, error.message);
      throw error;
    }
  }

  // MongoDB-compatible methods
  async find(collection, query = {}) {
    const data = await this.readCollection(collection);
    
    if (Object.keys(query).length === 0) {
      return data;
    }

    return data.filter(item => {
      return Object.keys(query).every(key => {
        if (key === '_id' && typeof query[key] === 'object' && query[key].$eq) {
          return item[key] === query[key].$eq;
        }
        return item[key] === query[key];
      });
    });
  }

  async findOne(collection, query = {}) {
    const results = await this.find(collection, query);
    return results.length > 0 ? results[0] : null;
  }

  async create(collection, document) {
    const data = await this.readCollection(collection);
    const newDocument = {
      _id: this.generateId(),
      ...document,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    data.push(newDocument);
    await this.writeCollection(collection, data);
    return newDocument;
  }

  async updateOne(collection, query, update) {
    const data = await this.readCollection(collection);
    const index = data.findIndex(item => {
      return Object.keys(query).every(key => item[key] === query[key]);
    });

    if (index !== -1) {
      data[index] = {
        ...data[index],
        ...update,
        updatedAt: new Date().toISOString()
      };
      await this.writeCollection(collection, data);
      return { modifiedCount: 1 };
    }

    return { modifiedCount: 0 };
  }

  async deleteOne(collection, query) {
    const data = await this.readCollection(collection);
    const index = data.findIndex(item => {
      return Object.keys(query).every(key => item[key] === query[key]);
    });

    if (index !== -1) {
      data.splice(index, 1);
      await this.writeCollection(collection, data);
      return { deletedCount: 1 };
    }

    return { deletedCount: 0 };
  }

  async count(collection, query = {}) {
    const results = await this.find(collection, query);
    return results.length;
  }

  // Health check
  async ping() {
    return this.connected;
  }

  async disconnect() {
    this.connected = false;
    console.log('🔌 File Database disconnected');
  }
}

module.exports = new FileDatabase();