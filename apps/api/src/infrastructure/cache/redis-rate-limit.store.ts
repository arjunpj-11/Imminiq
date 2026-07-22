import type { Redis } from 'ioredis';

type RateLimitOptions = { windowMs: number };
type IncrementResult = { totalHits: number; resetTime: Date };

const INCREMENT_WITH_EXPIRY_SCRIPT = `
local total = redis.call('INCR', KEYS[1])
if total == 1 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
end
local ttl = redis.call('PTTL', KEYS[1])
if ttl < 0 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
  ttl = tonumber(ARGV[1])
end
return { total, ttl }
`;

const DECREMENT_IF_POSITIVE_SCRIPT = `
local total = tonumber(redis.call('GET', KEYS[1]) or '0')
if total > 0 then
  redis.call('DECR', KEYS[1])
end
return 1
`;

/**
 * Shared, atomic rate-limit counters for horizontally scaled API instances.
 * Each limiter receives its own store instance and namespace.
 */
export class RedisRateLimitStore {
  private _windowMs = 60_000;

  constructor(
    private readonly _client: Redis,
    readonly prefix: string
  ) {}

  init(options: RateLimitOptions) {
    this._windowMs = options.windowMs;
  }

  async increment(key: string): Promise<IncrementResult> {
    const result = await this._client.eval(
      INCREMENT_WITH_EXPIRY_SCRIPT,
      1,
      this.toRedisKey(key),
      String(this._windowMs)
    );
    const [rawHits, rawTtl] = Array.isArray(result) ? result : [1, this._windowMs];
    const totalHits = Math.max(1, Number(rawHits));
    const ttl = Math.max(1, Number(rawTtl));

    return { totalHits, resetTime: new Date(Date.now() + ttl) };
  }

  async decrement(key: string): Promise<void> {
    await this._client.eval(DECREMENT_IF_POSITIVE_SCRIPT, 1, this.toRedisKey(key));
  }

  async resetKey(key: string): Promise<void> {
    await this._client.del(this.toRedisKey(key));
  }

  private toRedisKey(key: string) {
    return `rate-limit:${this.prefix}:${key}`;
  }
}
