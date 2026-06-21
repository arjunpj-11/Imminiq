export type PublishedTrackerEntityProps = {
  id: string
  title: string
  slug: string
  description: string
  category?: string
  field?: string
  goal?: string
  level?: string
  timeline?: string
  coverImageUrl?: string
  topicsCount: number
  subtopicsCount: number
  cloneCount: number
  likeCount: number
  saveCount: number
  progressPercent: number
  ratingAverage: number
  ratingCount: number
  publishedAt?: Date | null
  createdAt?: Date
}

export class PublishedTrackerEntity {
  readonly id: string
  readonly title: string
  readonly slug: string
  readonly description: string
  readonly category?: string
  readonly field?: string
  readonly goal?: string
  readonly level?: string
  readonly timeline?: string
  readonly coverImageUrl?: string
  readonly topicsCount: number
  readonly subtopicsCount: number
  readonly cloneCount: number
  readonly likeCount: number
  readonly saveCount: number
  readonly progressPercent: number
  readonly ratingAverage: number
  readonly ratingCount: number
  readonly publishedAt?: Date | null
  readonly createdAt?: Date

  constructor(props: PublishedTrackerEntityProps) {
    this.id = props.id
    this.title = props.title
    this.slug = props.slug
    this.description = props.description
    if (props.category !== undefined) this.category = props.category
    if (props.field !== undefined) this.field = props.field
    if (props.goal !== undefined) this.goal = props.goal
    if (props.level !== undefined) this.level = props.level
    if (props.timeline !== undefined) this.timeline = props.timeline
    if (props.coverImageUrl !== undefined) this.coverImageUrl = props.coverImageUrl
    this.topicsCount = props.topicsCount
    this.subtopicsCount = props.subtopicsCount
    this.cloneCount = props.cloneCount
    this.likeCount = props.likeCount
    this.saveCount = props.saveCount
    this.progressPercent = props.progressPercent
    this.ratingAverage = props.ratingAverage
    this.ratingCount = props.ratingCount
    if (props.publishedAt !== undefined) this.publishedAt = props.publishedAt
    if (props.createdAt !== undefined) this.createdAt = props.createdAt
  }
}
