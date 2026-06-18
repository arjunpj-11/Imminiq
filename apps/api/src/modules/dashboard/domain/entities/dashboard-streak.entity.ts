export type DashboardStreakEntityProps = {
  current: number
  longest: number
  lastActiveAt: Date | null
}

export class DashboardStreakEntity {
  readonly current: number
  readonly longest: number
  readonly lastActiveAt: Date | null

  constructor(props: DashboardStreakEntityProps) {
    this.current = props.current
    this.longest = props.longest
    this.lastActiveAt = props.lastActiveAt
  }
}
