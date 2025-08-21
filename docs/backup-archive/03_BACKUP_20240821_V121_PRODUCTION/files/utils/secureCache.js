// Secure Cache Utility - Server-side in-memory cache
// Prevents sensitive data exposure - stores only IDs

const CACHE_PREFIX = 'notion_cache_';
const CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes - Phase 3 optimization

// Use global to persist cache across hot reloads in dev
// In production, this will work normally
if (!global.secureMemoryCache) {
  global.secureMemoryCache = new Map();
  console.log('[SecureCache] Initialized global cache');
}

const memoryCache = global.secureMemoryCache;

/**
 * Store only IDs in memory cache
 * Data expires after 5 minutes
 */
export const setSecureCache = (key, ids) => {
  try {
    const cacheData = {
      ids: Array.isArray(ids) ? ids : [ids],
      timestamp: Date.now(),
      expiresAt: Date.now() + CACHE_EXPIRY
    };
    
    // Use in-memory Map instead of sessionStorage
    memoryCache.set(
      `${CACHE_PREFIX}${key}`,
      cacheData
    );
    
    console.log(`[SecureCache] Stored ${cacheData.ids.length} IDs for key: ${key}`);
    
    // Auto-cleanup expired entries
    setTimeout(() => {
      memoryCache.delete(`${CACHE_PREFIX}${key}`);
      console.log(`[SecureCache] Auto-deleted expired cache for key: ${key}`);
    }, CACHE_EXPIRY);
    
    return true;
  } catch (error) {
    console.error('[SecureCache] Storage error:', error);
    return false;
  }
};

/**
 * Retrieve cached IDs if not expired
 */
export const getSecureCache = (key) => {
  try {
    const cacheData = memoryCache.get(`${CACHE_PREFIX}${key}`);
    
    if (!cacheData) {
      console.log(`[SecureCache] No cache found for key: ${key}`);
      return null;
    }
    
    // Check if cache expired
    if (Date.now() > cacheData.expiresAt) {
      console.log(`[SecureCache] Cache expired for key: ${key}`);
      memoryCache.delete(`${CACHE_PREFIX}${key}`);
      return null;
    }
    
    console.log(`[SecureCache] Retrieved ${cacheData.ids.length} IDs for key: ${key}`);
    return cacheData.ids;
  } catch (error) {
    console.error('[SecureCache] Retrieval error:', error);
    return null;
  }
};

/**
 * Clear all secure cache entries
 */
export const clearSecureCache = () => {
  try {
    const cleared = memoryCache.size;
    memoryCache.clear();
    console.log(`[SecureCache] Cleared ${cleared} cache entries`);
    return true;
  } catch (error) {
    console.error('[SecureCache] Clear error:', error);
    return false;
  }
};

/**
 * Check if cache exists and is valid
 */
export const hasValidCache = (key) => {
  const ids = getSecureCache(key);
  return ids !== null && ids.length > 0;
};

/**
 * Get cache stats for monitoring
 */
export const getCacheStats = () => {
  const stats = {
    totalEntries: memoryCache.size,
    entries: []
  };
  
  memoryCache.forEach((value, key) => {
    stats.entries.push({
      key: key.replace(CACHE_PREFIX, ''),
      idsCount: value.ids.length,
      expiresIn: Math.max(0, value.expiresAt - Date.now())
    });
  });
  
  return stats;
};