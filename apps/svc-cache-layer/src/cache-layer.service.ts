import { Injectable } from '@nestjs/common';

@Injectable()
export class CacheLayerService {
  private cache: Map<string, { value: any; expiry: number }> = new Map();

  async get(key: string): Promise<any> {
    const item = this.cache.get(key);
    if (!item || item.expiry < Date.now()) return null;
    return item.value;
  }
  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    this.cache.set(key, { value, expiry: Date.now() + ttlSeconds * 1000 });
  }
  async delete(key: string): Promise<boolean> { return this.cache.delete(key) || false; }
  async clear(): Promise<boolean> { this.cache.clear(); return true; }
}