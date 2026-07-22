import { AuthApplicationError } from '../auth-application.error';
import type { IAuthUserRepository } from '../../domain/repositories/auth-user.repository.interface';
import type { IAuthTwoFactorRepository } from '../../domain/repositories/auth-two-factor.repository.interface';
import type { IAuthNotification } from '../../domain/services/auth-notification.interface';
import type { IPasswordHasher } from '../../domain/services/password-hasher.interface';
import type {
  SecurityAttemptScope,
  ISecurityAttemptStore,
} from '../../domain/services/security-attempt-store.interface';
import type { AuthLoginResultDTO, LoginPayloadDTO, RequestMetaDTO } from '../auth.dto';
import type { AuthRuntimePolicy } from '../../domain/auth-runtime-policy';
import type { IAuthAccountPolicy } from '../auth-account-policy.policy';
import type { IAuthLoginFinalizer } from '../services/auth-login-finalizer.service';
import type { IIdentifierNormalizer } from '../../domain/services/identifier-normalizer.interface';
import type { IAuthToken } from '../../domain/services/auth-token.interface';
import type { IModerationAppealToken } from '../../domain/services/moderation-appeal-token.interface';

type LoginRepository = Pick<
  IAuthUserRepository,
  'findByIdentifier'
> &
  Pick<IAuthTwoFactorRepository, 'hasActiveTwoFactor'>;

const LOGIN_SCOPE: SecurityAttemptScope = 'auth_login';

export interface ILoginUserUseCase {
  execute(payload: LoginPayloadDTO, meta?: RequestMetaDTO): Promise<AuthLoginResultDTO>;
}

export class LoginUserUseCase implements ILoginUserUseCase {
  constructor(
    private readonly _authRepository: LoginRepository,
    private readonly _authNotification: IAuthNotification,
    private readonly _identifierNormalizer: IIdentifierNormalizer,
    private readonly _authAccountPolicy: IAuthAccountPolicy,
    private readonly _loginFinalizer: IAuthLoginFinalizer,
    private readonly _authToken: IAuthToken,
    private readonly _passwordHasher: IPasswordHasher,
    private readonly _securityAttemptStore: ISecurityAttemptStore,
    private readonly _moderationAppealToken: IModerationAppealToken,
    private readonly _runtimePolicy: Pick<AuthRuntimePolicy, 'twoFactorChallengeTtlMinutes'>
  ) {}

  async execute(payload: LoginPayloadDTO, meta?: RequestMetaDTO): Promise<AuthLoginResultDTO> {
    const parsedIdentifier = this._identifierNormalizer.normalize(payload.identifier);

    await this.throwIfLoginTemporarilyBlocked(parsedIdentifier.value);

    const user = await this._authRepository.findByIdentifier(payload.identifier);

    if (!user) {
      await this.recordLoginFailure(parsedIdentifier.value);

      throw AuthApplicationError.invalidCredentials('Invalid credentials');
    }

    if (!user.passwordHash) {
      throw AuthApplicationError.oauthAccount(
        'This account uses social login. Please sign in with Google or GitHub.'
      );
    }

    const valid = await this._passwordHasher.compare(payload.password, user.passwordHash);

    if (!valid) {
      await this.recordLoginFailure(parsedIdentifier.value);

      throw AuthApplicationError.invalidCredentials('Invalid credentials');
    }

    try {
      this._authAccountPolicy.ensureUserCanAuthenticate(user);
    } catch (error) {
      if (error instanceof AuthApplicationError) {
        throw error.withData({
          appealToken: this._moderationAppealToken.create(user.id, parsedIdentifier.value),
        });
      }

      throw error;
    }

    await this._securityAttemptStore.clear(LOGIN_SCOPE, parsedIdentifier.value);

    if (parsedIdentifier.method === 'email' && !user.emailVerified) {
      await this._authNotification.sendVerificationOtp({
        email: parsedIdentifier.email!,
        method: 'email',
      });

      throw AuthApplicationError.emailNotVerified(
        'Please verify your email before signing in. A new OTP has been sent.'
      );
    }

    if (parsedIdentifier.method === 'phone' && !user.phoneVerified) {
      await this._authNotification.sendVerificationOtp({
        phone: parsedIdentifier.phone!,
        method: 'phone',
      });

      throw AuthApplicationError.phoneNotVerified(
        'Please verify your phone before signing in. A new OTP has been sent.'
      );
    }

    const userId = user.id;

    const twoFactorEnabled = await this._authRepository.hasActiveTwoFactor(userId);

    if (twoFactorEnabled) {
      return {
        requiresTwoFactor: true,
        challengeToken: this._authToken.generateTwoFactorChallengeToken(userId),
        challengeExpiresInMinutes: this._runtimePolicy.twoFactorChallengeTtlMinutes,
      };
    }

    return this._loginFinalizer.finalize(user, meta);
  }

  private async throwIfLoginTemporarilyBlocked(identifier: string): Promise<void> {
    const blocked = await this._securityAttemptStore.isBlocked(LOGIN_SCOPE, identifier);

    if (!blocked) return;

    const retryAfterSeconds = await this._securityAttemptStore.getRetryAfterSeconds(
      LOGIN_SCOPE,
      identifier
    );

    throw AuthApplicationError.loginTemporarilyBlocked(
      retryAfterSeconds > 0
        ? `Too many failed login attempts. Try again in about ${Math.ceil(
            retryAfterSeconds / 60
          )} minute(s).`
        : 'Too many failed login attempts. Please try again later.'
    );
  }

  private async recordLoginFailure(identifier: string): Promise<void> {
    const result = await this._securityAttemptStore.recordFailure(
      LOGIN_SCOPE,
      identifier,
      'authLogin'
    );

    if (result.blocked) {
      throw AuthApplicationError.loginTemporarilyBlocked(
        'Too many failed login attempts. Please try again later.'
      );
    }
  }
}
