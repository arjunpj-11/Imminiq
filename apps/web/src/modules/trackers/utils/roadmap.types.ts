export type RoadmapNode = {
  _id: string
  title: string
  description?: string
  order: number
  status?: string
  progressPercent?: number
  estimatedMinutes?: number
  estimatedHours?: number
  isLocked?: boolean
  children: RoadmapNode[]
  nodeType: 'topic' | 'subtopic'
}

export type BreadcrumbItem = {
  id: string
  title: string
  nodes: RoadmapNode[]
}

export type RoadmapLocationState = {
  roadmapBreadcrumbStack?: BreadcrumbItem[]
}
