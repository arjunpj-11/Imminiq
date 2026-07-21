import cookieParser from 'cookie-parser';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { validateCsrfToken } from '../../src/shared/middlewares/csrf-token.middleware';
import { errorHandler } from '../../src/shared/middlewares/error-handler.middleware';

const createApp = () => {
  const app = express();

  const testRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    standardHeaders: false,
    legacyHeaders: false,
  });

  app.use(cookieParser());

  // Rate limiting must appear before authorization/security middleware.
  app.use(testRateLimiter);
  app.use(validateCsrfToken);

  app.use((_req, res) => res.status(204).send());
  app.use(errorHandler);

  return app;
};

describe('validateCsrfToken', () => {
  const app = createApp();

  it.each([
    '/api/auth/register',
    '/api/auth/login',
    '/api/auth/forgot-password',
    '/api/auth/verify-reset-code',
    '/api/auth/reset-password',
  ])('allows cookie-independent auth route %s with a stale auth cookie', async (path) => {
    const response = await request(app)
      .post(path)
      .set('Cookie', 'refreshToken=stale-token');

    expect(response.status).toBe(204);
  });

  it('still protects refresh requests that carry an auth cookie', async () => {
    const response = await request(app)
      .post('/api/auth/refresh-token')
      .set('Cookie', 'refreshToken=active-token');

    expect(response.status).toBe(403);
    expect(response.body).toMatchObject({
      success: false,
      code: 'CSRF_TOKEN_INVALID',
    });
  });

  it('protects every unsafe cookie-authenticated API route', async () => {
    const response = await request(app)
      .patch('/api/security/change-email')
      .set('Cookie', 'refreshToken=active-token; csrfToken=matching-token')
      .set('X-CSRF-Token', 'different-token');

    expect(response.status).toBe(403);
    expect(response.body).toMatchObject({
      success: false,
      code: 'CSRF_TOKEN_INVALID',
    });
  });

  it('allows unsafe requests authenticated only with a bearer token', async () => {
    const response = await request(app)
      .post('/api/trackers')
      .set('Authorization', 'Bearer test-token');

    expect(response.status).toBe(204);
  });

  it('accepts a matching CSRF cookie and header on cookie-backed routes', async () => {
    const response = await request(app)
      .post('/api/auth/refresh-token')
      .set('Cookie', 'refreshToken=active-token; csrfToken=matching-token')
      .set('X-CSRF-Token', 'matching-token');

    expect(response.status).toBe(204);
  });
});
