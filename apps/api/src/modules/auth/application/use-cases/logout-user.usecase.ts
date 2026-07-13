import type { IAuthSessionRepository } from '../../domain/repositories/auth-session.repository.interface';
import type { IRefreshTokenHasher } from '../../../../shared/security/refresh-token-hasher.interface';

export interface ILogoutUserUseCase {
  execute(refreshToken: string): Promise<void>;
}

export class LogoutUserUseCase implements ILogoutUserUseCase {
  constructor(
    private readonly _authRepository: IAuthSessionRepository,
    private readonly _refreshTokenHasher: IRefreshTokenHasher
  ) {}

  async execute(refreshToken: string): Promise<void> {
    const refreshTokenHash = this._refreshTokenHasher.hash(refreshToken);

    await this._authRepository.revokeSessionByRefreshTokenHash(refreshTokenHash);
  }
}
