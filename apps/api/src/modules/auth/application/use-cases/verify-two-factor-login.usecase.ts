import bcrypt from 'bcryptjs'
import { verify } from 'otplib'

import { authRepository } from '../../auth.repository'
import { ApiError } from '../../../../shared/utils/ApiError'
import { decryptTotpSecret } from '../../../security/two-factor-secret.util'
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
import { resolveRedirectPath } from '../services/auth-redirect.service'
import { formatAuthUser } from '../services/auth-user-formatter.service'
import { normalizeBackupCode } from '../services/backup-code.service'

export class VerifyTwoFactorLoginUseCase {
  async execute(
    challengeToken: string,
    payload: TwoFactorLoginVerifyPayload,
    meta?: RequestMeta
  ): Promise<AuthLoginSuccessResult> {
    const decoded = verifyTwoFactorChallengeToken(challengeToken)

    const user = await authRepository.findById(decoded.userId)

    if (!user) {
      throw new ApiError(404, 'User not found', 'NOT_FOUND')
    }

    ensureUserCanAuthenticate(user)

    const twoFactor =
      await authRepository.findActiveTwoFactorForLogin(user._id.toString())

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
        await authRepository.touchTwoFactorLastUsed(user._id.toString())
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

        const markedUsed = await authRepository.markBackupCodeUsed(
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
      throw new ApiError(
        400,
        'Invalid two-factor code',
        'INVALID_TWO_FACTOR_LOGIN_CODE'
      )
    }

    const userId = user._id.toString()
    const redirectPath = await resolveRedirectPath(userId)

    const tokens = await issueTokenPair(
      userId,
      user.role,
      meta
    )

    await authRepository.updateLastActive(userId)

    return {
      requiresTwoFactor: false,
      tokens,
      user: formatAuthUser(user),
      redirectPath,
    }
  }
}
