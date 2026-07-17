import { Tracker } from '../../../../../../infrastructure/database/models/tracker.model';
import { TrackerSubtopic } from '../../../../../../infrastructure/database/models/tracker-subtopic.model';
import { TrackerTopic } from '../../../../../../infrastructure/database/models/tracker-topic.model';
import type { RoadmapTreeEntity } from '../../../domain/entities/roadmap-tree.entity';
import { MongoTrackerCreationBaseRepository } from '../shared/mongo-tracker-creation-base.repository';
import { MongoTrackerCreationMapper } from '../shared/mongo-tracker-creation.mapper';
import type {
  MongoRoadmapSubtopicRecord,
  MongoRoadmapTopicRecord,
  MongoTrackerRecord,
} from '../shared/mongo-tracker-creation.types';

export class MongoTrackerCreationRoadmapRepository extends MongoTrackerCreationBaseRepository {
  constructor(private readonly _mapper = new MongoTrackerCreationMapper()) {
    super();
  }

  async getRoadmapTree(trackerId: string): Promise<RoadmapTreeEntity> {
    return this.execute('ROADMAP_TREE_QUERY_FAILED', 'Failed to read roadmap tree', async () => {
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
      ]);

      return this._mapper.toRoadmapTreeEntity({
        tracker,
        topics,
        subtopics,
      });
    });
  }
}

export const mongoTrackerCreationRoadmapRepository = new MongoTrackerCreationRoadmapRepository();
