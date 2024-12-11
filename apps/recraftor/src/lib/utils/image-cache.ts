interface CacheEntry {
  url: string;
  timestamp: number;
  size: number;
  blob: Blob; // Store the blob to prevent garbage collection
  contentType: string; // Store the content type
}

class ImageCache {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB
  private readonly MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours
  private currentSize = 0;
  private activeUrls: Set<string> = new Set(); // Track active URLs

  async getCachedImage(imageId: string, originalUrl: string): Promise<string> {
    const cached = this.cache.get(imageId);
    
    if (cached && Date.now() - cached.timestamp < this.MAX_AGE) {
      // If URL was revoked, recreate it
      if (!this.activeUrls.has(cached.url)) {
        const newUrl = URL.createObjectURL(cached.blob);
        this.activeUrls.add(newUrl);
        cached.url = newUrl;
      }
      return cached.url;
    }

    // If cached entry exists but is expired, clean it up
    if (cached) {
      this.removeFromCache(imageId);
    }

    try {
      // Handle blob URLs directly
      if (originalUrl.startsWith('blob:')) {
        const response = await fetch(originalUrl);
        if (!response.ok) throw new Error('Failed to fetch blob URL');
        const blob = await response.blob();
        const contentType = blob.type;
        
        // Only cache if the blob size is reasonable
        if (blob.size <= this.MAX_CACHE_SIZE / 10) {
          await this.addToCache(imageId, blob, contentType);
          const entry = this.cache.get(imageId);
          return entry ? entry.url : URL.createObjectURL(blob);
        }
        
        // If too large, just return a one-time object URL
        const url = URL.createObjectURL(blob);
        this.activeUrls.add(url);
        return url;
      }

      // Handle regular URLs
      const response = await fetch(originalUrl);
      if (!response.ok) throw new Error('Failed to fetch image');
      const blob = await response.blob();
      const contentType = response.headers.get('content-type') || blob.type;
      
      // Only cache if the blob size is reasonable
      if (blob.size <= this.MAX_CACHE_SIZE / 10) {
        await this.addToCache(imageId, blob, contentType);
        const entry = this.cache.get(imageId);
        return entry ? entry.url : URL.createObjectURL(blob);
      }
      
      // If too large, just return a one-time object URL
      const url = URL.createObjectURL(blob);
      this.activeUrls.add(url);
      return url;
    } catch (error) {
      console.error('Failed to cache image:', error);
      // If we can't fetch the image, try to use the original URL
      return originalUrl;
    }
  }

  private async addToCache(imageId: string, blob: Blob, contentType: string) {
    // Make space if needed
    while (this.currentSize + blob.size > this.MAX_CACHE_SIZE) {
      const [oldestId] = this.cache.entries().next().value;
      if (!oldestId) break;
      this.removeFromCache(oldestId);
    }

    const url = URL.createObjectURL(blob);
    this.activeUrls.add(url);
    this.cache.set(imageId, {
      url,
      timestamp: Date.now(),
      size: blob.size,
      blob: blob.slice(0), // Store a copy of the blob
      contentType
    });
    this.currentSize += blob.size;
  }

  private removeFromCache(imageId: string) {
    const entry = this.cache.get(imageId);
    if (entry) {
      if (this.activeUrls.has(entry.url)) {
        URL.revokeObjectURL(entry.url);
        this.activeUrls.delete(entry.url);
      }
      this.currentSize -= entry.size;
      this.cache.delete(imageId);
    }
  }

  // Public methods
  cleanup() {
    const now = Date.now();
    for (const [id, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.MAX_AGE) {
        this.removeFromCache(id);
      }
    }
  }

  // Public method to remove an image from cache
  removeCachedImage(imageId: string) {
    this.removeFromCache(imageId);
  }

  // Public method to check if an image is cached
  hasCache(imageId: string): boolean {
    return this.cache.has(imageId);
  }

  // Public method to cleanup all URLs
  cleanupAllUrls() {
    for (const url of this.activeUrls) {
      URL.revokeObjectURL(url);
    }
    this.activeUrls.clear();
  }
}

export const imageCache = new ImageCache(); 