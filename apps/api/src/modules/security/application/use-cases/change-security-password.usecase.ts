import type { ISecuritySessionRepository } from '../../domain/repositories/security-session.repository.interface'
import type { ISecurityUserRepository } from '../../domain/repositories/security-user.repository.interface'
import type { ISecurityPasswordHasher } from '../../domain/services/security-password-hasher.interface'
import type {
  IChangePasswordPayloadDTO,
  IChangePasswordResponseDTO,
} from '../security.dto'
import { SecurityApplicationError } from '../security-application.error'

type ChangeSecurityPasswordRepository =
  ISecurityUserRepository & ISecuritySessionRepository

export interface IChangeSecurityPasswordUseCase {
  execute(userId: string, payload: IChangePasswordPayloadDTO): Promise<IChangePasswordResponseDTO>
}

export class ChangeSecurityPasswordUseCase implements IChangeSecurityPasswordUseCase {
  constructor(
    private readonly _securityRepository: ChangeSecurityPasswordRepository,
    private readonly _passwordHasher: ISecurityPasswordHasher,
  ) {}

  async execute(
    userId: string,
    payload: IChangePasswordPayloadDTO,
  ): Promise<IChangePasswordResponseDTO> {
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