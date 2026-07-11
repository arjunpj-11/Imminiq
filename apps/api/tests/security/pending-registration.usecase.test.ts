import { describe, expect, it, vi } from 'vitest'

import { PENDING_REGISTRATION_EXPIRES_SECONDS } from '../../src/modules/auth/domain/constants/auth.constants'
import { AuthUserEntity } from '../../src/modules/auth/domain/entities/auth-user.entity'
import type { IAuthUserRepository } from '../../src/modules/auth/domain/repositories/auth-user.repository.interface'
import type { IAuthNotification } from '../../src/modules/auth/domain/services/auth-notification.interface'
import type { IOtpStore } from '../../src/modules/auth/domain/services/otp-store.interface'
import type { IPasswordHasher } from '../../src/modules/auth/domain/services/password-hasher.interface'
import type { IPendingRegistrationStore } from '../../src/modules/auth/domain/services/pending-registration-store.interface'
import type { IPhoneOtpProvider } from '../../src/modules/auth/domain/services/phone-otp-provider.interface'
import type { IPhoneOtpSessionStore } from '../../src/modules/auth/domain/services/phone-otp-session-store.interface'
import type { ISecurityAttemptStore } from '../../src/modules/auth/domain/services/security-attempt-store.interface'
import { IdentifierNormalizer } from '../../src/modules/auth/application/services/identifier-normalizer.service'
import type { IUsernameGenerator } from '../../src/modules/auth/application/services/username-generator.service'
import { RegisterUserUseCase } from '../../src/modules/auth/application/use-cases/register-user.usecase'
import { VerifyAccountUseCase } from '../../src/modules/auth/application/use-cases/verify-account.usecase'

const createRepository = () => {
  const createUser = vi.fn(async (input: {
    fullName: string
    email?: string
    phone?: string
    username: string
    passwordHash: string
    emailVerified?: boolean
    phoneVerified?: boolean
  }) => {
    return new AuthUserEntity({
      id: 'created-user-id',
      fullName: input.fullName,
      username: input.username,
      email: input.email,
      phone: input.phone,
      role: 'user',
      status: 'active',
      emailVerified: input.emailVerified ?? false,
      phoneVerified: input.phoneVerified ?? false,
      isPremium: false,
      onboardingCompleted: false,
      passwordHash: input.passwordHash,
    })
  })

  const repository = {
    findByEmail: vi.fn(async () => null),
    findByPhone: vi.fn(async () => null),
    findByIdentifier: vi.fn(async () => null),
    createUser,
    markEmailVerified: vi.fn(),
    markPhoneVerified: vi.fn(),
  } as unknown as IAuthUserRepository

  return { repository, createUser }
}

const createPendingStore = () => {
  const records = new Map<string, {
    fullName: string
    email?: string
    phone?: string
    passwordHash: string
  }>()

  const save = vi.fn(async (
    identifier: string,
    registration: {
      fullName: string
      email?: string
      phone?: string
      passwordHash: string
    }
  ) => {
    records.set(identifier, registration)
  })

  const deleteRegistration = vi.fn(async (identifier: string) => {
    records.delete(identifier)
  })

  const store = {
    save,
    get: vi.fn(async (identifier: string) => records.get(identifier) ?? null),
    exists: vi.fn(async (identifier: string) => records.has(identifier)),
    delete: deleteRegistration,
  } as IPendingRegistrationStore

  return { records, store, save, deleteRegistration }
}

describe('pending registration flow', () => {
  it('stores a password hash in Redis state without creating a Mongo user', async () => {
    const { repository, createUser } = createRepository()
    const { store, save } = createPendingStore()
    const sendVerificationOtp = vi.fn(async () => undefined)

    const notification = {
      sendVerificationOtp,
      sendPasswordResetOtp: vi.fn(),
      resendOtp: vi.fn(),
    } as IAuthNotification

    const passwordHasher = {
      hash: vi.fn(async () => 'secure-password-hash'),
      compare: vi.fn(),
    } as IPasswordHasher

    const useCase = new RegisterUserUseCase(
      repository,
      notification,
      new IdentifierNormalizer(),
      passwordHasher,
      store
    )

    const result = await useCase.execute({
      fullName: 'Pending User',
      identifier: 'Pending.User@Example.com',
      password: 'PlaintextPassword123!',
    })

    expect(createUser).not.toHaveBeenCalled()
    expect(save).toHaveBeenCalledWith(
      'pending.user@example.com',
      {
        fullName: 'Pending User',
        email: 'pending.user@example.com',
        phone: undefined,
        passwordHash: 'secure-password-hash',
      },
      PENDING_REGISTRATION_EXPIRES_SECONDS
    )
    expect(sendVerificationOtp).toHaveBeenCalledOnce()
    expect(result).toEqual({
      verificationTarget: 'pending.user@example.com',
      verificationMethod: 'email',
    })
  })

  it('creates an already-verified Mongo user only after a valid OTP', async () => {
    const { repository, createUser } = createRepository()
    const { records, store, deleteRegistration } = createPendingStore()
    records.set('pending.user@example.com', {
      fullName: 'Pending User',
      email: 'pending.user@example.com',
      passwordHash: 'secure-password-hash',
    })

    const securityAttempts = {
      isBlocked: vi.fn(async () => false),
      getRetryAfterSeconds: vi.fn(async () => 0),
      recordFailure: vi.fn(async () => ({ blocked: false })),
      clear: vi.fn(async () => undefined),
    } as ISecurityAttemptStore

    const otpStore = {
      saveOtp: vi.fn(),
      verifyOtp: vi.fn(async () => true),
    } as IOtpStore

    const phoneOtpProvider = {
      sendOtp: vi.fn(),
      verifyOtp: vi.fn(),
    } as IPhoneOtpProvider

    const phoneOtpSessionStore = {
      saveVerificationId: vi.fn(),
      getVerificationId: vi.fn(),
      deleteVerificationId: vi.fn(),
    } as IPhoneOtpSessionStore

    const usernameGenerator = {
      generateRegistrationUsername: vi.fn(async () => 'pending_user'),
      generateUsername: vi.fn(),
      generateUniqueUsernameFromSource: vi.fn(),
    } as IUsernameGenerator

    const useCase = new VerifyAccountUseCase(
      repository,
      new IdentifierNormalizer(),
      securityAttempts,
      phoneOtpProvider,
      phoneOtpSessionStore,
      otpStore,
      store,
      usernameGenerator
    )

    await useCase.execute('pending.user@example.com', '123456')

    expect(createUser).toHaveBeenCalledWith({
      fullName: 'Pending User',
      email: 'pending.user@example.com',
      passwordHash: 'secure-password-hash',
      username: 'pending_user',
      emailVerified: true,
      phoneVerified: false,
    })
    expect(deleteRegistration).toHaveBeenCalledWith(
      'pending.user@example.com'
    )
    expect(records.has('pending.user@example.com')).toBe(false)
    expect(securityAttempts.clear).toHaveBeenCalledOnce()
  })
})
