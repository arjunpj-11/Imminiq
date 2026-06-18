import type { DashboardRecommendedActionType } from '../value-objects/dashboard-action-type.vo'

export type DashboardRecommendedActionEntityProps = {
  type: DashboardRecommendedActionType
  title: string
  description: string
  link: string
}

export class DashboardRecommendedActionEntity {
  readonly type: DashboardRecommendedActionType
  readonly title: string
  readonly description: string
  readonly link: string

  constructor(props: DashboardRecommendedActionEntityProps) {
    this.type = props.type
    this.title = props.title
    this.description = props.description
    this.link = props.link
  }
}
