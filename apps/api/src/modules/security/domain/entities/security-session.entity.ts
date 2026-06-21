export type SecuritySessionEntityProps = {
  id: string
  device?: string | null
  ipAddress?: string | null
  userAgent?: string | null
  updatedAt?: Date | null
}

export class SecuritySessionEntity {
  readonly id: string
  readonly device: string | null
  readonly ipAddress: string | null
  readonly userAgent: string | null
  readonly updatedAt: Date | null

  constructor(props: SecuritySessionEntityProps) {
    this.id = props.id
    this.device = props.device ?? null
    this.ipAddress = props.ipAddress ?? null
    this.userAgent = props.userAgent ?? null
    this.updatedAt = props.updatedAt ?? null
  }
}
