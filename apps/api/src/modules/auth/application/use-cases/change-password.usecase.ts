import { AuthApplicationError } from '../errors/auth-application.error'
import type { AuthSessionRepositoryContract } from '../../domain/repositories/auth-session.repository.interface'
import type { AuthUserRepositoryContract } from '../../domain/repositories/auth-user.repository.interface'
import type { PasswordHasherServiceContract } from '../../domain/services/password-hasher.service.interface'

type ChangePasswordRepository =
  AuthUserRepositoryContract & AuthSessionRepositoryContract

export class ChangePasswordUseCase {
  constructor(
    private readonly _authRepository: ChangePasswordRepository,
    private readonly _passwordHasher: PasswordHasherServiceContract
  ) {}

  async execute(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await this._authRepository.findById(userId)

    if (!user) {
      throw AuthApplicationError.notFound('User not found')
    }

    if (!user.passwordHash) {
      throw AuthApplicationError.oauthAccount(
        'OAuth accounts cannot change password'
      )
    }

    const valid = await this._passwordHasher.compare(
      currentPassword,
      user.passwordHash
    )

    if (!valid) {
      throw AuthApplicationError.wrongPassword('Current password is incorrect')
    }

    const passwordHash = await this._passwordHasher.hash(newPassword)

    await this._authRepository.updatePasswordHash(userId, passwordHash)
    await this._authRepository.revokeAllUserSessions(userId)
  }
}