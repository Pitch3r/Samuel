/**
 * In-memory sliding-window rate limiter. Suitable for a single Node.js server
 * (Hostinger, VPS, Docker). On multi-instance or serverless hosting each
 * instance keeps its own window, which still blunts abuse.
 */
const globalStore = globalThis as unknown as { __primeRateLimit?: Map<string, number[]> };
const store = (globalStore.__primeRateLimit ??= new Map<string, number[]>());

export function rateLimit(key: string, { limit, windowMs }: { limit: number; windowMs: number }) {
  const now = Date.now();
  const hits = (store.get(key) ?? []).filter((time) => now - time < windowMs);

  if (hits.length >= limit) {
    store.set(key, hits);
    return { ok: false as const, retryAfter: Math.max(1, Math.ceil((windowMs - (now - hits[0])) / 1000)) };
  }

  hits.push(now);
  store.set(key, hits);

  if (store.size > 5000) {
    for (const [entryKey, times] of store) {
      if (!times.length || now - times[times.length - 1] > windowMs) store.delete(entryKey);
    }
  }

  return { ok: true as const, retryAfter: 0 };
}

export function resetRateLimits() {
  store.clear();
}
