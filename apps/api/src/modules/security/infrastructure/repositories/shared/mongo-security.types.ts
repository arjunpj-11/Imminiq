import type { AuthProvider } from '../../../domain/value-objects/auth-provider.vo'
import type { TwoFactorStatus } from '../../../domain/value-objects/two-factor-status.vo'

export type MongoIdLike = {
  toString(): string
}

export type MongoSecurityUserRecord = {
  _id: MongoIdLike | string
  email?: string | null
  emailVerified?: boolean
  pendingEmail?: string | null
  provider?: AuthProvider | string
  fullName?: string
  username?: string
  passwordHash?: string | null
}

export type MongoTwoFactorRecord = {
  _id?: MongoIdLike | string
  status?: TwoFactorStatus | string
  totpSecretEncrypted?: string | null
}

export type MongoSecuritySessionRecord = {
  _id: MongoIdLike | string
  device?: string | null
  ipAddress?: string | null
  userAgent?: string | null
  updatedAt?: Date | null
}

export type MongoDuplicateKeyError = {
  code?: number
}
