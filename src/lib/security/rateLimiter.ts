/**
 * In-memory sliding window rate limiter for Next.js Edge / Node runtimes.
 * Prevents brute-force attacks, DDoS, and API abuse.
 */

interface RateLimitRecord {
  timestamps: number[];
}

class SlidingWindowRateLimiter {
  private cache = new Map<string, RateLimitRecord>();
  private readonly defaultWindowMs: number;
  private readonly defaultMaxRequests: number;

  constructor(windowMs = 60_000, maxRequests = 60) {
    this.defaultWindowMs = windowMs;
    this.defaultMaxRequests = maxRequests;

    // Periodically evict expired records every 5 minutes to avoid memory leaks
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.cleanup(), 5 * 60_000).unref?.();
    }
  }

  /**
   * Evaluates if a request from a key (IP or User ID) is within rate limits.
   */
  public check(
    key: string,
    maxRequests?: number,
    windowMs?: number
  ): {
    allowed: boolean;
    limit: number;
    remaining: number;
    resetMs: number;
  } {
    const limit = maxRequests ?? this.defaultMaxRequests;
    const windowDuration = windowMs ?? this.defaultWindowMs;
    const now = Date.now();
    const windowStart = now - windowDuration;

    let record = this.cache.get(key);
    if (!record) {
      record = { timestamps: [] };
      this.cache.set(key, record);
    }

    // Filter out expired timestamps
    record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

    if (record.timestamps.length >= limit) {
      const oldestTimestamp = record.timestamps[0];
      const resetMs = Math.max(0, oldestTimestamp + windowDuration - now);
      return {
        allowed: false,
        limit,
        remaining: 0,
        resetMs,
      };
    }

    record.timestamps.push(now);
    return {
      allowed: true,
      limit,
      remaining: limit - record.timestamps.length,
      resetMs: windowDuration,
    };
  }

  private cleanup(): void {
    const now = Date.now();
    this.cache.forEach((record, key) => {
      record.timestamps = record.timestamps.filter((ts: number) => ts > now - this.defaultWindowMs);
      if (record.timestamps.length === 0) {
        this.cache.delete(key);
      }
    });
  }
}

export const globalRateLimiter = new SlidingWindowRateLimiter(60_000, 100);
export const authRateLimiter = new SlidingWindowRateLimiter(60_000, 10); // 10 attempts / min for auth
export const webhookRateLimiter = new SlidingWindowRateLimiter(60_000, 120);
