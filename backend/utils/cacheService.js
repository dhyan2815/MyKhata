import NodeCache from 'node-cache';
import crypto from 'crypto';

class CacheService {
  constructor() {
    // Create cache instances for different data types
    this.userCache = new NodeCache({ 
      stdTTL: 300, // 5 minutes default TTL
      checkperiod: 60, // Check for expired keys every minute
      useClones: false // Don't clone objects for better performance
    });
    
    this.ocrCache = new NodeCache({ 
      stdTTL: 1800, // 30 minutes for OCR results
      checkperiod: 120,
      useClones: false
    });
    
    this.receiptCache = new NodeCache({ 
      stdTTL: 600, // 10 minutes for receipt data
      checkperiod: 60,
      useClones: false
    });

    // Statistics
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
  }

  // Generic cache operations
  get(key, cacheType = 'user') {
    const cache = this.getCache(cacheType);
    const value = cache.get(key);
    
    if (value !== undefined) {
      this.stats.hits++;
      return value;
    } else {
      this.stats.misses++;
      return null;
    }
  }

  set(key, value, ttl = null, cacheType = 'user') {
    const cache = this.getCache(cacheType);
    const success = ttl ? cache.set(key, value, ttl) : cache.set(key, value);
    
    if (success) {
      this.stats.sets++;
    }
    return success;
  }

  del(key, cacheType = 'user') {
    const cache = this.getCache(cacheType);
    const success = cache.del(key);
    
    if (success) {
      this.stats.deletes++;
    }
    return success;
  }

  // Get cache instance by type
  getCache(cacheType) {
    switch (cacheType) {
      case 'ocr':
        return this.ocrCache;
      case 'receipt':
        return this.receiptCache;
      case 'user':
      default:
        return this.userCache;
    }
  }

  // User-specific cache operations
  getUserData(userId, key) {
    return this.get(`user_${userId}_${key}`, 'user');
  }

  setUserData(userId, key, value, ttl = null) {
    return this.set(`user_${userId}_${key}`, value, ttl, 'user');
  }

  deleteUserData(userId, key) {
    return this.del(`user_${userId}_${key}`, 'user');
  }

  // Clear all user data
  clearUserData(userId) {
    const keys = this.userCache.keys().filter(key => key.startsWith(`user_${userId}_`));
    keys.forEach(key => this.userCache.del(key));
    return keys.length;
  }

  // OCR cache operations
  getOCRResult(imageHash) {
    return this.get(`ocr_${imageHash}`, 'ocr');
  }

  setOCRResult(imageHash, result, ttl = 1800) {
    return this.set(`ocr_${imageHash}`, result, ttl, 'ocr');
  }

  // Receipt cache operations
  getReceiptData(receiptId) {
    return this.get(`receipt_${receiptId}`, 'receipt');
  }

  setReceiptData(receiptId, data, ttl = 600) {
    return this.set(`receipt_${receiptId}`, data, ttl, 'receipt');
  }

  deleteReceiptData(receiptId) {
    return this.del(`receipt_${receiptId}`, 'receipt');
  }

  // Cache statistics
  getStats() {
    return {
      ...this.stats,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
      userCache: {
        keys: this.userCache.keys().length,
        stats: this.userCache.getStats()
      },
      ocrCache: {
        keys: this.ocrCache.keys().length,
        stats: this.ocrCache.getStats()
      },
      receiptCache: {
        keys: this.receiptCache.keys().length,
        stats: this.receiptCache.getStats()
      }
    };
  }

  // Clear all caches
  clearAll() {
    this.userCache.flushAll();
    this.ocrCache.flushAll();
    this.receiptCache.flushAll();
    this.stats = { hits: 0, misses: 0, sets: 0, deletes: 0 };
  }

  // Generate cache key for image hash
  generateImageHash(buffer) {
    return crypto.createHash('md5').update(buffer).digest('hex');
  }
}

// Create singleton instance
const cacheService = new CacheService();

export default cacheService;
