import type { SecuritySessionRepositoryContract } from '../../domain/repositories/security-session.repository.interface'
import type { SecurityUserRepositoryContract } from '../../domain/repositories/security-user.repository.interface'
import type { SecurityPasswordHasherContract } from '../../domain/services/security-password-hasher.interface'
import type {
  ChangePasswordPayload,
  ChangePasswordResponseDto,
} from '../dtos/security.dto'
import { SecurityApplicationError } from '../errors/security-application.error'

type ChangeSecurityPasswordRepository =
  SecurityUserRepositoryContract & SecuritySessionRepositoryContract

export class ChangeSecurityPasswordUseCase {
  constructor(
    private readonly _securityRepository: ChangeSecurityPasswordRepository,
    private readonly _passwordHasher: SecurityPasswordHasherContract,
  ) {}

  async execute(
    userId: string,
    payload: ChangePasswordPayload,
  ): Promise<ChangePasswordResponseDto> {
    const user = await this._securityRepository.findUserById(userId)

    if (!user) {
      throw SecurityApplicationError.notFound()
    }

    if (user.provider !== 'local' || !user.passwordHash) {
      throw SecurityApplicationError.passwordUnavailable()
    }

    const validPassword = await this._passwordHasher.compare(
      payload.currentPassword,
      user.passwordHash,
    )

    if (!validPassword) {
      throw SecurityApplicationError.wrongPassword()
    }

    const passwordHash = await this._passwordHasher.hash(payload.newPassword)

    const updatedUser = await this._securityRepository.updatePasswordHash({
      userId,
      passwordHash,
    })

    if (!updatedUser) {
      throw SecurityApplicationError.passwordChangeFailed()
    }

    await this._securityRepository.revokeAllSessions(userId)

    return { sessionsRevoked: true }
  }
}