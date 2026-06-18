import type { TwoFactorStatus } from '../value-objects/two-factor-status.vo'

export type TwoFactorBackupCodeEntity = {
  codeHash: string
  usedAt?: Date | null
}

export type TwoFactorAuthEntityProps = {
  id: string
  userId: string
  status: TwoFactorStatus
  totpSecretEncrypted: string
  backupCodes: TwoFactorBackupCodeEntity[]
}

export class TwoFactorAuthEntity {
  readonly id: string
  readonly userId: string
  readonly status: TwoFactorStatus
  readonly totpSecretEncrypted: string
  readonly backupCodes: TwoFactorBackupCodeEntity[]

  constructor(props: TwoFactorAuthEntityProps) {
    this.id = props.id
    this.userId = props.userId
    this.status = props.status
    this.totpSecretEncrypted = props.totpSecretEncrypted
    this.backupCodes = props.backupCodes
  }
}
