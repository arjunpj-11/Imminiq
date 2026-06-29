import { SecuritySessionEntity } from '../../../domain/entities/security-session.entity'
import { SecurityUserEntity } from '../../../domain/entities/security-user.entity'
import { TwoFactorEntity } from '../../../domain/entities/two-factor.entity'
import type { AuthProvider } from '../../../domain/value-objects/auth-provider.vo'
import type { TwoFactorStatus } from '../../../domain/value-objects/two-factor-status.vo'
import type {
  MongoIdLike,
  MongoSecuritySessionRecord,
  MongoSecurityUserRecord,
  MongoTwoFactorRecord,
} from './mongo-security.types'

export class MongoSecurityMapper {
  toId(value: MongoIdLike | string): string {
    return typeof value === 'string' ? value : value.toString()
  }

  toSecurityUserEntity(
    user: MongoSecurityUserRecord | null,
  ): SecurityUserEntity | null {
    if (!user) {
      return null
    }

    return new SecurityUserEntity({
      id: this.toId(user._id),
      email: user.email,
      emailVerified: Boolean(user.emailVerified),
      pendingEmail: user.pendingEmail,
      provider: this.toAuthProvider(user.provider),
      fullName: user.fullName ?? '',
      username: user.username ?? '',
      passwordHash: user.passwordHash,
    })
  }

  toSecuritySessionEntity(
    session: MongoSecuritySessionRecord,
  ): SecuritySessionEntity {
    return new SecuritySessionEntity({
      id: this.toId(session._id),
      device: session.device,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      updatedAt: session.updatedAt,
    })
  }

  toTwoFactorEntity(
    twoFactor: MongoTwoFactorRecord | null,
  ): TwoFactorEntity | null {
    if (!twoFactor) {
      return null
    }

    return new TwoFactorEntity({
      id: twoFactor._id ? this.toId(twoFactor._id) : null,
      status: this.toTwoFactorStatus(twoFactor.status),
      totpSecretEncrypted: twoFactor.totpSecretEncrypted,
    })
  }

  private toAuthProvider(provider?: AuthProvider | string): AuthProvider {
    if (provider === 'google' || provider === 'github') {
      return provider
    }

    return 'local'
  }

  private toTwoFactorStatus(status?: TwoFactorStatus | string): TwoFactorStatus {
    if (status === 'pending' || status === 'active' || status === 'disabled') {
      return status
    }

    return 'disabled'
  }
}
