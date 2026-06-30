import { AuthApplicationError } from '../errors/auth-application.error'
import type { AuthUserRepositoryContract } from '../../domain/repositories/auth-user.repository.interface'
import type { AuthTwoFactorRepositoryContract } from '../../domain/repositories/auth-two-factor.repository.interface'
import type { AuthRedirectServiceContract } from '../../domain/services/auth-redirect.service.interface'
import type { AuthTokenServiceContract } from '../../domain/services/auth-token.service.interface'
import type { PasswordHasherServiceContract } from '../../domain/services/password-hasher.service.interface'
import type {
  SecurityAttemptScope,
  SecurityAttemptStoreContract,
} from '../../domain/services/security-attempt-store.interface'
import type { TwoFactorCodeVerifierContract } from '../../domain/services/two-factor-code-verifier.interface'
import type {
  AuthLoginSuccessResult,
  RequestMeta,
  TwoFactorLoginVerifyPayload,
} from '../dtos/auth.dto'
import type { AuthUserMapperContract } from '../mappers/auth-user.mapper'
import type { AuthAccountPolicyContract } from '../policies/auth-account-policy.policy'
import type { AuthSessionServiceContract } from '../services/auth-session.service'
import type { BackupCodeNormalizerServiceContract } from '../services/backup-code-normalizer.service'

type TwoFactorLoginRepository =
  AuthUserRepositoryContract &
  AuthTwoFactorRepositoryContract

type BackupCodeRecord = {
  usedAt?: Date | null
  codeHash: string
}

const TWO_FACTOR_LOGIN_SCOPE: SecurityAttemptScope = 'auth_two_factor_login'

export class VerifyTwoFactorLoginUseCase {
  constructor(
    private readonly _authRepository: TwoFactorLoginRepository,
    private readonly _authRedirectService: AuthRedirectServiceContract,
    private readonly _authTokenService: AuthTokenServiceContract,
    private readonly _authAccountPolicy: AuthAccountPolicyContract,
    private readonly _authSessionService: AuthSessionServiceContract,
    private readonly _securityAttemptStore: SecurityAttemptStoreContract,
    private readonly _twoFactorCodeVerifier: TwoFactorCodeVerifierContract,
    private readonly _backupCodeNormalizer: BackupCodeNormalizerServiceContract,
    private readonly _passwordHasher: PasswordHasherServiceContract,
    private readonly _authUserMapper: AuthUserMapperContract
  ) {}

  async execute(
    challengeToken: string,
    payload: TwoFactorLoginVerifyPayload,
    meta?: RequestMeta
  ): Promise<AuthLoginSuccessResult> {
    const decoded =
      this._authTokenService.verifyTwoFactorChallengeToken(challengeToken)

    await this.assertTwoFactorLoginAllowed(decoded.userId)

    const user = await this._authRepository.findById(decoded.userId)

    if (!user) {
      await this.recordInvalidTwoFactorLogin(decoded.userId)

      throw AuthApplicationError.notFound('User not found')
    }

    this._authAccountPolicy.ensureUserCanAuthenticate(user)

    const twoFactor =
      await this._authRepository.findActiveTwoFactorForLogin(user.id)

    if (!twoFactor) {
      throw AuthApplicationError.twoFactorNotActive('Two-factor authentication is no longer active. Please sign in again.')
    }

    const code = payload.code.trim()
    let verified = false

    if (/^\d{6}$/.test(code)) {
      verified = await this._twoFactorCodeVerifier.verifyTotp({
        encryptedSecret: twoFactor.totpSecretEncrypted,
        token: code,
      })

      if (verified) {
        await this._authRepository.touchTwoFactorLastUsed(user.id)
      }
    }

    if (!verified) {
      verified = await this.verifyBackupCode(
        user.id,
        code,
        twoFactor.backupCodes
      )
    }

    if (!verified) {
      await this.recordInvalidTwoFactorLogin(decoded.userId)

      throw AuthApplicationError.invalidTwoFactorLoginCode('Invalid two-factor code')
    }

    await this._securityAttemptStore.clear(
      TWO_FACTOR_LOGIN_SCOPE,
      decoded.userId
    )

    const userId = user.id

    const recoveredUser =
      await this._authRepository.cancelScheduledDeletionIfRecoverable(userId)

    const authenticatedUser = recoveredUser ?? user

    const redirectPath =
      await this._authRedirectService.resolveRedirectPath(userId)

    const tokens = await this._authSessionService.issueTokenPair(
      userId,
      user.role,
      meta
    )

    await this._authRepository.updateLastActive(userId)

    return {
      requiresTwoFactor: false,
      tokens,
      user: this._authUserMapper.toAuthUser(authenticatedUser),
      redirectPath,
    }
  }

  private async assertTwoFactorLoginAllowed(
    userId: string
  ): Promise<void> {
    const blocked = await this._securityAttemptStore.isBlocked(
      TWO_FACTOR_LOGIN_SCOPE,
      userId
    )

    if (!blocked) return

    throw AuthApplicationError.twoFactorLoginTemporarilyBlocked('Too many invalid two-factor attempts. Please sign in again later.')
  }

  private async recordInvalidTwoFactorLogin(
    userId: string
  ): Promise<void> {
    const result = await this._securityAttemptStore.recordFailure(
      TWO_FACTOR_LOGIN_SCOPE,
      userId,
      'twoFactorVerification'
    )

    if (result.blocked) {
      throw AuthApplicationError.twoFactorLoginTemporarilyBlocked('Too many invalid two-factor attempts. Please sign in again later.')
    }
  }

  private async verifyBackupCode(
    userId: string,
    code: string,
    backupCodes: BackupCodeRecord[]
  ): Promise<boolean> {
    const normalizedBackupCode = this._backupCodeNormalizer.normalize(code)

    for (let index = 0; index < backupCodes.length; index += 1) {
      const backupCode = backupCodes[index]

      if (!backupCode || backupCode.usedAt) {
        continue
      }

      const matches = await this._passwordHasher.compare(
        normalizedBackupCode,
        backupCode.codeHash
      )

      if (!matches) {
        continue
      }

      const markedUsed = await this._authRepository.markBackupCodeUsed(
        userId,
        index
      )

      if (markedUsed) {
        return true
      }

      break
    }

    return false
  }
}