export type RoadmapTrackerEntityProps = {
  id: string
  attributes?: Record<string, unknown>
}

export class RoadmapTrackerEntity {
  readonly id: string
  readonly attributes: Record<string, unknown>

  constructor(props: RoadmapTrackerEntityProps) {
    this.id = props.id
    this.attributes = props.attributes ?? {}
  }
}

export type RoadmapSubtopicNodeEntityProps = {
  id: string
  title: string
  description: string
  order: number
  depth: number
  children?: RoadmapSubtopicNodeEntity[]
}

export class RoadmapSubtopicNodeEntity {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly order: number
  readonly depth: number
  readonly children: RoadmapSubtopicNodeEntity[]

  constructor(props: RoadmapSubtopicNodeEntityProps) {
    this.id = props.id
    this.title = props.title
    this.description = props.description
    this.order = props.order
    this.depth = props.depth
    this.children = props.children ?? []
  }
}

export type RoadmapTopicNodeEntityProps = {
  id: string
  title: string
  description: string
  order: number
  children?: RoadmapSubtopicNodeEntity[]
}

export class RoadmapTopicNodeEntity {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly order: number
  readonly children: RoadmapSubtopicNodeEntity[]

  constructor(props: RoadmapTopicNodeEntityProps) {
    this.id = props.id
    this.title = props.title
    this.description = props.description
    this.order = props.order
    this.children = props.children ?? []
  }
}

export type RoadmapTreeEntityProps = {
  tracker: RoadmapTrackerEntity | null
  topics: RoadmapTopicNodeEntity[]
}

export class RoadmapTreeEntity {
  readonly tracker: RoadmapTrackerEntity | null
  readonly topics: RoadmapTopicNodeEntity[]

  constructor(props: RoadmapTreeEntityProps) {
    this.tracker = props.tracker
    this.topics = props.topics
  }
}
