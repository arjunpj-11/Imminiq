import { describe, expect, it } from 'vitest';

import { parseApiEnvironment } from '../../src/config/env';

const productionEnvironment = (overrides: Record<string, unknown> = {}) => ({
  ...process.env,
  NODE_ENV: 'production',
  CLIENT_URL: 'https://imminiq.com',
  SERVER_URL: 'https://api.imminiq.com',
  AUTH_COOKIE_DOMAIN: '.imminiq.com',
  MONGO_URI: 'mongodb+srv://user:password@cluster.example/imminiq',
  REDIS_URL: 'rediss://user:password@redis.example:6380',
  JWT_SECRET: 'production-access-secret-with-more-than-thirty-two-random-characters',
  JWT_REFRESH_SECRET: 'production-refresh-secret-with-more-than-thirty-two-random-characters',
  BCRYPT_ROUNDS: '12',
  ...overrides,
});

describe('production environment policy', () => {
  it('accepts TLS services and a shared cookie domain', () => {
    expect(() => parseApiEnvironment(productionEnvironment())).not.toThrow();
  });

  it('accepts host-only cookies while the API is hosted on an external provider', () => {
    expect(() =>
      parseApiEnvironment(
        productionEnvironment({
          CLIENT_URL: 'https://imminiq-web.vercel.app',
          SERVER_URL: 'https://imminiq-api.onrender.com',
          AUTH_COOKIE_DOMAIN: undefined,
        })
      )
    ).not.toThrow();
  });

  it('rejects insecure service endpoints and placeholder secrets', () => {
    expect(() =>
      parseApiEnvironment(
        productionEnvironment({
          CLIENT_URL: 'http://imminiq.com',
          REDIS_URL: 'redis://redis.example:6379',
          JWT_SECRET: 'replace-with-at-least-32-random-characters',
        })
      )
    ).toThrow();
  });

  it('rejects a cookie domain that is not shared by the frontend and API', () => {
    expect(() =>
      parseApiEnvironment(productionEnvironment({ AUTH_COOKIE_DOMAIN: '.unrelated.example' }))
    ).toThrow('AUTH_COOKIE_DOMAIN must be a shared parent');
  });
});
