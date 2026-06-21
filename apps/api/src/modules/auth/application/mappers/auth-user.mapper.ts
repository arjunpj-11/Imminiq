import type { AuthUserEntity } from '../../domain/entities/auth-user.entity'
import type { AuthUser } from '../dtos/auth.dto'

export interface AuthUserMapperContract {
  toAuthUser(user: AuthUserEntity): AuthUser
}

export class AuthUserMapper implements AuthUserMapperContract {
  toAuthUser(user: AuthUserEntity): AuthUser {
    return {
      _id: user.id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      isPremium: user.isPremium,
      avatarUrl: user.avatarUrl,
      onboardingCompleted: user.onboardingCompleted,
    }
  }
}
