import type { AuthUserEntity } from '../../domain/entities/auth-user.entity';
import type { IAuthUserRepository } from '../../domain/repositories/auth-user.repository.interface';
import type { IAuthRedirectResolver } from '../../domain/services/auth-redirect.interface';
import type { AuthLoginSuccessResultDTO, RequestMetaDTO } from '../auth.dto';
import type { IAuthUserMapper } from '../auth-user.mapper';
import type { IAuthSessionIssuer } from './auth-session.service';

export interface IAuthLoginFinalizer {
  finalize(user: AuthUserEntity, meta?: RequestMetaDTO): Promise<AuthLoginSuccessResultDTO>;
}

export class AuthLoginFinalizer implements IAuthLoginFinalizer {
  constructor(
    private readonly _repository: Pick<
      IAuthUserRepository,
      'cancelScheduledDeletionIfRecoverable' | 'updateLastActive'
    >,
    private readonly _redirectResolver: IAuthRedirectResolver,
    private readonly _sessionIssuer: IAuthSessionIssuer,
    private readonly _userMapper: IAuthUserMapper
  ) {}

  async finalize(user: AuthUserEntity, meta?: RequestMetaDTO): Promise<AuthLoginSuccessResultDTO> {
    const authenticatedUser =
      (await this._repository.cancelScheduledDeletionIfRecoverable(user.id)) ?? user;
    const redirectPath = await this._redirectResolver.resolveRedirectPath(
      authenticatedUser.id,
      authenticatedUser.role
    );
    const tokens = await this._sessionIssuer.issueTokenPair(
      authenticatedUser.id,
      authenticatedUser.role,
      meta
    );

    await this._repository.updateLastActive(authenticatedUser.id);

    return {
      requiresTwoFactor: false,
      tokens,
      user: this._userMapper.toAuthUser(authenticatedUser),
      redirectPath,
    };
  }
}
