import { OnboardingResponse } from '../../../../../../infrastructure/database/models/onboarding-response.model';
import type { OnboardingResponseEntity } from '../../../domain/entities/onboarding-response.entity';
import type {
  SaveOnboardingStep1Input,
  SaveOnboardingStep2Input,
} from '../../../domain/repositories/onboarding-response-command.repository.interface';
import { MongoOnboardingBaseRepository } from '../shared/mongo-onboarding-base.repository';
import { MongoOnboardingErrorMapper } from '../shared/mongo-onboarding-error.mapper';
import { MongoOnboardingMapper } from '../shared/mongo-onboarding.mapper';
import type { MongoOnboardingResponseRecord } from '../shared/mongo-onboarding.types';

export class MongoOnboardingResponseRepository extends MongoOnboardingBaseRepository {
  constructor(private readonly _mapper = new MongoOnboardingMapper()) {
    super();
  }

  async getStatus(userId: string): Promise<OnboardingResponseEntity | null> {
    return this.execute(
      'ONBOARDING_STATUS_QUERY_FAILED',
      'Onboarding status query failed',
      async () => {
        const response = await OnboardingResponse.findOne({
          userId,
          deletedAt: null,
        }).lean<MongoOnboardingResponseRecord>();

        return this._mapper.toOnboardingResponseEntity(response);
      }
    );
  }

  async saveStep1(data: SaveOnboardingStep1Input): Promise<OnboardingResponseEntity | null> {
    return this.execute(
      'ONBOARDING_STEP_ONE_SAVE_FAILED',
      'Failed to save onboarding step one',
      async () => {
        const response = await OnboardingResponse.findOneAndUpdate(
          {
            userId: data.userId,
            deletedAt: null,
          },
          {
            $set: {
              preparingFor: data.topic,
              goal: data.goal ?? '',
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
        ).lean<MongoOnboardingResponseRecord>();

        return this._mapper.toOnboardingResponseEntity(response);
      },
      MongoOnboardingErrorMapper.mapDuplicateRecordError
    );
  }

  async saveStep2(data: SaveOnboardingStep2Input): Promise<OnboardingResponseEntity | null> {
    return this.execute(
      'ONBOARDING_STEP_TWO_SAVE_FAILED',
      'Failed to save onboarding step two',
      async () => {
        const response = await OnboardingResponse.findOneAndUpdate(
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
        ).lean<MongoOnboardingResponseRecord>();

        return this._mapper.toOnboardingResponseEntity(response);
      },
      MongoOnboardingErrorMapper.mapDuplicateRecordError
    );
  }

  async markCompleted(userId: string): Promise<OnboardingResponseEntity | null> {
    return this.execute(
      'ONBOARDING_COMPLETION_SAVE_FAILED',
      'Failed to save onboarding completion',
      async () => {
        const response = await OnboardingResponse.findOneAndUpdate(
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
        ).lean<MongoOnboardingResponseRecord>();

        return this._mapper.toOnboardingResponseEntity(response);
      }
    );
  }
}

export const mongoOnboardingResponseRepository = new MongoOnboardingResponseRepository();
