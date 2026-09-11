type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const globalForLive = globalThis as typeof globalThis & {
  __grvipLiveCache?: Map<string, CacheEntry<unknown>>;
};

function getStore() {
  if (!globalForLive.__grvipLiveCache) {
    globalForLive.__grvipLiveCache = new Map();
  }
  return globalForLive.__grvipLiveCache;
}

export function getCached<T>(key: string): T | null {
  const entry = getStore().get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    getStore().delete(key);
    return null;
  }
  return entry.value;
}

export function setCache<T>(key: string, value: T, ttlMs: number) {
  getStore().set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function clearCache(key?: string) {
  if (!key) {
    getStore().clear();
    return;
  }
  getStore().delete(key);
}
