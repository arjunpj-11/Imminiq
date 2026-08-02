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
  METERED_TURN_API_BASE_URL: 'https://imminiq.metered.live',
  METERED_TURN_SECRET_KEY: 'production-metered-secret',
  ...overrides,
});

describe('production environment policy', () => {
  it('accepts TLS services and a shared cookie domain', () => {
    expect(() => parseApiEnvironment(productionEnvironment())).not.toThrow();
  });

  it('accepts host-only cookies when AWS serves the frontend and API on one hostname', () => {
    expect(() =>
      parseApiEnvironment(
        productionEnvironment({
          CLIENT_URL: 'https://imminiq.arjunpj.online',
          SERVER_URL: 'https://imminiq.arjunpj.online',
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

  it('requires server-side Metered TURN configuration in production', () => {
    expect(() =>
      parseApiEnvironment(
        productionEnvironment({
          METERED_TURN_API_BASE_URL: undefined,
          METERED_TURN_SECRET_KEY: undefined,
        })
      )
    ).toThrow('Metered TURN configuration is required in production');
  });

  it('accepts a static Metered credential API key instead of dynamic credential access', () => {
    expect(() =>
      parseApiEnvironment(
        productionEnvironment({
          METERED_TURN_SECRET_KEY: undefined,
          METERED_TURN_API_KEY: 'dashboard-credential-api-key',
        })
      )
    ).not.toThrow();
  });

  it('rejects pagination defaults that exceed the configured safety limits', () => {
    expect(() =>
      parseApiEnvironment(
        productionEnvironment({
          PAGINATION_DEFAULT_LIMIT: '75',
          PAGINATION_MAX_STANDARD_LIMIT: '50',
        })
      )
    ).toThrow('Pagination limits must satisfy');
  });

  it('rejects unsafe AI-agent runtime tuning', () => {
    expect(() =>
      parseApiEnvironment(
        productionEnvironment({
          AI_TRACKER_INTAKE_TEMPERATURE: '2.1',
        })
      )
    ).toThrow();

    expect(() =>
      parseApiEnvironment(
        productionEnvironment({
          TRACKER_INTAKE_CONTEXT_TRACKER_LIMIT: '0',
        })
      )
    ).toThrow();
  });
});
