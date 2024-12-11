import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { StyleType, ToolType, RecraftModel, ImageSize, Controls } from '@/types/recraft';

export interface ImageMetadata {
  prompt?: string;
  style?: StyleType;
  style_id?: string;
  substyle?: string;
  tool?: ToolType;
  originalImageId?: string;
  model?: RecraftModel;
  size?: ImageSize;
  controls?: Controls;
}

interface ImageData {
  id: string;
  url: string;
  timestamp: number;
  title: string;
  metadata: ImageMetadata;
}

export type { ImageData };

interface ImageDB extends DBSchema {
  images: {
    key: string;
    value: {
      blob: Blob;
      metadata: ImageData['metadata'];
      timestamp: number;
      title: string;
    };
  };
}

class ImageStorage {
  private db: Promise<IDBPDatabase<ImageDB>>;
  private urlMap: Map<string, string> = new Map();

  constructor() {
    this.db = this.initDB();
    // Clean up object URLs when the window unloads
    window.addEventListener('unload', () => this.revokeAllUrls());
  }

  private async initDB() {
    return openDB<ImageDB>('image-store', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('images')) {
          db.createObjectStore('images');
        }
      },
    });
  }

  private revokeAllUrls() {
    for (const url of this.urlMap.values()) {
      URL.revokeObjectURL(url);
    }
    this.urlMap.clear();
  }

  private getObjectUrl(id: string, blob: Blob): string {
    // Revoke existing URL if it exists
    const existingUrl = this.urlMap.get(id);
    if (existingUrl) {
      URL.revokeObjectURL(existingUrl);
    }
    
    // Create and store new URL
    const newUrl = URL.createObjectURL(blob);
    this.urlMap.set(id, newUrl);
    return newUrl;
  }

  async saveImage(
    url: string,
    metadata: ImageData['metadata'],
    title?: string
  ): Promise<ImageData> {
    console.log('Saving image:', { url, metadata, title });
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const id = crypto.randomUUID();
      const timestamp = Date.now();
      const imageTitle = title || metadata.prompt || 'Untitled';

      const db = await this.db;
      await db.put('images', {
        blob,
        metadata,
        timestamp,
        title: imageTitle
      }, id);
      
      const objectUrl = this.getObjectUrl(id, blob);
      
      return {
        id,
        url: objectUrl,
        timestamp,
        title: imageTitle,
        metadata
      };
    } catch (error) {
      console.error('Failed to save image:', error);
      throw error;
    }
  }

  async getImages(): Promise<ImageData[]> {
    console.log('Getting all images');
    try {
      const db = await this.db;
      const keys = await db.getAllKeys('images');
      const values = await db.getAll('images');
      
      return keys.map((id, index) => {
        const { blob, metadata, timestamp, title } = values[index];
        const url = this.getObjectUrl(id as string, blob);
        return {
          id: id as string,
          url,
          timestamp,
          title,
          metadata,
        };
      }).sort((a, b) => b.timestamp - a.timestamp); // Show newest first
    } catch (error) {
      console.error('Failed to get images:', error);
      throw error;
    }
  }

  async getImage(id: string): Promise<ImageData | null> {
    console.log('Getting image:', id);
    try {
      const db = await this.db;
      const value = await db.get('images', id);
      
      if (!value) return null;
      
      const { blob, metadata, timestamp, title } = value;
      const url = this.getObjectUrl(id, blob);
      
      return {
        id,
        url,
        timestamp,
        title,
        metadata,
      };
    } catch (error) {
      console.error('Failed to get image:', error);
      throw error;
    }
  }

  async deleteImage(id: string): Promise<void> {
    console.log('Deleting image:', id);
    try {
      const db = await this.db;
      await db.delete('images', id);
      
      // Revoke the URL if it exists
      const url = this.urlMap.get(id);
      if (url) {
        URL.revokeObjectURL(url);
        this.urlMap.delete(id);
      }
    } catch (error) {
      console.error('Failed to delete image:', error);
      throw error;
    }
  }

  async clearAll(): Promise<void> {
    console.log('Clearing all images');
    try {
      const db = await this.db;
      await db.clear('images');
      this.revokeAllUrls();
    } catch (error) {
      console.error('Failed to clear images:', error);
      throw error;
    }
  }
}

export const imageStorage = new ImageStorage(); 