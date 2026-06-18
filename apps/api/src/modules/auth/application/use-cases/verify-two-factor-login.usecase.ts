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
    private readonly authRepository: TwoFactorLoginRepository,
    private readonly authRedirectService: AuthRedirectServiceContract,
    private readonly authTokenService: AuthTokenServiceContract,
    private readonly authAccountPolicy: AuthAccountPolicyContract,
    private readonly authSessionService: AuthSessionServiceContract,
    private readonly securityAttemptStore: SecurityAttemptStoreContract,
    private readonly twoFactorCodeVerifier: TwoFactorCodeVerifierContract,
    private readonly backupCodeNormalizer: BackupCodeNormalizerServiceContract,
    private readonly passwordHasher: PasswordHasherServiceContract,
    private readonly authUserMapper: AuthUserMapperContract
  ) {}

  async execute(
    challengeToken: string,
    payload: TwoFactorLoginVerifyPayload,
    meta?: RequestMeta
  ): Promise<AuthLoginSuccessResult> {
    const decoded =
      this.authTokenService.verifyTwoFactorChallengeToken(challengeToken)

    await this.assertTwoFactorLoginAllowed(decoded.userId)

    const user = await this.authRepository.findById(decoded.userId)

    if (!user) {
      await this.recordInvalidTwoFactorLogin(decoded.userId)

      throw AuthApplicationError.notFound('User not found')
    }

    this.authAccountPolicy.ensureUserCanAuthenticate(user)

    const twoFactor =
      await this.authRepository.findActiveTwoFactorForLogin(user.id)

    if (!twoFactor) {
      throw AuthApplicationError.twoFactorNotActive('Two-factor authentication is no longer active. Please sign in again.')
    }

    const code = payload.code.trim()
    let verified = false

    if (/^\d{6}$/.test(code)) {
      verified = await this.twoFactorCodeVerifier.verifyTotp({
        encryptedSecret: twoFactor.totpSecretEncrypted,
        token: code,
      })

      if (verified) {
        await this.authRepository.touchTwoFactorLastUsed(user.id)
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

    await this.securityAttemptStore.clear(
      TWO_FACTOR_LOGIN_SCOPE,
      decoded.userId
    )

    const userId = user.id

    const recoveredUser =
      await this.authRepository.cancelScheduledDeletionIfRecoverable(userId)

    const authenticatedUser = recoveredUser ?? user

    const redirectPath =
      await this.authRedirectService.resolveRedirectPath(userId)

    const tokens = await this.authSessionService.issueTokenPair(
      userId,
      user.role,
      meta
    )

    await this.authRepository.updateLastActive(userId)

    return {
      requiresTwoFactor: false,
      tokens,
      user: this.authUserMapper.toAuthUser(authenticatedUser),
      redirectPath,
    }
  }

  private async assertTwoFactorLoginAllowed(
    userId: string
  ): Promise<void> {
    const blocked = await this.securityAttemptStore.isBlocked(
      TWO_FACTOR_LOGIN_SCOPE,
      userId
    )

    if (!blocked) return

    throw AuthApplicationError.twoFactorLoginTemporarilyBlocked('Too many invalid two-factor attempts. Please sign in again later.')
  }

  private async recordInvalidTwoFactorLogin(
    userId: string
  ): Promise<void> {
    const result = await this.securityAttemptStore.recordFailure(
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
    const normalizedBackupCode = this.backupCodeNormalizer.normalize(code)

    for (let index = 0; index < backupCodes.length; index += 1) {
      const backupCode = backupCodes[index]

      if (!backupCode || backupCode.usedAt) {
        continue
      }

      const matches = await this.passwordHasher.compare(
        normalizedBackupCode,
        backupCode.codeHash
      )

      if (!matches) {
        continue
      }

      const markedUsed = await this.authRepository.markBackupCodeUsed(
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