export type DashboardUserEntityProps = {
  id: string
  fullName: string
  username: string
  avatarUrl?: string | null
  isPremium: boolean
  coins?: number | null
  lastActiveAt?: Date | null
}

export class DashboardUserEntity {
  readonly id: string
  readonly fullName: string
  readonly username: string
  readonly avatarUrl: string | null
  readonly isPremium: boolean
  readonly coins: number
  readonly lastActiveAt: Date | null

  constructor(props: DashboardUserEntityProps) {
    this.id = props.id
    this.fullName = props.fullName
    this.username = props.username
    this.avatarUrl = props.avatarUrl ?? null
    this.isPremium = props.isPremium
    this.coins = props.coins ?? 0
    this.lastActiveAt = props.lastActiveAt ?? null
  }
}
