import { openDB } from 'idb';
import type { StyleType } from '@/types/recraft';

const DB_NAME = 'recraft-styles';
const STORE_NAME = 'styles';
const DB_VERSION = 1;

export interface StoredStyle {
  id: string;
  name: string;
  style: StyleType;
  timestamp: number;
}

class StyleStorage {
  private async getDB() {
    return openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      },
    });
  }

  async saveStyle(id: string, name: string, style: StyleType): Promise<StoredStyle> {
    const db = await this.getDB();
    const storedStyle: StoredStyle = {
      id,
      name,
      style,
      timestamp: Date.now(),
    };
    await db.put(STORE_NAME, storedStyle);
    return storedStyle;
  }

  async getAllStyles(): Promise<StoredStyle[]> {
    const db = await this.getDB();
    const styles = await db.getAll(STORE_NAME);
    return styles.sort((a, b) => b.timestamp - a.timestamp);
  }

  async deleteStyle(id: string): Promise<void> {
    const db = await this.getDB();
    await db.delete(STORE_NAME, id);
  }

  async getStyle(id: string): Promise<StoredStyle | undefined> {
    const db = await this.getDB();
    return db.get(STORE_NAME, id);
  }
}

export const styleStorage = new StyleStorage(); 