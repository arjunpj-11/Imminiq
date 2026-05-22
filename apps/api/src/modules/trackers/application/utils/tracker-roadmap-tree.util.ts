import type {
  FlattenedLessonNode,
  RoadmapSubtopicNode,
  RoadmapTopicNode,
  TrackerSubtopicRecord,
  TrackerTopicRecord,
} from '../../domain/types/trackers.types'

export const buildRoadmapTree = ({
  topics,
  subtopics,
}: {
  topics: TrackerTopicRecord[]
  subtopics: TrackerSubtopicRecord[]
}): RoadmapTopicNode[] => {
  const subtopicMap = new Map<string, RoadmapSubtopicNode[]>()

  for (const subtopic of subtopics) {
    const parentKey =
      subtopic.parentSubtopicId?.toString() ||
      `topic:${subtopic.topicId.toString()}`

    const children = subtopicMap.get(parentKey) || []

    children.push({
      _id: subtopic._id.toString(),
      title: subtopic.title,
      description: subtopic.description,
      order: subtopic.order,
      depth: subtopic.depth,
      status: subtopic.status || 'available',
      isLocked: Boolean(subtopic.isLocked),
      estimatedMinutes: subtopic.estimatedMinutes || 0,
      progressPercent: subtopic.progressPercent || 0,
      completedAt: subtopic.completedAt || null,
      children: [],
    })

    subtopicMap.set(parentKey, children)
  }

  const attachChildren = (
    items: RoadmapSubtopicNode[]
  ): RoadmapSubtopicNode[] => {
    return items
      .sort((first, second) => first.order - second.order)
      .map((item) => {
        const children = subtopicMap.get(item._id) || []

        return {
          ...item,
          children: attachChildren(children),
        }
      })
  }

  return topics
    .sort((first, second) => first.order - second.order)
    .map((topic) => {
      const topicChildren =
        subtopicMap.get(`topic:${topic._id.toString()}`) || []

      return {
        _id: topic._id.toString(),
        title: topic.title,
        description: topic.description || '',
        order: topic.order,
        status: topic.status || 'available',
        progressPercent: topic.progressPercent || 0,
        estimatedHours: topic.estimatedHours || 0,
        subtopics: attachChildren(topicChildren),
      }
    })
}

export const flattenRoadmapSubtopics = (
  topics: RoadmapTopicNode[]
): FlattenedLessonNode[] => {
  const result: FlattenedLessonNode[] = []

  const walk = (
    subtopics: RoadmapSubtopicNode[],
    topic: RoadmapTopicNode
  ) => {
    for (const subtopic of subtopics) {
      result.push({
        ...subtopic,
        topicId: topic._id,
        topicTitle: topic.title,
      })

      if (subtopic.children.length > 0) {
        walk(subtopic.children, topic)
      }
    }
  }

  for (const topic of topics) {
    walk(topic.subtopics, topic)
  }

  return result
}
