export interface CacheValue<T> {
  expiry: number;
  data: T;
}

const store = new Map<string, CacheValue<unknown>>();

export function setCached<T>(key: string, data: T, ttl: number): void {
  store.set(key, { data, expiry: Date.now() + ttl });
}

export function getCached<T>(key: string): T | null {
  const entry = store.get(key) as CacheValue<T> | undefined;
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    store.delete(key);
    return null;
  }
  return entry.data;
}
