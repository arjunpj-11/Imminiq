import { AuthApplicationError } from '../auth-application.error';
import type { IAuthSessionRepository } from '../../domain/repositories/auth-session.repository.interface';
import type { IAuthUserRepository } from '../../domain/repositories/auth-user.repository.interface';
import type { IAuthToken } from '../../domain/services/auth-token.interface';
import type { IRetiredRefreshTokenStore } from '../../domain/services/retired-refresh-token-store.interface';
import type { IAuthSecurityAuditLogger } from '../../domain/services/security-audit-logger.interface';
import type { RequestMetaDTO, TokenPairDTO } from '../auth.dto';
import type { IAuthAccountPolicy } from '../auth-account-policy.policy';
import type { IRefreshTokenHasher } from '../../../../shared/security/refresh-token-hasher.interface';

type RefreshTokensRepository = Pick<IAuthUserRepository, 'findById'> &
  Pick<
    IAuthSessionRepository,
    'findSessionByRefreshTokenHash' | 'revokeAllUserSessions' | 'rotateRefreshTokenInSameSession'
  >;

export interface IRefreshAuthTokensUseCase {
  execute(refreshToken: string, meta?: RequestMetaDTO): Promise<TokenPairDTO>;
}

export class RefreshAuthTokensUseCase implements IRefreshAuthTokensUseCase {
  constructor(
    private readonly _authRepository: RefreshTokensRepository,
    private readonly _authToken: IAuthToken,
    private readonly _retiredRefreshTokenStore: IRetiredRefreshTokenStore,
    private readonly _authSecurityAuditLogger: IAuthSecurityAuditLogger,
    private readonly _authAccountPolicy: IAuthAccountPolicy,
    private readonly _refreshTokenHasher: IRefreshTokenHasher
  ) {}

  async execute(refreshToken: string, meta?: RequestMetaDTO): Promise<TokenPairDTO> {
    const refreshTokenHash = this._refreshTokenHasher.hash(refreshToken);

    const tokenRecord = await this._authRepository.findSessionByRefreshTokenHash(refreshTokenHash);

    if (!tokenRecord) {
      const retired = await this._retiredRefreshTokenStore.findByRawToken(refreshToken);

      if (retired) {
        await this._authRepository.revokeAllUserSessions(retired.userId);

        await this._authSecurityAuditLogger.record({
          userId: retired.userId,
          eventType: 'REFRESH_TOKEN_REUSE_DETECTED',
          outcome: 'detected',
          ipAddress: meta?.ipAddress,
          userAgent: meta?.userAgent,
          metadata: {
            sessionId: retired.sessionId,
          },
        });

        throw AuthApplicationError.refreshTokenReuseDetected(
          'Refresh token reuse detected. Please sign in again.'
        );
      }

      throw AuthApplicationError.unauthorized('Invalid refresh token');
    }

    const user = await this._authRepository.findById(tokenRecord.userId);

    if (!user) {
      throw AuthApplicationError.unauthorized('User not found');
    }

    this._authAccountPolicy.ensureUserCanAuthenticate(user);

    const accessToken = this._authToken.generateAccessToken(user.id, user.role, tokenRecord.id);

    const newRefreshToken = this._authToken.generateRefreshToken();
    const newRefreshTokenHash = this._refreshTokenHasher.hash(newRefreshToken);

    await this._retiredRefreshTokenStore.retire({
      refreshTokenHash,
      userId: tokenRecord.userId,
      sessionId: tokenRecord.id,
      expiresAt: tokenRecord.expiresAt,
    });

    const rotatedSession = await this._authRepository.rotateRefreshTokenInSameSession({
      sessionId: tokenRecord.id,
      newRefreshTokenHash,
      meta,
    });

    if (!rotatedSession) {
      throw AuthApplicationError.sessionRefreshFailed('Unable to refresh session');
    }

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
}
