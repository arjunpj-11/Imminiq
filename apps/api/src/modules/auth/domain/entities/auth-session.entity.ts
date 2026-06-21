export type AuthSessionEntityProps = {
  id: string
  userId: string
  refreshTokenHash?: string
  expiresAt: Date
  revokedAt?: Date | null
  deletedAt?: Date | null
  device?: string
  ipAddress?: string
  userAgent?: string
  createdAt?: Date
}

export class AuthSessionEntity {
  readonly id: string
  readonly userId: string
  readonly refreshTokenHash?: string
  readonly expiresAt: Date
  readonly revokedAt?: Date | null
  readonly deletedAt?: Date | null
  readonly device?: string
  readonly ipAddress?: string
  readonly userAgent?: string
  readonly createdAt?: Date

  constructor(props: AuthSessionEntityProps) {
    this.id = props.id
    this.userId = props.userId
    this.refreshTokenHash = props.refreshTokenHash
    this.expiresAt = props.expiresAt
    this.revokedAt = props.revokedAt
    this.deletedAt = props.deletedAt
    this.device = props.device
    this.ipAddress = props.ipAddress
    this.userAgent = props.userAgent
    this.createdAt = props.createdAt
  }
}
