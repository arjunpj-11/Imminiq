import { AuthApplicationError } from '../auth-application.error';
import type { IAuthUserRepository } from '../../domain/repositories/auth-user.repository.interface';
import type { IAuthTwoFactorRepository } from '../../domain/repositories/auth-two-factor.repository.interface';
import type { IAuthToken } from '../../domain/services/auth-token.interface';
import type { AuthLoginResultDTO, OAuthLoginUserDTO, RequestMetaDTO } from '../auth.dto';
import type { AuthRuntimePolicy } from '../../domain/auth-runtime-policy';
import type { IAuthAccountPolicy } from '../auth-account-policy.policy';
import type { IAuthLoginFinalizer } from '../services/auth-login-finalizer.service';

type OAuthLoginRepository = Pick<
  IAuthUserRepository,
  'findById'
> &
  Pick<IAuthTwoFactorRepository, 'hasActiveTwoFactor'>;

export interface IHandleOAuthLoginUseCase {
  execute(user: OAuthLoginUserDTO, meta?: RequestMetaDTO): Promise<AuthLoginResultDTO>;
}

export class HandleOAuthLoginUseCase implements IHandleOAuthLoginUseCase {
  constructor(
    private readonly _authRepository: OAuthLoginRepository,
    private readonly _authToken: IAuthToken,
    private readonly _authAccountPolicy: IAuthAccountPolicy,
    private readonly _loginFinalizer: IAuthLoginFinalizer,
    private readonly _runtimePolicy: Pick<AuthRuntimePolicy, 'twoFactorChallengeTtlMinutes'>
  ) {}

  async execute(user: OAuthLoginUserDTO, meta?: RequestMetaDTO): Promise<AuthLoginResultDTO> {
    const userId = this.resolveOAuthUserId(user);

    const dbUser = await this._authRepository.findById(userId);

    if (!dbUser) {
      throw AuthApplicationError.notFound('User not found');
    }

    this._authAccountPolicy.ensureUserCanAuthenticate(dbUser);

    const twoFactorEnabled = await this._authRepository.hasActiveTwoFactor(userId);

    if (twoFactorEnabled) {
      return {
        requiresTwoFactor: true,
        challengeToken: this._authToken.generateTwoFactorChallengeToken(userId),
        challengeExpiresInMinutes: this._runtimePolicy.twoFactorChallengeTtlMinutes,
      };
    }

    return this._loginFinalizer.finalize(dbUser, meta);
  }

  private resolveOAuthUserId(user: OAuthLoginUserDTO): string {
    if (typeof user._id === 'string') {
      return user._id;
    }

    if (user._id) {
      return user._id.toString();
    }

    if (user.id) {
      return user.id;
    }

    throw AuthApplicationError.notFound('User not found');
  }
}
