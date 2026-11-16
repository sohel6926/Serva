import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

let dbInstance: Database.Database | null = null;

export function getDbPath(): string {
  if (process.env.DATABASE_PATH) {
    return process.env.DATABASE_PATH;
  }
  return path.resolve(process.cwd(), 'data', 'serva.db');
}

export function getDb(): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }
  const dbPath = getDbPath();
  if (dbPath !== ':memory:') {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  dbInstance = new Database(dbPath);
  dbInstance.pragma('journal_mode = WAL');
  dbInstance.pragma('foreign_keys = ON');
  return dbInstance;
}

export function resetDbForTests(customPath = ':memory:'): Database.Database {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
  process.env.DATABASE_PATH = customPath;
  return getDb();
}
