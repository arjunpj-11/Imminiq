import type { SecuritySessionRepositoryContract } from '../../domain/repositories/security-session.repository.interface'
import type { SecurityUserRepositoryContract } from '../../domain/repositories/security-user.repository.interface'
import type { SecurityPasswordHasherServiceContract } from '../../domain/services/security-password-hasher.service.interface'
import type {
  ChangePasswordPayload,
  ChangePasswordResponseDto,
} from '../dtos/security.dto'
import { SecurityApplicationError } from '../errors/security-application.error'

type ChangeSecurityPasswordRepository = SecurityUserRepositoryContract &
  SecuritySessionRepositoryContract

export class ChangeSecurityPasswordUseCase {
  constructor(
    private readonly securityRepository: ChangeSecurityPasswordRepository,
    private readonly passwordHasher: SecurityPasswordHasherServiceContract,
  ) {}

  async execute(
    userId: string,
    payload: ChangePasswordPayload,
  ): Promise<ChangePasswordResponseDto> {
    const user = await this.securityRepository.findUserById(userId)

    if (!user) {
      throw SecurityApplicationError.notFound()
    }

    if (user.provider !== 'local' || !user.passwordHash) {
      throw SecurityApplicationError.passwordUnavailable()
    }

    const validPassword = await this.passwordHasher.compare(
      payload.currentPassword,
      user.passwordHash,
    )

    if (!validPassword) {
      throw SecurityApplicationError.wrongPassword()
    }

    const passwordHash = await this.passwordHasher.hash(payload.newPassword)
    const updatedUser = await this.securityRepository.updatePasswordHash(
      userId,
      passwordHash,
    )

    if (!updatedUser) {
      throw SecurityApplicationError.passwordChangeFailed()
    }

    await this.securityRepository.revokeAllSessions(userId)

    return { sessionsRevoked: true }
  }
}
