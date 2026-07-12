import type { ISecuritySessionRepository } from '../../domain/repositories/security-session.repository.interface'
import type { ISecurityTwoFactorRepository } from '../../domain/repositories/security-two-factor.repository.interface'
import type { ISecurityUserRepository } from '../../domain/repositories/security-user.repository.interface'
import type { ISecurityOverviewDTO } from '../security.dto'
import { SecurityApplicationError } from '../security-application.error'
import type { ISecurityMapper } from '../security.mapper'
import type { ICurrentSessionResolver } from '../services/current-session.service'

type SecurityOverviewRepository = ISecurityUserRepository &
  ISecuritySessionRepository &
  ISecurityTwoFactorRepository

export interface IGetSecurityOverviewUseCase {
  execute(userId: string, refreshToken?: string): Promise<ISecurityOverviewDTO>
}

export class GetSecurityOverviewUseCase implements IGetSecurityOverviewUseCase {
  constructor(
    private readonly _securityRepository: SecurityOverviewRepository,
    private readonly _currentSessionResolver: ICurrentSessionResolver,
    private readonly _securityMapper: ISecurityMapper,
  ) {}

  async execute(
    userId: string,
    refreshToken?: string,
  ): Promise<ISecurityOverviewDTO> {
    const user = await this._securityRepository.findUserById(userId)

    if (!user) {
      throw SecurityApplicationError.notFound()
    }

    const sessions = await this._securityRepository.findActiveSessions(userId)
    const currentSessionId =
      await this._currentSessionResolver.getCurrentSessionId(refreshToken)
    const twoFactor =
      await this._securityRepository.findTwoFactorByUserId(userId)

    return {
      email: user.email ?? '',
      emailVerified: user.emailVerified,
      pendingEmail: user.pendingEmail,
      authProvider: user.provider,
      canChangePassword: user.provider === 'local',
      twoFactorEnabled: twoFactor?.status === 'active',
      activeSessions: sessions.map((session) =>
        this._securityMapper.toSessionDto(session, currentSessionId),
      ),
      passwordLastChangedAt: null,
    }
  }
}
