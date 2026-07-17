import { TrackerCreationResponse } from '../../../../../../infrastructure/database/models/tracker-creation-response.model';
import type { TrackerCreationResponseEntity } from '../../../domain/entities/tracker-creation-response.entity';
import type {
  SaveTrackerCreationStep1Input,
  SaveTrackerCreationStep2Input,
} from '../../../domain/repositories/tracker-creation-response-command.repository.interface';
import { MongoTrackerCreationBaseRepository } from '../shared/mongo-tracker-creation-base.repository';
import { MongoTrackerCreationErrorMapper } from '../shared/mongo-tracker-creation-error.mapper';
import { MongoTrackerCreationMapper } from '../shared/mongo-tracker-creation.mapper';
import type { MongoTrackerCreationResponseRecord } from '../shared/mongo-tracker-creation.types';

export class MongoTrackerCreationResponseRepository extends MongoTrackerCreationBaseRepository {
  constructor(private readonly _mapper = new MongoTrackerCreationMapper()) {
    super();
  }

  async getStatus(userId: string): Promise<TrackerCreationResponseEntity | null> {
    return this.execute(
      'TRACKER_CREATION_STATUS_QUERY_FAILED',
      'TrackerCreation status query failed',
      async () => {
        const response = await TrackerCreationResponse.findOne({
          userId,
          deletedAt: null,
        }).lean<MongoTrackerCreationResponseRecord>();

        return this._mapper.toTrackerCreationResponseEntity(response);
      }
    );
  }

  async saveStep1(data: SaveTrackerCreationStep1Input): Promise<TrackerCreationResponseEntity | null> {
    return this.execute(
      'TRACKER_CREATION_STEP_ONE_SAVE_FAILED',
      'Failed to save tracker creation step one',
      async () => {
        const response = await TrackerCreationResponse.findOneAndUpdate(
          {
            userId: data.userId,
            deletedAt: null,
          },
          {
            $set: {
              preparingFor: data.topic,
              goal: data.goal ?? '',
              preferredLanguage: data.preferredLanguage,
            },
            $max: {
              completedStep: 1,
            },
          },
          {
            upsert: true,
            returnDocument: 'after',
            setDefaultsOnInsert: true,
          }
        ).lean<MongoTrackerCreationResponseRecord>();

        return this._mapper.toTrackerCreationResponseEntity(response);
      },
      MongoTrackerCreationErrorMapper.mapDuplicateRecordError
    );
  }

  async saveStep2(data: SaveTrackerCreationStep2Input): Promise<TrackerCreationResponseEntity | null> {
    return this.execute(
      'TRACKER_CREATION_STEP_TWO_SAVE_FAILED',
      'Failed to save tracker creation step two',
      async () => {
        const response = await TrackerCreationResponse.findOneAndUpdate(
          {
            userId: data.userId,
            deletedAt: null,
          },
          {
            $set: {
              currentLevel: data.level,
            },
            $max: {
              completedStep: 2,
            },
          },
          {
            upsert: true,
            returnDocument: 'after',
            setDefaultsOnInsert: true,
          }
        ).lean<MongoTrackerCreationResponseRecord>();

        return this._mapper.toTrackerCreationResponseEntity(response);
      },
      MongoTrackerCreationErrorMapper.mapDuplicateRecordError
    );
  }

  async markCompleted(userId: string): Promise<TrackerCreationResponseEntity | null> {
    return this.execute(
      'TRACKER_CREATION_COMPLETION_SAVE_FAILED',
      'Failed to save tracker creation completion',
      async () => {
        const response = await TrackerCreationResponse.findOneAndUpdate(
          {
            userId,
            deletedAt: null,
          },
          {
            $set: {
              isCompleted: true,
              completedStep: 2,
            },
          },
          {
            returnDocument: 'after',
          }
        ).lean<MongoTrackerCreationResponseRecord>();

        return this._mapper.toTrackerCreationResponseEntity(response);
      }
    );
  }
}

export const mongoTrackerCreationResponseRepository = new MongoTrackerCreationResponseRepository();
