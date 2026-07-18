import Redis from 'ioredis';
import { env } from './env';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

redis.on('connect', () => console.log('✅ Redis connected'));

let lastRedisError = '';
let lastRedisErrorAt = 0;
redis.on('error', (error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown Redis error';
  const now = Date.now();
  if (message !== lastRedisError || now - lastRedisErrorAt >= 30_000) {
    console.error(`Redis error: ${message}`);
    lastRedisError = message;
    lastRedisErrorAt = now;
  }
});
