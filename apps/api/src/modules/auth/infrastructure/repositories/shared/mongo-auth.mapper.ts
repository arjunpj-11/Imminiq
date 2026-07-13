import { AuthSessionEntity } from '../../../domain/entities/auth-session.entity';
import { AuthUserEntity } from '../../../domain/entities/auth-user.entity';
import { TwoFactorAuthEntity } from '../../../domain/entities/two-factor-auth.entity';
import { AuthDomainError } from '../../../domain/auth-domain.error';
import type {
  MongoAuthSessionRecord,
  MongoAuthUserRecord,
  MongoIdLike,
  MongoTwoFactorAuthRecord,
  MongooseObjectLike,
} from './mongo-auth.types';

export class MongoAuthMapper {
  toPlainRecord<T>(document: MongooseObjectLike<T>): T {
    return document.toObject();
  }

  toId(value: MongoIdLike | string): string {
    return typeof value === 'string' ? value : value.toString();
  }

  toAuthUserEntity(user: MongoAuthUserRecord | null): AuthUserEntity | null {
    if (!user) {
      return null;
    }

    return new AuthUserEntity({
      id: this.toId(user._id),
      fullName: user.fullName,
      username: user.username,
      role: user.role,
      status: user.status,
      emailVerified: Boolean(user.emailVerified),
      phoneVerified: Boolean(user.phoneVerified),
      isPremium: Boolean(user.isPremium),
      onboardingCompleted: Boolean(user.onboardingCompleted),
      ...(user.email !== undefined ? { email: user.email } : {}),
      ...(user.phone !== undefined ? { phone: user.phone } : {}),
      ...(user.avatarUrl !== undefined ? { avatarUrl: user.avatarUrl } : {}),
      ...(user.passwordHash !== undefined ? { passwordHash: user.passwordHash } : {}),
      ...(user.scheduledDeletionAt !== undefined
        ? { scheduledDeletionAt: user.scheduledDeletionAt }
        : {}),
    });
  }

  toAuthUserEntityOrThrow(user: MongoAuthUserRecord | null): AuthUserEntity {
    const entity = this.toAuthUserEntity(user);

    if (!entity) {
      throw new AuthDomainError('AUTH_USER_MAPPING_FAILED', 'Failed to map auth user');
    }

    return entity;
  }

  toAuthSessionEntity(session: MongoAuthSessionRecord | null): AuthSessionEntity | null {
    if (!session) {
      return null;
    }

    return new AuthSessionEntity({
      id: this.toId(session._id),
      userId: this.toId(session.userId),
      expiresAt: session.expiresAt,
      ...(session.refreshTokenHash !== undefined
        ? { refreshTokenHash: session.refreshTokenHash }
        : {}),
      ...(session.revokedAt !== undefined ? { revokedAt: session.revokedAt } : {}),
      ...(session.deletedAt !== undefined ? { deletedAt: session.deletedAt } : {}),
      ...(session.device !== undefined ? { device: session.device } : {}),
      ...(session.ipAddress !== undefined ? { ipAddress: session.ipAddress } : {}),
      ...(session.userAgent !== undefined ? { userAgent: session.userAgent } : {}),
      ...(session.createdAt !== undefined ? { createdAt: session.createdAt } : {}),
    });
  }

  toAuthSessionEntityOrThrow(session: MongoAuthSessionRecord | null): AuthSessionEntity {
    const entity = this.toAuthSessionEntity(session);

    if (!entity) {
      throw new AuthDomainError('AUTH_SESSION_MAPPING_FAILED', 'Failed to map auth session');
    }

    return entity;
  }

  toTwoFactorAuthEntity(twoFactor: MongoTwoFactorAuthRecord | null): TwoFactorAuthEntity | null {
    if (!twoFactor) {
      return null;
    }

    return new TwoFactorAuthEntity({
      id: this.toId(twoFactor._id),
      userId: this.toId(twoFactor.userId),
      status: twoFactor.status,
      totpSecretEncrypted: twoFactor.totpSecretEncrypted,
      backupCodes: twoFactor.backupCodes ?? [],
    });
  }
}
