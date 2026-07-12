import type { AuthProvider } from '../security.types'

export type SecurityUserEntityProps = {
  id: string
  email?: string | null
  emailVerified: boolean
  pendingEmail?: string | null
  provider: AuthProvider
  fullName: string
  username: string
  passwordHash?: string | null
}

export class SecurityUserEntity {
  readonly id: string
  readonly email: string | null
  readonly emailVerified: boolean
  readonly pendingEmail: string | null
  readonly provider: AuthProvider
  readonly fullName: string
  readonly username: string
  readonly passwordHash: string | null

  constructor(props: SecurityUserEntityProps) {
    this.id = props.id
    this.email = props.email ?? null
    this.emailVerified = props.emailVerified
    this.pendingEmail = props.pendingEmail ?? null
    this.provider = props.provider
    this.fullName = props.fullName
    this.username = props.username
    this.passwordHash = props.passwordHash ?? null
  }
}
