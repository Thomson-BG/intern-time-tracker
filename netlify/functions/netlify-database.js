const fs = require('fs').promises;
const path = require('path');

class NetlifyFileDatabase {
  constructor() {
    // Use /tmp directory for Netlify functions
    this.databasePath = '/tmp/database';
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
        password: 'admin123',
        role: 'admin',
        createdAt: new Date().toISOString()
      }];
      
      await this.ensureFileExists(this.collections.adminCredentials, defaultAdmin);
      this.connected = true;
      
      return true;
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  async ping() {
    return this.connected;
  }

  // Collection operations
  async find(collection, query = {}) {
    try {
      const filePath = this.collections[collection];
      const data = await fs.readFile(filePath, 'utf8');
      const items = JSON.parse(data);
      
      if (Object.keys(query).length === 0) {
        return items;
      }
      
      return items.filter(item => {
        return Object.keys(query).every(key => {
          if (typeof query[key] === 'object' && query[key].$regex) {
            const regex = new RegExp(query[key].$regex, query[key].$options || '');
            return regex.test(item[key]);
          }
          return item[key] === query[key];
        });
      });
    } catch (error) {
      console.error(`Error finding in ${collection}:`, error);
      return [];
    }
  }

  async findOne(collection, query) {
    const results = await this.find(collection, query);
    return results[0] || null;
  }

  async insertOne(collection, document) {
    try {
      const filePath = this.collections[collection];
      const data = await fs.readFile(filePath, 'utf8');
      const items = JSON.parse(data);
      
      const newDocument = {
        _id: this.generateId(),
        ...document,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      items.push(newDocument);
      await fs.writeFile(filePath, JSON.stringify(items, null, 2));
      
      return { insertedId: newDocument._id, acknowledged: true };
    } catch (error) {
      console.error(`Error inserting into ${collection}:`, error);
      throw error;
    }
  }

  async updateOne(collection, query, update) {
    try {
      const filePath = this.collections[collection];
      const data = await fs.readFile(filePath, 'utf8');
      const items = JSON.parse(data);
      
      const index = items.findIndex(item => 
        Object.keys(query).every(key => item[key] === query[key])
      );
      
      if (index === -1) {
        return { matchedCount: 0, modifiedCount: 0 };
      }
      
      items[index] = {
        ...items[index],
        ...update.$set,
        updatedAt: new Date().toISOString()
      };
      
      await fs.writeFile(filePath, JSON.stringify(items, null, 2));
      
      return { matchedCount: 1, modifiedCount: 1 };
    } catch (error) {
      console.error(`Error updating ${collection}:`, error);
      throw error;
    }
  }

  async deleteOne(collection, query) {
    try {
      const filePath = this.collections[collection];
      const data = await fs.readFile(filePath, 'utf8');
      const items = JSON.parse(data);
      
      const index = items.findIndex(item => 
        Object.keys(query).every(key => item[key] === query[key])
      );
      
      if (index === -1) {
        return { deletedCount: 0 };
      }
      
      items.splice(index, 1);
      await fs.writeFile(filePath, JSON.stringify(items, null, 2));
      
      return { deletedCount: 1 };
    } catch (error) {
      console.error(`Error deleting from ${collection}:`, error);
      throw error;
    }
  }

  async aggregate(collection, pipeline) {
    try {
      const items = await this.find(collection);
      
      // Simple aggregation for counting
      if (pipeline.length === 1 && pipeline[0].$group && pipeline[0].$group._id === null) {
        const group = pipeline[0].$group;
        const result = { _id: null };
        
        Object.keys(group).forEach(key => {
          if (key !== '_id' && group[key].$sum === 1) {
            result[key] = items.length;
          }
        });
        
        return [result];
      }
      
      return items;
    } catch (error) {
      console.error(`Error aggregating ${collection}:`, error);
      return [];
    }
  }
}

module.exports = new NetlifyFileDatabase();