type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const globalForLive = globalThis as typeof globalThis & {
  __grvipLiveCache?: Map<string, CacheEntry<unknown>>;
};

function memoryStore() {
  if (!globalForLive.__grvipLiveCache) {
    globalForLive.__grvipLiveCache = new Map();
  }
  return globalForLive.__grvipLiveCache;
}

function upstashConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/$/, "");
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url, token };
}

export function getCached<T>(key: string): T | null {
  const entry = memoryStore().get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryStore().delete(key);
    return null;
  }
  return entry.value;
}

export function setCache<T>(key: string, value: T, ttlMs: number) {
  memoryStore().set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function clearCache(key?: string) {
  if (!key) {
    memoryStore().clear();
    return;
  }
  memoryStore().delete(key);
}

async function redisCommand(command: Array<string | number>) {
  const config = upstashConfig();
  if (!config) return null;

  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });

  if (!response.ok) return null;
  const payload = (await response.json()) as { result?: unknown };
  return payload.result ?? null;
}

/** Memory + shared Upstash cache (required on Vercel so stream workers share channel map). */
export async function getCachedAsync<T>(key: string): Promise<T | null> {
  const local = getCached<T>(key);
  if (local) return local;

  const raw = await redisCommand(["GET", key]);
  if (typeof raw !== "string" || !raw) return null;

  try {
    const parsed = JSON.parse(raw) as CacheEntry<T>;
    if (!parsed || typeof parsed.expiresAt !== "number") return null;
    if (Date.now() > parsed.expiresAt) {
      void redisCommand(["DEL", key]);
      return null;
    }
    // hydrate memory for subsequent lookups in this isolate
    memoryStore().set(key, parsed);
    return parsed.value;
  } catch {
    return null;
  }
}

export async function setCacheAsync<T>(key: string, value: T, ttlMs: number) {
  const entry: CacheEntry<T> = { value, expiresAt: Date.now() + ttlMs };
  memoryStore().set(key, entry);

  const ttlSec = Math.max(1, Math.ceil(ttlMs / 1000));
  await redisCommand(["SET", key, JSON.stringify(entry), "EX", ttlSec]);
}

export async function clearCacheAsync(key?: string) {
  clearCache(key);
  if (!key) return;
  await redisCommand(["DEL", key]);
}
