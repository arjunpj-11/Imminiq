import bcrypt from 'bcryptjs'
import { verify } from 'otplib'

import type { AuthRepositoryContract } from '../../domain/repositories/auth.repository.interface'
import type { AuthRedirectServiceContract } from '../../domain/services/auth-redirect.service.interface'
import { ApiError } from '../../../../shared/utils/ApiError'
import {
  SECURITY_ATTEMPT_POLICIES,
  securityAttemptCache,
} from '../../../../infrastructure/cache/security-attempt.cache'
import { decryptTotpSecret } from '../../../security/infrastructure/crypto/two-factor-secret.crypto'
import type {
  AuthLoginSuccessResult,
  RequestMeta,
  TwoFactorLoginVerifyPayload,
} from '../../domain/types/auth.types'
import { ensureUserCanAuthenticate } from '../services/auth-account-policy.service'
import {
  issueTokenPair,
  verifyTwoFactorChallengeToken,
} from '../services/auth-token.service'
import { formatAuthUser } from '../services/auth-user-formatter.service'
import { normalizeBackupCode } from '../services/backup-code.service'

const TWO_FACTOR_LOGIN_SCOPE = 'auth_two_factor_login' as const

const assertTwoFactorLoginAllowed = async (
  userId: string
) => {
  const blocked = await securityAttemptCache.isBlocked(
    TWO_FACTOR_LOGIN_SCOPE,
    userId
  )

  if (!blocked) return

  throw new ApiError(
    429,
    'Too many invalid two-factor attempts. Please sign in again later.',
    'TWO_FACTOR_LOGIN_TEMPORARILY_BLOCKED'
  )
}

const recordInvalidTwoFactorLogin = async (
  userId: string
) => {
  const result = await securityAttemptCache.recordFailure(
    TWO_FACTOR_LOGIN_SCOPE,
    userId,
    SECURITY_ATTEMPT_POLICIES.twoFactorVerification
  )

  if (result.blocked) {
    throw new ApiError(
      429,
      'Too many invalid two-factor attempts. Please sign in again later.',
      'TWO_FACTOR_LOGIN_TEMPORARILY_BLOCKED'
    )
  }
}

export class VerifyTwoFactorLoginUseCase {
  constructor(
    private readonly authRepository: AuthRepositoryContract,
    private readonly authRedirectService: AuthRedirectServiceContract
  ) {}

  async execute(
    challengeToken: string,
    payload: TwoFactorLoginVerifyPayload,
    meta?: RequestMeta
  ): Promise<AuthLoginSuccessResult> {
    const decoded = verifyTwoFactorChallengeToken(challengeToken)

    await assertTwoFactorLoginAllowed(decoded.userId)

    const user = await this.authRepository.findById(decoded.userId)

    if (!user) {
      await recordInvalidTwoFactorLogin(decoded.userId)

      throw new ApiError(404, 'User not found', 'NOT_FOUND')
    }

    ensureUserCanAuthenticate(user)

    const twoFactor =
      await this.authRepository.findActiveTwoFactorForLogin(user._id.toString())

    if (!twoFactor) {
      throw new ApiError(
        401,
        'Two-factor authentication is no longer active. Please sign in again.',
        'TWO_FACTOR_NOT_ACTIVE'
      )
    }

    const code = payload.code.trim()
    let verified = false

    if (/^\d{6}$/.test(code)) {
      const secret = decryptTotpSecret(twoFactor.totpSecretEncrypted)

      const result = await verify({
        secret,
        token: code,
      })

      if (result.valid) {
        verified = true
        await this.authRepository.touchTwoFactorLastUsed(user._id.toString())
      }
    }

    if (!verified) {
      const normalizedBackupCode = normalizeBackupCode(code)

      for (let index = 0; index < twoFactor.backupCodes.length; index += 1) {
        const backupCode = twoFactor.backupCodes[index]

        if (backupCode.usedAt) {
          continue
        }

        const matches = await bcrypt.compare(
          normalizedBackupCode,
          backupCode.codeHash
        )

        if (!matches) {
          continue
        }

        const markedUsed = await this.authRepository.markBackupCodeUsed(
          user._id.toString(),
          index
        )

        if (markedUsed) {
          verified = true
        }

        break
      }
    }

    if (!verified) {
      await recordInvalidTwoFactorLogin(decoded.userId)

      throw new ApiError(
        400,
        'Invalid two-factor code',
        'INVALID_TWO_FACTOR_LOGIN_CODE'
      )
    }

    await securityAttemptCache.clear(
      TWO_FACTOR_LOGIN_SCOPE,
      decoded.userId
    )

    const userId = user._id.toString()

    const recoveredUser =
      await this.authRepository.cancelScheduledDeletionIfRecoverable(userId)

    const authenticatedUser = recoveredUser ?? user

    const redirectPath =
      await this.authRedirectService.resolveRedirectPath(userId)

    const tokens = await issueTokenPair(
      this.authRepository,
      userId,
      user.role,
      meta
    )

    await this.authRepository.updateLastActive(userId)

    return {
      requiresTwoFactor: false,
      tokens,
      user: formatAuthUser(authenticatedUser),
      redirectPath,
    }
  }
}
