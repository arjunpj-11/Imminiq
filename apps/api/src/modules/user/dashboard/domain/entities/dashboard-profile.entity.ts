export type DashboardProfileEntityProps = {
  userId: string
  avatarUrl?: string | null
}

export class DashboardProfileEntity {
  readonly userId: string
  readonly avatarUrl: string | null

  constructor(props: DashboardProfileEntityProps) {
    this.userId = props.userId
    this.avatarUrl = props.avatarUrl ?? null
  }
}
