import { Tracker } from '../../../../../infrastructure/database/models/tracker.model'
import { TrackerSubtopic } from '../../../../../infrastructure/database/models/tracker-subtopic.model'
import { TrackerTopic } from '../../../../../infrastructure/database/models/tracker-topic.model'
import type { RoadmapTreeEntity } from '../../../domain/entities/roadmap-tree.entity'
import { MongoOnboardingBaseRepository } from '../shared/mongo-onboarding-base.repository'
import { MongoOnboardingMapper } from '../shared/mongo-onboarding.mapper'
import type {
  MongoRoadmapSubtopicRecord,
  MongoRoadmapTopicRecord,
  MongoTrackerRecord,
} from '../shared/mongo-onboarding.types'

export class MongoOnboardingRoadmapRepository extends MongoOnboardingBaseRepository {
  constructor(private readonly _mapper = new MongoOnboardingMapper()) {
    super()
  }

  async getRoadmapTree(trackerId: string): Promise<RoadmapTreeEntity> {
    return this.execute(
      'ROADMAP_TREE_QUERY_FAILED',
      'Failed to read roadmap tree',
      async () => {
        const [tracker, topics, subtopics] = await Promise.all([
          Tracker.findOne({
            _id: trackerId,
            deletedAt: null,
          }).lean<MongoTrackerRecord>(),
          TrackerTopic.find({
            trackerId,
            deletedAt: null,
          })
            .sort({
              order: 1,
            })
            .lean<MongoRoadmapTopicRecord[]>(),
          TrackerSubtopic.find({
            trackerId,
            deletedAt: null,
          })
            .sort({
              depth: 1,
              order: 1,
            })
            .lean<MongoRoadmapSubtopicRecord[]>(),
        ])

        return this._mapper.toRoadmapTreeEntity({
          tracker,
          topics,
          subtopics,
        })
      },
    )
  }
}

export const mongoOnboardingRoadmapRepository =
  new MongoOnboardingRoadmapRepository()
