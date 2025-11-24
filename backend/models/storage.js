import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');

// Ensure data directory exists
await fs.mkdir(DATA_DIR, { recursive: true });

/**
 * Simple JSON-based storage for the minimal backend
 * In production, this would be replaced with a proper database
 */
class Storage {
  constructor(filename) {
    this.filepath = path.join(DATA_DIR, filename);
    this.data = null;
  }

  async load() {
    try {
      const content = await fs.readFile(this.filepath, 'utf-8');
      this.data = JSON.parse(content);
    } catch (error) {
      if (error.code === 'ENOENT') {
        this.data = [];
        await this.save();
      } else {
        throw error;
      }
    }
    return this.data;
  }

  async save() {
    await fs.writeFile(this.filepath, JSON.stringify(this.data, null, 2));
  }

  async getAll() {
    if (!this.data) await this.load();
    return this.data;
  }

  async getById(id) {
    if (!this.data) await this.load();
    return this.data.find(item => item.id === id);
  }

  async create(item) {
    if (!this.data) await this.load();
    this.data.push(item);
    await this.save();
    return item;
  }

  async update(id, updates) {
    if (!this.data) await this.load();
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) return null;
    
    this.data[index] = { ...this.data[index], ...updates, updatedAt: new Date().toISOString() };
    await this.save();
    return this.data[index];
  }

  async delete(id) {
    if (!this.data) await this.load();
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) return false;
    
    this.data.splice(index, 1);
    await this.save();
    return true;
  }
}

// Create storage instances for each document type
export const edpsStorage = new Storage('edps.json');
export const dvpStorage = new Storage('dvp.json');
export const dfmeaStorage = new Storage('dfmea.json');

