import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { Express } from 'express';

import {
  startSecurityHttpIntegrationRuntime,
  type SecurityHttpIntegrationRuntime,
} from '../../setup/security-http-integration-runtime';

const TRUSTED_ORIGIN = 'http://localhost:5173';
const FOREIGN_ORIGIN = 'https://evil.example';

let runtime: SecurityHttpIntegrationRuntime;
let app: Express;

describe('security HTTP integration flows', () => {
  beforeAll(async () => {
    runtime = await startSecurityHttpIntegrationRuntime();
    app = runtime.app;
  }, 60_000);

  beforeEach(async () => {
    await runtime.clearState();
  });

  afterAll(async () => {
    await runtime.stop();
  });

  it('rejects unsafe browser requests from an untrusted Origin before route logic runs', async () => {
    const response = await request(app).post('/api/auth/login').set('Origin', FOREIGN_ORIGIN).send({
      identifier: 'missing@example.com',
      password: 'WrongPassword123!',
    });

    expect(response.status).toBe(403);
    expect(response.body).toMatchObject({
      success: false,
      code: 'REQUEST_ORIGIN_REJECTED',
    });
  });

  it('allows the trusted frontend Origin and reaches normal auth validation', async () => {
    const response = await request(app).post('/api/auth/login').set('Origin', TRUSTED_ORIGIN).send({
      identifier: 'missing@example.com',
      password: 'WrongPassword123!',
    });

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      success: false,
      code: 'INVALID_CREDENTIALS',
    });
  });

  it('temporarily blocks repeated invalid login attempts for the same identifier', async () => {
    const payload = {
      identifier: 'missing-login-user@example.com',
      password: 'WrongPassword123!',
    };

    for (let attempt = 1; attempt <= 7; attempt += 1) {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Origin', TRUSTED_ORIGIN)
        .send(payload);

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        success: false,
        code: 'INVALID_CREDENTIALS',
      });
    }

    const thresholdResponse = await request(app)
      .post('/api/auth/login')
      .set('Origin', TRUSTED_ORIGIN)
      .send(payload);

    expect(thresholdResponse.status).toBe(429);
    expect(thresholdResponse.body).toMatchObject({
      success: false,
      code: 'LOGIN_TEMPORARILY_BLOCKED',
    });

    const blockedResponse = await request(app)
      .post('/api/auth/login')
      .set('Origin', TRUSTED_ORIGIN)
      .send(payload);

    expect(blockedResponse.status).toBe(429);
    expect(blockedResponse.body).toMatchObject({
      success: false,
      code: 'LOGIN_TEMPORARILY_BLOCKED',
    });
  });

  it('temporarily blocks repeated invalid password-reset OTP attempts', async () => {
    const payload = {
      identifier: 'missing-reset-user@example.com',
      otp: '123456',
    };

    for (let attempt = 1; attempt <= 4; attempt += 1) {
      const response = await request(app)
        .post('/api/auth/verify-reset-code')
        .set('Origin', TRUSTED_ORIGIN)
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        code: 'INVALID_OTP',
      });
    }

    const thresholdResponse = await request(app)
      .post('/api/auth/verify-reset-code')
      .set('Origin', TRUSTED_ORIGIN)
      .send(payload);

    expect(thresholdResponse.status).toBe(429);
    expect(thresholdResponse.body).toMatchObject({
      success: false,
      code: 'RESET_CODE_VERIFICATION_TEMPORARILY_BLOCKED',
    });

    const blockedResponse = await request(app)
      .post('/api/auth/verify-reset-code')
      .set('Origin', TRUSTED_ORIGIN)
      .send(payload);

    expect(blockedResponse.status).toBe(429);
    expect(blockedResponse.body).toMatchObject({
      success: false,
      code: 'RESET_CODE_VERIFICATION_TEMPORARILY_BLOCKED',
    });
  });

  it('starts Google OAuth with a one-time state nonce and HttpOnly state cookie', async () => {
    const response = await request(app).get('/api/auth/oauth/google');

    expect(response.status).toBe(302);

    const redirectUrl = new URL(response.headers.location);
    const state = redirectUrl.searchParams.get('state');

    expect(redirectUrl.hostname).toContain('google');
    expect(state).toBeTruthy();

    const setCookieHeader = response.headers['set-cookie'];
    const cookies = Array.isArray(setCookieHeader)
      ? setCookieHeader
      : [setCookieHeader].filter(Boolean);

    expect(cookies.some((cookie) => String(cookie).includes('imminiq_oauth_state_google='))).toBe(
      true
    );

    expect(cookies.some((cookie) => String(cookie).toLowerCase().includes('httponly'))).toBe(true);
  });

  it('rejects a Google OAuth callback that has no state parameter', async () => {
    const response = await request(app).get('/api/auth/oauth/google/callback');

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe(`${TRUSTED_ORIGIN}/login?error=oauth_state_invalid`);
  });

  it('accepts a valid OAuth state pair before Passport handles the missing provider code', async () => {
    const startResponse = await request(app).get('/api/auth/oauth/google');

    expect(startResponse.status).toBe(302);

    const redirectUrl = new URL(startResponse.headers.location);
    const state = redirectUrl.searchParams.get('state');

    expect(state).toBeTruthy();

    const setCookieHeader = startResponse.headers['set-cookie'];
    const cookies = Array.isArray(setCookieHeader)
      ? setCookieHeader
      : [setCookieHeader].filter(Boolean);

    const callbackResponse = await request(app)
      .get(`/api/auth/oauth/google/callback?state=${encodeURIComponent(String(state))}`)
      .set('Cookie', cookies as string[]);

    expect(callbackResponse.status).toBe(302);

    const callbackRedirect = callbackResponse.headers.location;

    expect(callbackRedirect).toContain('accounts.google.com');
    expect(callbackRedirect).not.toContain('oauth_state_invalid');
  });
});
