import type { AuthUserEntity } from '../domain/entities/auth-user.entity';
import type { AuthUserDTO } from './auth.dto';

export interface IAuthUserMapper {
  toAuthUser(user: AuthUserEntity): AuthUserDTO;
}

export class AuthUserMapper implements IAuthUserMapper {
  toAuthUser(user: AuthUserEntity): AuthUserDTO {
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
    };
  }
}
