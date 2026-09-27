import Database, { Database as DatabaseInstance } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { app } from 'electron';
import { initializeSchema } from './schema';

let activeDatabase: DatabaseInstance | null = null;
let currentDbPath: string | null = null;

export function getDatabasePath(): string {
  if (currentDbPath) return currentDbPath;

  try {
    const userData = app.getPath('userData');
    return path.join(userData, 'stickerchest.db');
  } catch {
    // Fallback for tests or runner outside Electron lifecycle
    const fallbackDir = path.resolve(process.cwd(), '.data');
    if (!fs.existsSync(fallbackDir)) {
      fs.mkdirSync(fallbackDir, { recursive: true });
    }
    return path.join(fallbackDir, 'stickerchest.db');
  }
}

export function createDatabaseConnection(customPath?: string): DatabaseInstance {
  const dbPath = customPath || getDatabasePath();
  const dbDir = path.dirname(dbPath);
  if (dbPath !== ':memory:' && !fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const db = new Database(dbPath);
  initializeSchema(db);
  return db;
}

export function getDatabase(): DatabaseInstance {
  if (!activeDatabase) {
    activeDatabase = createDatabaseConnection();
  }
  return activeDatabase;
}

export function switchDatabase(newDbPath: string): DatabaseInstance {
  closeDatabase();
  currentDbPath = newDbPath;
  activeDatabase = createDatabaseConnection(newDbPath);
  return activeDatabase;
}

export function closeDatabase(): void {
  if (activeDatabase) {
    try {
      activeDatabase.close();
    } catch (err) {
      console.warn('Error closing database:', err);
    }
    activeDatabase = null;
  }
}
