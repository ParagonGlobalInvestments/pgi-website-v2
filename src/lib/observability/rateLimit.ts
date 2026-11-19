/**
 * Fixed-window rate limiter for the observability collection endpoints.
 *
 * Each key (client IP) is in one of three states:
 *
 *   none/expired ──request──▶ open (count = 1)
 *   open, count < limit ──request──▶ open (count + 1), allowed
 *   open, count ≥ limit ──request──▶ unchanged, blocked
 *
 * A window expires once `now > resetTime`; the next request opens a new one.
 *
 * The store is module memory. On Cloudflare Workers that means per isolate:
 * each isolate keeps its own counts and they reset when it is recycled or on
 * deploy, so the limit is approximate rather than global.
 */

export interface RateLimitWindow {
  count: number;
  resetTime: number;
}

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

export interface RateLimitDecision {
  allowed: boolean;
  next: RateLimitWindow;
}

/** Pure step: decide one request against the key's current window. */
export function checkRateLimitWindow(
  entry: RateLimitWindow | undefined,
  now: number,
  { limit, windowMs }: RateLimitOptions
): RateLimitDecision {
  if (!entry || now > entry.resetTime) {
    return { allowed: true, next: { count: 1, resetTime: now + windowMs } };
  }
  if (entry.count >= limit) {
    return { allowed: false, next: entry };
  }
  return { allowed: true, next: { ...entry, count: entry.count + 1 } };
}

/** A per-key limiter backed by an in-memory Map. Returns true if allowed. */
export function createRateLimiter(options: RateLimitOptions) {
  const store = new Map<string, RateLimitWindow>();

  return function checkRateLimit(key: string, now = Date.now()): boolean {
    const { allowed, next } = checkRateLimitWindow(
      store.get(key),
      now,
      options
    );
    store.set(key, next);
    return allowed;
  };
}
