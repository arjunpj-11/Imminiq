import { ModerationAppeal } from '../../../../../../infrastructure/database/models/moderation-appeal.model';
import type { ModerationAppealEntity } from '../../../domain/entities/moderation-appeal.entity';
import type { CreateModerationAppealInput } from '../../../domain/repositories/moderation-appeal.repository.interface';
import {
  ACTIVE_MODERATION_APPEAL_STATUSES,
  MODERATION_APPEAL_PENDING_STATUS,
} from '../../../domain/value-objects/moderation-appeal-status.vo';
import { MongoModerationAppealBaseRepository } from '../shared/mongo-moderation-appeal-base.repository';
import { MongoModerationAppealErrorMapper } from '../shared/mongo-moderation-appeal-error.mapper';
import { MongoModerationAppealMapper } from '../shared/mongo-moderation-appeal.mapper';
import { MongoModerationAppealNormalizer } from '../shared/mongo-moderation-appeal-normalizer';
import { MongoModerationAppealObjectId } from '../shared/mongo-moderation-appeal-object-id';
import type { MongoModerationAppealRecord } from '../shared/mongo-moderation-appeal.types';
import type {
  MongoModerationAppealRestrictedUserReader} from './mongo-moderation-appeal-restricted-user.reader';
import {
  mongoModerationAppealRestrictedUserReader,
} from './mongo-moderation-appeal-restricted-user.reader';

export class MongoModerationAppealCaseRepository extends MongoModerationAppealBaseRepository {
  constructor(
    private readonly _mapper = new MongoModerationAppealMapper(),
    private readonly _restrictedUserReader: MongoModerationAppealRestrictedUserReader = mongoModerationAppealRestrictedUserReader
  ) {
    super();
  }

  async findActiveAppealForUser(userId: string): Promise<ModerationAppealEntity | null> {
    return this.execute(
      'MODERATION_APPEAL_READ_FAILED',
      'Failed to read active moderation appeal',
      async () => {
        const objectId = MongoModerationAppealObjectId.fromOrNull(userId);

        if (!objectId) {
          return null;
        }

        const appeal = await ModerationAppeal.findOne({
          userId: objectId,
          status: {
            $in: ACTIVE_MODERATION_APPEAL_STATUSES,
          },
          deletedAt: null,
        })
          .sort({
            createdAt: -1,
          })
          .lean<MongoModerationAppealRecord>();

        return this._mapper.toModerationAppealEntity(appeal);
      }
    );
  }

  async findLatestActiveAppealForRestrictedIdentifier(
    identifier: string
  ): Promise<ModerationAppealEntity | null> {
    return this.execute(
      'MODERATION_APPEAL_READ_FAILED',
      'Failed to read latest active moderation appeal',
      async () => {
        const user = await this._restrictedUserReader.findByIdentifier(identifier);
        const restrictedUser = this._mapper.toRestrictedUserEntity(user);

        if (!restrictedUser) {
          return null;
        }

        const appeal = await ModerationAppeal.findOne({
          userId: MongoModerationAppealObjectId.fromOrThrow(restrictedUser.id),
          status: {
            $in: ACTIVE_MODERATION_APPEAL_STATUSES,
          },
          deletedAt: null,
        })
          .sort({
            createdAt: -1,
          })
          .lean<MongoModerationAppealRecord>();

        return this._mapper.toModerationAppealEntity(appeal);
      }
    );
  }

  async caseIdExists(caseId: string): Promise<boolean> {
    return this.execute(
      'MODERATION_APPEAL_READ_FAILED',
      'Failed to check moderation appeal case id',
      async () => {
        const normalizedCaseId = MongoModerationAppealNormalizer.text(caseId);

        if (!normalizedCaseId) {
          return false;
        }

        const exists = await ModerationAppeal.exists({
          caseId: normalizedCaseId,
          deletedAt: null,
        });

        return Boolean(exists);
      }
    );
  }

  async createAppeal(data: CreateModerationAppealInput): Promise<ModerationAppealEntity> {
    return this.execute(
      'CREATE_APPEAL_FAILED',
      'Failed to create moderation appeal',
      async () => {
        const userId = MongoModerationAppealObjectId.fromOrThrow(data.userId);
        const normalizedIdentifier = MongoModerationAppealNormalizer.identifier(data.identifier);

        const appeal = await ModerationAppeal.create({
          userId,
          caseId: MongoModerationAppealNormalizer.text(data.caseId),
          identifier: normalizedIdentifier.value,
          appealReason: MongoModerationAppealNormalizer.text(data.appealReason),
          status: MODERATION_APPEAL_PENDING_STATUS,
        });

        return this._mapper.toModerationAppealEntityOrThrow(
          this._mapper.toPlainRecord<MongoModerationAppealRecord>(appeal)
        );
      },
      MongoModerationAppealErrorMapper.mapDuplicateCreateError
    );
  }
}

export const mongoModerationAppealCaseRepository = new MongoModerationAppealCaseRepository();
