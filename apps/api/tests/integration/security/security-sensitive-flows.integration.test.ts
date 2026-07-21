import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Express } from 'express';

vi.mock(
  '../../../src/modules/security/infrastructure/providers/shared-security-email.provider',
  () => ({
    sharedSecurityEmailProvider: {
      sendEmailChangeVerification: vi.fn().mockResolvedValue(undefined),
      sendEmailChangeAlert: vi.fn().mockResolvedValue(undefined),
    },
  })
);

import { AIGenerationJob } from '../../../src/infrastructure/database/models/ai-generation-job.model';
import { User } from '../../../src/infrastructure/database/models/user.model';
import { redisOtpStore } from '../../../src/modules/auth/infrastructure/stores/redis-otp.store';
import {
  AI_JOB_QUOTA_POLICIES,
  aiJobQuotaCache,
} from '../../../src/infrastructure/cache/ai-job-quota.cache';
import {
  startSecurityHttpIntegrationRuntime,
  type SecurityHttpIntegrationRuntime,
} from '../../setup/security-http-integration-runtime';
import {
  createVerifiedLocalUser,
  loginFixtureUser,
  TRUSTED_TEST_ORIGIN,
} from '../../helpers/security-integration-fixtures';

let runtime: SecurityHttpIntegrationRuntime;
let app: Express;

describe('security-sensitive HTTP integration flows', () => {
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

  it('maps security overview sessions to safe DTOs without token hashes', async () => {
    const user = await createVerifiedLocalUser();
    const authenticated = await loginFixtureUser(app, user);

    const response = await request(app)
      .get('/api/security/overview')
      .set('Authorization', `Bearer ${authenticated.accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body?.data?.activeSessions).toHaveLength(1);
    expect(response.body.data.activeSessions[0]).toMatchObject({
      id: expect.any(String),
      deviceName: expect.any(String),
      client: expect.any(String),
      current: true,
    });
    expect(response.body.data.activeSessions[0]).not.toHaveProperty('refreshTokenHash');
    expect(response.body.data.activeSessions[0]).not.toHaveProperty('userId');
    expect(response.body.data.activeSessions[0]).not.toHaveProperty('deletedAt');
  });

  it('rotates refresh tokens and detects reuse of the retired refresh cookie', async () => {
    const user = await createVerifiedLocalUser();
    const authenticated = await loginFixtureUser(app, user);

    const firstRefresh = await request(app)
      .post('/api/auth/refresh-token')
      .set('Origin', TRUSTED_TEST_ORIGIN)
      .set('Cookie', authenticated.cookieHeader)
      .set('X-CSRF-Token', authenticated.csrfToken);

    expect(firstRefresh.status).toBe(200);
    expect(firstRefresh.body?.data?.accessToken).toEqual(expect.any(String));
    expect(firstRefresh.body?.data?.user).toMatchObject({
      _id: user.userId,
      username: user.username,
      email: user.email,
      status: 'active',
    });
    expect(firstRefresh.body.data.user).not.toHaveProperty('passwordHash');

    const reuseResponse = await request(app)
      .post('/api/auth/refresh-token')
      .set('Origin', TRUSTED_TEST_ORIGIN)
      .set('Cookie', authenticated.cookieHeader)
      .set('X-CSRF-Token', authenticated.csrfToken);

    expect(reuseResponse.status).toBe(401);
    expect(reuseResponse.body).toMatchObject({
      success: false,
      code: 'REFRESH_TOKEN_REUSE_DETECTED',
    });
  });

  it('rejects refresh-token requests that carry auth cookies without a matching CSRF header', async () => {
    const user = await createVerifiedLocalUser();
    const authenticated = await loginFixtureUser(app, user);

    const response = await request(app)
      .post('/api/auth/refresh-token')
      .set('Origin', TRUSTED_TEST_ORIGIN)
      .set('Cookie', authenticated.cookieHeader);

    expect(response.status).toBe(403);
    expect(response.body).toMatchObject({
      success: false,
      code: 'CSRF_TOKEN_INVALID',
    });
  });

  it('accepts a password reset token once, rejects replay, and allows login with the new password', async () => {
    const user = await createVerifiedLocalUser({
      password: 'OldPassword123!',
    });

    await redisOtpStore.saveOtp({
      email: user.email,
      otp: '123456',
      purpose: 'password_reset',
    });

    const verifyResetCode = await request(app)
      .post('/api/auth/verify-reset-code')
      .set('Origin', TRUSTED_TEST_ORIGIN)
      .send({
        identifier: user.email,
        otp: '123456',
      });

    expect(verifyResetCode.status).toBe(200);

    const resetToken =
      typeof verifyResetCode.body?.data?.resetToken === 'string'
        ? verifyResetCode.body.data.resetToken
        : '';

    expect(resetToken).toBeTruthy();

    const firstReset = await request(app)
      .post('/api/auth/reset-password')
      .set('Origin', TRUSTED_TEST_ORIGIN)
      .send({
        resetToken,
        newPassword: 'NewSecurePassword123!',
      });

    expect(firstReset.status).toBe(200);

    const replayReset = await request(app)
      .post('/api/auth/reset-password')
      .set('Origin', TRUSTED_TEST_ORIGIN)
      .send({
        resetToken,
        newPassword: 'AnotherSecurePassword123!',
      });

    expect(replayReset.status).toBe(400);
    expect(replayReset.body).toMatchObject({
      success: false,
      code: 'INVALID_RESET_TOKEN',
    });

    const newPasswordLogin = await request(app)
      .post('/api/auth/login')
      .set('Origin', TRUSTED_TEST_ORIGIN)
      .send({
        identifier: user.email,
        password: 'NewSecurePassword123!',
      });

    expect(newPasswordLogin.status).toBe(200);
  });

  it('requires password step-up before requesting an email change', async () => {
    const user = await createVerifiedLocalUser();
    const authenticated = await loginFixtureUser(app, user);

    const response = await request(app)
      .patch('/api/security/change-email')
      .set('Origin', TRUSTED_TEST_ORIGIN)
      .set('Authorization', `Bearer ${authenticated.accessToken}`)
      .send({
        newEmail: `changed_${Date.now()}@example.com`,
      });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      code: 'STEP_UP_PASSWORD_REQUIRED',
    });
  });

  it('allows an email change request after valid password step-up', async () => {
    const user = await createVerifiedLocalUser();
    const authenticated = await loginFixtureUser(app, user);
    const newEmail = `changed_${Date.now()}@example.com`;

    const response = await request(app)
      .patch('/api/security/change-email')
      .set('Origin', TRUSTED_TEST_ORIGIN)
      .set('Authorization', `Bearer ${authenticated.accessToken}`)
      .send({
        newEmail,
        currentPassword: user.password,
      });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: {
        pendingEmail: newEmail,
        verificationSent: true,
      },
    });
  });

  it('requires password step-up before deleting an account', async () => {
    const user = await createVerifiedLocalUser();
    const authenticated = await loginFixtureUser(app, user);

    const response = await request(app)
      .delete('/api/security/delete-account')
      .set('Origin', TRUSTED_TEST_ORIGIN)
      .set('Authorization', `Bearer ${authenticated.accessToken}`)
      .send({
        confirmation: 'DELETE',
      });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      code: 'STEP_UP_PASSWORD_REQUIRED',
    });
  });

  it('schedules account deletion after valid password step-up', async () => {
    const user = await createVerifiedLocalUser();
    const authenticated = await loginFixtureUser(app, user);

    const response = await request(app)
      .delete('/api/security/delete-account')
      .set('Origin', TRUSTED_TEST_ORIGIN)
      .set('Authorization', `Bearer ${authenticated.accessToken}`)
      .send({
        confirmation: 'DELETE',
        currentPassword: user.password,
      });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: {
        deleted: true,
        deletionScheduled: true,
        recoveryWindowDays: 30,
      },
    });

    expect(response.body.data.scheduledDeletionAt).toEqual(expect.any(String));

    const storedUser = await User.findById(user.userId);

    expect(storedUser).toMatchObject({
      status: 'deactivated',
    });

    expect(storedUser?.deletionRequestedAt).toBeInstanceOf(Date);
    expect(storedUser?.scheduledDeletionAt).toBeInstanceOf(Date);
  });

  it('cancels scheduled account deletion when the user logs in again within 30 days', async () => {
    const user = await createVerifiedLocalUser();
    const authenticated = await loginFixtureUser(app, user);

    const deletionResponse = await request(app)
      .delete('/api/security/delete-account')
      .set('Origin', TRUSTED_TEST_ORIGIN)
      .set('Authorization', `Bearer ${authenticated.accessToken}`)
      .send({
        confirmation: 'DELETE',
        currentPassword: user.password,
      });

    expect(deletionResponse.status).toBe(200);

    const deactivatedUser = await User.findById(user.userId);

    expect(deactivatedUser).toMatchObject({
      status: 'deactivated',
    });

    expect(deactivatedUser?.deletionRequestedAt).toBeInstanceOf(Date);
    expect(deactivatedUser?.scheduledDeletionAt).toBeInstanceOf(Date);

    const reloginResponse = await request(app)
      .post('/api/auth/login')
      .set('Origin', TRUSTED_TEST_ORIGIN)
      .send({
        identifier: user.email,
        password: user.password,
      });

    expect(reloginResponse.status).toBe(200);
    expect(reloginResponse.body).toMatchObject({
      success: true,
      data: {
        user: {
          status: 'active',
        },
      },
    });

    const restoredUser = await User.findById(user.userId);

    expect(restoredUser).toMatchObject({
      status: 'active',
    });

    expect(restoredUser?.deletionRequestedAt ?? null).toBeNull();
    expect(restoredUser?.scheduledDeletionAt ?? null).toBeNull();
  });

  it('rejects login when the scheduled deletion recovery window has expired', async () => {
    const user = await createVerifiedLocalUser();

    await User.findByIdAndUpdate(user.userId, {
      $set: {
        status: 'deactivated',
        deletionRequestedAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000),
        scheduledDeletionAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    });

    const response = await request(app)
      .post('/api/auth/login')
      .set('Origin', TRUSTED_TEST_ORIGIN)
      .send({
        identifier: user.email,
        password: user.password,
      });

    expect(response.status).toBe(403);
    expect(response.body).toMatchObject({
      success: false,
      code: 'ACCOUNT_DEACTIVATED',
    });

    const expiredUser = await User.findById(user.userId);

    expect(expiredUser).toMatchObject({
      status: 'deactivated',
    });

    expect(expiredUser?.deletionRequestedAt).toBeInstanceOf(Date);
    expect(expiredUser?.scheduledDeletionAt).toBeInstanceOf(Date);
  });

  it('rejects roadmap generation when an active roadmap job already exists', async () => {
    const user = await createVerifiedLocalUser();
    const authenticated = await loginFixtureUser(app, user);

    await AIGenerationJob.create({
      userId: user.userId,
      jobType: 'roadmap',
      status: 'pending',
      inputData: {
        topic: 'Node.js',
        goal: 'Become interview ready',
        level: 'beginner',
      },
      totalSteps: 5,
      currentStep: 0,
      deletedAt: null,
    });

    const response = await request(app)
      .post('/api/onboarding/generate-roadmap')
      .set('Origin', TRUSTED_TEST_ORIGIN)
      .set('Authorization', `Bearer ${authenticated.accessToken}`)
      .send({
        topic: 'TypeScript',
        goal: 'Master backend interviews',
        level: 'beginner',
      });

    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({
      success: false,
      code: 'ROADMAP_JOB_ALREADY_ACTIVE',
    });
  });

  it('rejects roadmap generation after the hourly AI generation quota is exhausted', async () => {
    const user = await createVerifiedLocalUser();
    const authenticated = await loginFixtureUser(app, user);

    await aiJobQuotaCache.consume(
      'roadmap_generation',
      user.userId,
      AI_JOB_QUOTA_POLICIES.roadmapGeneration
    );
    await aiJobQuotaCache.consume(
      'roadmap_generation',
      user.userId,
      AI_JOB_QUOTA_POLICIES.roadmapGeneration
    );
    await aiJobQuotaCache.consume(
      'roadmap_generation',
      user.userId,
      AI_JOB_QUOTA_POLICIES.roadmapGeneration
    );

    const response = await request(app)
      .post('/api/onboarding/generate-roadmap')
      .set('Origin', TRUSTED_TEST_ORIGIN)
      .set('Authorization', `Bearer ${authenticated.accessToken}`)
      .send({
        topic: 'Security Engineering',
        goal: 'Learn secure backend development',
        level: 'intermediate',
      });

    expect(response.status).toBe(429);
    expect(response.body).toMatchObject({
      success: false,
      code: 'ROADMAP_GENERATION_QUOTA_EXCEEDED',
    });
  });
});
