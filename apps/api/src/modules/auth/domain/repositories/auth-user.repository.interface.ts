import type { AuthUserEntity } from '../entities/auth-user.entity';
import type { OAuthProvider } from '../value-objects/oauth-provider.vo';

export type CreateAuthUserInput = {
  fullName: string;
  email?: string;
  phone?: string;
  username: string;
  passwordHash: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
};

export type CreateOAuthUserInput = {
  fullName: string;
  email: string;
  username: string;
  avatarUrl?: string;
  provider: OAuthProvider;
  providerId: string;
};

export type UpdateAuthProfileInput = {
  fullName?: string;
  username?: string;
  avatarUrl?: string;
};

export type UpdateAuthUserInput = {
  fullName?: string;
  email?: string;
  phone?: string;
  username?: string;
  avatarUrl?: string;
  passwordHash?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  onboardingCompleted?: boolean;
  lastActiveAt?: Date;
  status?: AuthUserEntity['status'];
  scheduledDeletionAt?: Date | null;
};

export interface IAuthUserRepository {
  findByEmail(email: string): Promise<AuthUserEntity | null>;
  findByPhone(phone: string): Promise<AuthUserEntity | null>;
  findByIdentifier(identifier: string): Promise<AuthUserEntity | null>;
  findById(id: string): Promise<AuthUserEntity | null>;
  findByUsername(username: string): Promise<AuthUserEntity | null>;

  emailExists(email: string): Promise<boolean>;
  phoneExists(phone: string): Promise<boolean>;
  usernameExists(username: string): Promise<boolean>;

  createUser(data: CreateAuthUserInput): Promise<AuthUserEntity>;

  createOAuthUser(data: CreateOAuthUserInput): Promise<AuthUserEntity>;

  updateProfile(id: string, data: UpdateAuthProfileInput): Promise<AuthUserEntity | null>;

  updateUser(id: string, data: UpdateAuthUserInput): Promise<AuthUserEntity | null>;

  markEmailVerified(id: string): Promise<AuthUserEntity | null>;

  markPhoneVerified(id: string): Promise<AuthUserEntity | null>;

  updatePasswordHash(id: string, passwordHash: string): Promise<AuthUserEntity | null>;

  updateLastActive(id: string): Promise<AuthUserEntity | null>;

  cancelScheduledDeletionIfRecoverable(id: string): Promise<AuthUserEntity | null>;

  deleteUserById(id: string): Promise<AuthUserEntity | null>;
}
