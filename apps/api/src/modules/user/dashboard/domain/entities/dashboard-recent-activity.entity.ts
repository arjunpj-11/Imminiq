export type DashboardRecentActivityEntityProps = {
  type: string
  description: string
  createdAt: Date
}

export class DashboardRecentActivityEntity {
  readonly type: string
  readonly description: string
  readonly createdAt: Date

  constructor(props: DashboardRecentActivityEntityProps) {
    this.type = props.type
    this.description = props.description
    this.createdAt = props.createdAt
  }
}
