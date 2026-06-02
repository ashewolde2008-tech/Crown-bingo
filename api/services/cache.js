const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

class CacheService {
  async get(key) { return cache.get(key); }
  async set(key, value, ttlSeconds = 300) { return cache.set(key, value, ttlSeconds); }
  async invalidate(pattern) {
    const keys = cache.keys().filter(k => k.startsWith(pattern.replace('*', '')));
    keys.forEach(k => cache.del(k));
    return keys.length;
  }
  async flush() { cache.flushAll(); }
}

module.exports = new CacheService();
