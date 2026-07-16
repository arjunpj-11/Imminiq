import type { AuthRole } from '../../../domain/value-objects/auth-role.vo';
import type { TwoFactorStatus } from '../../../domain/value-objects/two-factor-status.vo';
import type { UserStatus } from '../../../domain/value-objects/user-status.vo';

export type MongoIdLike = {
  toString(): string;
};

export type MongoAuthUserRecord = {
  _id: MongoIdLike;
  fullName: string;
  username: string;
  email?: string;
  phone?: string;
  role: AuthRole;
  status: UserStatus;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  isPremium?: boolean;
  avatarUrl?: string | null;
  onboardingCompleted?: boolean;
  passwordHash?: string | null;
  scheduledDeletionAt?: Date | string | null;
  adminStatusReason?: string | null;
};

export type MongoOAuthAuthUserRecord = MongoAuthUserRecord & {
  provider?: string | null;
  providerId?: string | null;
};

export type MongoAuthSessionRecord = {
  _id: MongoIdLike;
  userId: MongoIdLike | string;
  refreshTokenHash?: string;
  expiresAt: Date;
  revokedAt?: Date | null;
  deletedAt?: Date | null;
  device?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type MongoTwoFactorAuthRecord = {
  _id: MongoIdLike;
  userId: MongoIdLike | string;
  status: TwoFactorStatus;
  totpSecretEncrypted: string;
  backupCodes?: Array<{
    codeHash: string;
    usedAt?: Date | null;
  }>;
};

export type MongooseObjectLike<T> = {
  toObject(): T;
};

export type MongoDuplicateKeyError = {
  code: 11000;
  keyPattern?: Record<string, unknown>;
  keyValue?: Record<string, unknown>;
};
