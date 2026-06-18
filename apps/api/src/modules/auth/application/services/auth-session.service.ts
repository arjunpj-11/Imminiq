import type { AuthSessionRepositoryContract } from '../../domain/repositories/auth-session.repository.interface'
import type { AuthTokenServiceContract } from '../../domain/services/auth-token.service.interface'
import type { AuthRole } from '../../domain/value-objects/auth-role.vo'
import type { RequestMeta, TokenPair } from '../dtos/auth.dto'

export interface AuthSessionServiceContract {
  issueTokenPair(
    userId: string,
    role: AuthRole,
    meta?: RequestMeta
  ): Promise<TokenPair>
}

export class AuthSessionService implements AuthSessionServiceContract {
  constructor(
    private readonly authSessionRepository: AuthSessionRepositoryContract,
    private readonly authTokenService: AuthTokenServiceContract
  ) {}

  async issueTokenPair(
    userId: string,
    role: AuthRole,
    meta?: RequestMeta
  ): Promise<TokenPair> {
    const accessToken = this.authTokenService.generateAccessToken(userId, role)
    const refreshToken = this.authTokenService.generateRefreshToken()

    await this.authSessionRepository.saveRefreshToken({
      userId,
      refreshToken,
      device: meta?.device,
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    })

    return {
      accessToken,
      refreshToken,
    }
  }
}
