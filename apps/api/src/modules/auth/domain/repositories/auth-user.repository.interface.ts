import type { AuthUserEntity } from '../entities/auth-user.entity'
import type { OAuthProvider } from '../value-objects/oauth-provider.vo'

export interface AuthUserRepositoryContract {
  findByEmail(email: string): Promise<AuthUserEntity | null>
  findByPhone(phone: string): Promise<AuthUserEntity | null>
  findByIdentifier(identifier: string): Promise<AuthUserEntity | null>
  findById(id: string): Promise<AuthUserEntity | null>
  findByUsername(username: string): Promise<AuthUserEntity | null>

  emailExists(email: string): Promise<boolean>
  phoneExists(phone: string): Promise<boolean>
  usernameExists(username: string): Promise<boolean>

  createUser(data: {
    fullName: string
    email?: string
    phone?: string
    username: string
    passwordHash: string
  }): Promise<AuthUserEntity>

  createOAuthUser(data: {
    fullName: string
    email: string
    username: string
    avatarUrl?: string
    provider: OAuthProvider
    providerId: string
  }): Promise<AuthUserEntity>

  updateProfile(
    id: string,
    data: {
      fullName?: string
      username?: string
      avatarUrl?: string
    }
  ): Promise<AuthUserEntity | null>

  updateUser(id: string, data: Record<string, unknown>): Promise<AuthUserEntity | null>

  markEmailVerified(id: string): Promise<AuthUserEntity | null>
  markPhoneVerified(id: string): Promise<AuthUserEntity | null>
  updatePasswordHash(id: string, passwordHash: string): Promise<AuthUserEntity | null>
  updateLastActive(id: string): Promise<AuthUserEntity | null>
  cancelScheduledDeletionIfRecoverable(id: string): Promise<AuthUserEntity | null>
  deleteUserById(id: string): Promise<AuthUserEntity | null>
}
