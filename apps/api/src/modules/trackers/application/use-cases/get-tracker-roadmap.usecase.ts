import { TrackerApplicationError } from '../errors/tracker-application.error'
import type { TrackerRepositoryContract } from '../../domain/repositories/tracker.repository.interface'
import type {
  RoadmapSubtopicNode,
  RoadmapTopicNode,
  SubtopicWithProgressRecord,
  TopicWithProgressRecord,
} from '../../domain/types/trackers.types'


const buildRoadmapTree = ({
  topics,
  subtopics,
}: {
  topics: TopicWithProgressRecord[]
  subtopics: SubtopicWithProgressRecord[]
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
    items: RoadmapSubtopicNode[],
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
        status: topic.status || 'active',
        progressPercent: topic.progressPercent || 0,
        estimatedHours: topic.estimatedHours || 0,
        subtopics: attachChildren(topicChildren),
      }
    })
}

export class GetTrackerRoadmapUseCase {
  constructor(private readonly trackerRepository: TrackerRepositoryContract) {}

  async execute(input: { trackerId: string; userId: string }) {
    const tracker = await this.trackerRepository.findOwnedTrackerById(
      input.trackerId,
      input.userId
    )

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found')
    }

    await this.trackerRepository.ensureUserProgressInitialized({
      userId: input.userId,
      trackerId: input.trackerId,
    })

    const [topics, subtopics] = await Promise.all([
      this.trackerRepository.getTopicsWithUserProgress({
        trackerId: input.trackerId,
        userId: input.userId,
      }),
      this.trackerRepository.getSubtopicsWithUserProgress({
        trackerId: input.trackerId,
        userId: input.userId,
      }),
    ])

    return {
      tracker,
      roadmap: buildRoadmapTree({ topics, subtopics }),
    }
  }
}
