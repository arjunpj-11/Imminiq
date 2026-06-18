import { AuthApplicationError } from '../errors/auth-application.error'
import type { AuthUserRepositoryContract } from '../../domain/repositories/auth-user.repository.interface'
import type { AuthSessionRepositoryContract } from '../../domain/repositories/auth-session.repository.interface'
import type { PasswordHasherServiceContract } from '../../domain/services/password-hasher.service.interface'

type ChangePasswordRepository = AuthUserRepositoryContract & AuthSessionRepositoryContract

export class ChangePasswordUseCase {
  constructor(
    private readonly authRepository: ChangePasswordRepository,
    private readonly passwordHasher: PasswordHasherServiceContract
  ) {}

  async execute(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.authRepository.findById(userId)

    if (!user) {
      throw AuthApplicationError.notFound('User not found')
    }

    if (!user.passwordHash) {
      throw AuthApplicationError.oauthAccount('OAuth accounts cannot change password')
    }

    const valid = await this.passwordHasher.compare(
      currentPassword,
      user.passwordHash
    )

    if (!valid) {
      throw AuthApplicationError.wrongPassword('Current password is incorrect')
    }

    const passwordHash = await this.passwordHasher.hash(newPassword)

    await this.authRepository.updatePasswordHash(userId, passwordHash)
    await this.authRepository.revokeAllUserTokens(userId)
  }
}
