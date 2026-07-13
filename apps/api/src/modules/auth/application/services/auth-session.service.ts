import type { IAuthSessionRepository } from '../../domain/repositories/auth-session.repository.interface';
import type { IAuthToken } from '../../domain/services/auth-token.interface';
import type { AuthRole } from '../../domain/value-objects/auth-role.vo';
import type { IRefreshTokenHasher } from '../../../../shared/security/refresh-token-hasher.interface';
import type { RequestMetaDTO, ITokenPairDTO } from '../auth.dto';

export interface IAuthSessionIssuer {
  issueTokenPair(userId: string, role: AuthRole, meta?: RequestMetaDTO): Promise<ITokenPairDTO>;
}

export class AuthSessionIssuer implements IAuthSessionIssuer {
  constructor(
    private readonly _authSessionRepository: IAuthSessionRepository,
    private readonly _authToken: IAuthToken,
    private readonly _refreshTokenHasher: IRefreshTokenHasher
  ) {}

  async issueTokenPair(
    userId: string,
    role: AuthRole,
    meta?: RequestMetaDTO
  ): Promise<ITokenPairDTO> {
    const refreshToken = this._authToken.generateRefreshToken();
    const refreshTokenHash = this._refreshTokenHasher.hash(refreshToken);

    const session = await this._authSessionRepository.saveSession({
      userId,
      refreshTokenHash,
      device: meta?.device,
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });
    const accessToken = this._authToken.generateAccessToken(userId, role, session.id);

    return {
      accessToken,
      refreshToken,
    };
  }
}
