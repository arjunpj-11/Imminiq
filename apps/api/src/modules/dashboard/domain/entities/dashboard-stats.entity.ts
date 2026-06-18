export type DashboardStatsEntityProps = {
  totalSubtopicsCompleted: number
  totalPoints: number
  publishedTrackers: number
}

export class DashboardStatsEntity {
  readonly totalSubtopicsCompleted: number
  readonly totalPoints: number
  readonly publishedTrackers: number

  constructor(props: DashboardStatsEntityProps) {
    this.totalSubtopicsCompleted = props.totalSubtopicsCompleted
    this.totalPoints = props.totalPoints
    this.publishedTrackers = props.publishedTrackers
  }
}
