class CacheService {
  constructor() {
    this.cache = new Map();
  }

  async set(key, value) {
    this.cache.set(key, value);
  }

  async get(key) {
    return this.cache.get(key);
  }

  async delete(key) {
    this.cache.delete(key);
  }
}

const cacheInstance = new CacheService();

module.exports = cacheInstance;