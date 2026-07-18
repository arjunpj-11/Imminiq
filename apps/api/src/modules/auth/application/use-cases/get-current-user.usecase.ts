import { AuthApplicationError } from '../auth-application.error';
import type { IAuthUserRepository } from '../../domain/repositories/auth-user.repository.interface';
import type { AuthUserDTO } from '../auth.dto';
import type { IAuthUserMapper } from '../auth-user.mapper';
import type { IAuthAccountPolicy } from '../auth-account-policy.policy';

export interface IGetCurrentUserUseCase {
  execute(userId: string): Promise<AuthUserDTO>;
}

export class GetCurrentUserUseCase implements IGetCurrentUserUseCase {
  constructor(
    private readonly _authRepository: Pick<IAuthUserRepository, 'findById'>,
    private readonly _authAccountPolicy: IAuthAccountPolicy,
    private readonly _authUserMapper: IAuthUserMapper
  ) {}

  async execute(userId: string): Promise<AuthUserDTO> {
    const user = await this._authRepository.findById(userId);

    if (!user) {
      throw AuthApplicationError.notFound('User not found');
    }

    this._authAccountPolicy.ensureUserCanAuthenticate(user);

    return this._authUserMapper.toAuthUser(user);
  }
}
