import request from 'supertest'
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import type { Express } from 'express'

vi.mock(
  '../../../src/modules/security/infrastructure/gateways/security-email.gateway',
  () => ({
    securityEmailGateway: {
      sendEmailChangeVerification: vi.fn().mockResolvedValue(undefined),
      sendEmailChangeAlert: vi.fn().mockResolvedValue(undefined),
    },
  })
)

import { authRepository } from '../../../src/modules/auth/auth.repository'
import { AIGenerationJob } from '../../../src/infrastructure/database/models/ai-generation-job.model'
import {
  AI_JOB_QUOTA_POLICIES,
  aiJobQuotaCache,
} from '../../../src/infrastructure/cache/ai-job-quota.cache'
import {
  startSecurityHttpIntegrationRuntime,
  type SecurityHttpIntegrationRuntime,
} from '../../setup/security-http-integration-runtime'
import {
  createVerifiedLocalUser,
  loginFixtureUser,
  TRUSTED_TEST_ORIGIN,
} from '../../helpers/security-integration-fixtures'

let runtime: SecurityHttpIntegrationRuntime
let app: Express

describe('security-sensitive HTTP integration flows', () => {
  beforeAll(async () => {
    runtime = await startSecurityHttpIntegrationRuntime()
    app = runtime.app
  }, 60_000)

  beforeEach(async () => {
    await runtime.clearState()
  })

  afterAll(async () => {
    await runtime.stop()
  })

  it('rotates refresh tokens and detects reuse of the retired refresh cookie', async () => {
    const user = await createVerifiedLocalUser()
    const authenticated = await loginFixtureUser(app, user)

    const firstRefresh = await request(app)
      .post('/api/auth/refresh-token')
      .set('Origin', TRUSTED_TEST_ORIGIN)
      .set('Cookie', authenticated.cookieHeader)

    expect(firstRefresh.status).toBe(200)
    expect(firstRefresh.body?.data?.accessToken).toEqual(
      expect.any(String)
    )

    const reuseResponse = await request(app)
      .post('/api/auth/refresh-token')
      .set('Origin', TRUSTED_TEST_ORIGIN)
      .set('Cookie', authenticated.cookieHeader)

    expect(reuseResponse.status).toBe(401)
    expect(reuseResponse.body).toMatchObject({
      success: false,
      code: 'REFRESH_TOKEN_REUSE_DETECTED',
    })
  })

  it('accepts a password reset token once, rejects replay, and allows login with the new password', async () => {
    const user = await createVerifiedLocalUser({
      password: 'OldPassword123!',
    })

    await authRepository.saveOtp({
      email: user.email,
      otp: '123456',
      purpose: 'password_reset',
    })

    const verifyResetCode = await request(app)
      .post('/api/auth/verify-reset-code')
      .set('Origin', TRUSTED_TEST_ORIGIN)
      .send({
        identifier: user.email,
        otp: '123456',
      })

    expect(verifyResetCode.status).toBe(200)

    const resetToken =
      typeof verifyResetCode.body?.data?.resetToken === 'string'
        ? verifyResetCode.body.data.resetToken
        : ''

    expect(resetToken).toBeTruthy()

    const firstReset = await request(app)
      .post('/api/auth/reset-password')
      .set('Origin', TRUSTED_TEST_ORIGIN)
      .send({
        resetToken,
        newPassword: 'NewSecurePassword123!',
      })

    expect(firstReset.status).toBe(200)

    const replayReset = await request(app)
      .post('/api/auth/reset-password')
      .set('Origin', TRUSTED_TEST_ORIGIN)
      .send({
        resetToken,
        newPassword: 'AnotherSecurePassword123!',
      })

    expect(replayReset.status).toBe(400)
    expect(replayReset.body).toMatchObject({
      success: false,
      code: 'INVALID_RESET_TOKEN',
    })

    const newPasswordLogin = await request(app)
      .post('/api/auth/login')
      .set('Origin', TRUSTED_TEST_ORIGIN)
      .send({
        identifier: user.email,
        password: 'NewSecurePassword123!',
      })

    expect(newPasswordLogin.status).toBe(200)
  })

  it('requires password step-up before requesting an email change', async () => {
    const user = await createVerifiedLocalUser()
    const authenticated = await loginFixtureUser(app, user)

    const response = await request(app)
      .patch('/api/security/change-email')
      .set('Origin', TRUSTED_TEST_ORIGIN)
      .set('Authorization', `Bearer ${authenticated.accessToken}`)
      .send({
        newEmail: `changed_${Date.now()}@example.com`,
      })

    expect(response.status).toBe(400)
    expect(response.body).toMatchObject({
      success: false,
      code: 'STEP_UP_PASSWORD_REQUIRED',
    })
  })

  it('allows an email change request after valid password step-up', async () => {
    const user = await createVerifiedLocalUser()
    const authenticated = await loginFixtureUser(app, user)
    const newEmail = `changed_${Date.now()}@example.com`

    const response = await request(app)
      .patch('/api/security/change-email')
      .set('Origin', TRUSTED_TEST_ORIGIN)
      .set('Authorization', `Bearer ${authenticated.accessToken}`)
      .send({
        newEmail,
        currentPassword: user.password,
      })

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      success: true,
      data: {
        pendingEmail: newEmail,
        verificationSent: true,
      },
    })
  })

  it('requires password step-up before deleting an account', async () => {
    const user = await createVerifiedLocalUser()
    const authenticated = await loginFixtureUser(app, user)

    const response = await request(app)
      .delete('/api/security/delete-account')
      .set('Origin', TRUSTED_TEST_ORIGIN)
      .set('Authorization', `Bearer ${authenticated.accessToken}`)
      .send({
        confirmation: 'DELETE',
      })

    expect(response.status).toBe(400)
    expect(response.body).toMatchObject({
      success: false,
      code: 'STEP_UP_PASSWORD_REQUIRED',
    })
  })

  it('allows account deletion after valid password step-up', async () => {
    const user = await createVerifiedLocalUser()
    const authenticated = await loginFixtureUser(app, user)

    const response = await request(app)
      .delete('/api/security/delete-account')
      .set('Origin', TRUSTED_TEST_ORIGIN)
      .set('Authorization', `Bearer ${authenticated.accessToken}`)
      .send({
        confirmation: 'DELETE',
        currentPassword: user.password,
      })

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      success: true,
      data: {
        deleted: true,
      },
    })
  })

  it('rejects roadmap generation when an active roadmap job already exists', async () => {
    const user = await createVerifiedLocalUser()
    const authenticated = await loginFixtureUser(app, user)

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
    })

    const response = await request(app)
      .post('/api/onboarding/generate-roadmap')
      .set('Origin', TRUSTED_TEST_ORIGIN)
      .set('Authorization', `Bearer ${authenticated.accessToken}`)
      .send({
        topic: 'TypeScript',
        goal: 'Master backend interviews',
        level: 'beginner',
      })

    expect(response.status).toBe(409)
    expect(response.body).toMatchObject({
      success: false,
      code: 'ROADMAP_JOB_ALREADY_ACTIVE',
    })
  })

  it('rejects roadmap generation after the hourly AI generation quota is exhausted', async () => {
    const user = await createVerifiedLocalUser()
    const authenticated = await loginFixtureUser(app, user)

    await aiJobQuotaCache.consume(
      'roadmap_generation',
      user.userId,
      AI_JOB_QUOTA_POLICIES.roadmapGeneration
    )
    await aiJobQuotaCache.consume(
      'roadmap_generation',
      user.userId,
      AI_JOB_QUOTA_POLICIES.roadmapGeneration
    )
    await aiJobQuotaCache.consume(
      'roadmap_generation',
      user.userId,
      AI_JOB_QUOTA_POLICIES.roadmapGeneration
    )

    const response = await request(app)
      .post('/api/onboarding/generate-roadmap')
      .set('Origin', TRUSTED_TEST_ORIGIN)
      .set('Authorization', `Bearer ${authenticated.accessToken}`)
      .send({
        topic: 'Security Engineering',
        goal: 'Learn secure backend development',
        level: 'intermediate',
      })

    expect(response.status).toBe(429)
    expect(response.body).toMatchObject({
      success: false,
      code: 'ROADMAP_GENERATION_QUOTA_EXCEEDED',
    })
  })
})
