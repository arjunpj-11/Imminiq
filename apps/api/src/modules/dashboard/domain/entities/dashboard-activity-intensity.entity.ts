export type DashboardActivityIntensityEntityProps = {
  date: string
  activityCount: number
  count: number
}

export class DashboardActivityIntensityEntity {
  readonly date: string
  readonly activityCount: number
  readonly count: number

  constructor(props: DashboardActivityIntensityEntityProps) {
    this.date = props.date
    this.activityCount = props.activityCount
    this.count = props.count
  }
}
