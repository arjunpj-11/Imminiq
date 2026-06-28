import { ModerationAppeal } from '../../../../infrastructure/database/models/moderation-appeal.model'
import { User } from '../../../../infrastructure/database/models/user.model'
import type { ModerationAppealEntity } from '../../domain/entities/moderation-appeal.entity'
import type { RestrictedModerationUserEntity } from '../../domain/entities/restricted-moderation-user.entity'
import type {
  CreateModerationAppealInput,
  ModerationAppealRepositoryContract,
} from '../../domain/repositories/moderation-appeal.repository.interface'
import {
  ACTIVE_MODERATION_APPEAL_STATUSES,
  MODERATION_APPEAL_PENDING_STATUS,
} from '../../domain/value-objects/moderation-appeal-status.vo'
import { RESTRICTED_USER_STATUSES } from '../../domain/value-objects/restricted-user-status.vo'
import { MongoModerationAppealBaseRepository } from './mongo-moderation-appeal-base.repository'
import { MongoModerationAppealErrorMapper } from './mongo-moderation-appeal-error.mapper'
import { MongoModerationAppealMapper } from './mongo-moderation-appeal.mapper'
import type {
  MongoModerationAppealRecord,
  MongoRestrictedUserRecord,
} from './mongo-moderation-appeal.types'

export class MongoModerationAppealRepository
  extends MongoModerationAppealBaseRepository
  implements ModerationAppealRepositoryContract
{
  constructor(private readonly _mapper = new MongoModerationAppealMapper()) {
    super()
  }

  async findRestrictedUserByIdentifier(
    identifier: string,
  ): Promise<RestrictedModerationUserEntity | null> {
    return this.execute(
      'RESTRICTED_USER_READ_FAILED',
      'Failed to read restricted moderation user',
      async () => {
        const user = await this.findRestrictedUserRecordByIdentifier(identifier)

        return this._mapper.toRestrictedUserEntity(user)
      },
    )
  }

  async findActiveAppealForUser(
    userId: string,
  ): Promise<ModerationAppealEntity | null> {
    return this.execute(
      'MODERATION_APPEAL_READ_FAILED',
      'Failed to read active moderation appeal',
      async () => {
        const objectId = this.toObjectIdOrNull(userId)

        if (!objectId) {
          return null
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
          .lean<MongoModerationAppealRecord>()

        return this._mapper.toModerationAppealEntity(appeal)
      },
    )
  }

  async findLatestActiveAppealForRestrictedIdentifier(
    identifier: string,
  ): Promise<ModerationAppealEntity | null> {
    return this.execute(
      'MODERATION_APPEAL_READ_FAILED',
      'Failed to read latest active moderation appeal',
      async () => {
        const user = await this.findRestrictedUserRecordByIdentifier(identifier)
        const restrictedUser = this._mapper.toRestrictedUserEntity(user)

        if (!restrictedUser) {
          return null
        }

        const appeal = await ModerationAppeal.findOne({
          userId: this.toObjectIdOrThrow(restrictedUser.id),
          status: {
            $in: ACTIVE_MODERATION_APPEAL_STATUSES,
          },
          deletedAt: null,
        })
          .sort({
            createdAt: -1,
          })
          .lean<MongoModerationAppealRecord>()

        return this._mapper.toModerationAppealEntity(appeal)
      },
    )
  }

  async caseIdExists(caseId: string): Promise<boolean> {
    return this.execute(
      'MODERATION_APPEAL_READ_FAILED',
      'Failed to check moderation appeal case id',
      async () => {
        const normalizedCaseId = this.normalizeText(caseId)

        if (!normalizedCaseId) {
          return false
        }

        const exists = await ModerationAppeal.exists({
          caseId: normalizedCaseId,
          deletedAt: null,
        })

        return Boolean(exists)
      },
    )
  }

  async createAppeal(
    data: CreateModerationAppealInput,
  ): Promise<ModerationAppealEntity> {
    return this.execute(
      'CREATE_APPEAL_FAILED',
      'Failed to create moderation appeal',
      async () => {
        const userId = this.toObjectIdOrThrow(data.userId)
        const normalizedIdentifier = this.normalizeIdentifier(data.identifier)

        const appeal = await ModerationAppeal.create({
          userId,
          caseId: this.normalizeText(data.caseId),
          identifier: normalizedIdentifier.value,
          appealReason: this.normalizeText(data.appealReason),
          status: MODERATION_APPEAL_PENDING_STATUS,
        })

        return this._mapper.toModerationAppealEntityOrThrow(
          this._mapper.toPlainRecord<MongoModerationAppealRecord>(appeal),
        )
      },
      MongoModerationAppealErrorMapper.mapDuplicateCreateError,
    )
  }

  private async findRestrictedUserRecordByIdentifier(
    identifier: string,
  ): Promise<MongoRestrictedUserRecord | null> {
    const normalized = this.normalizeIdentifier(identifier)

    const contactQuery = normalized.isEmail
      ? {
          email: normalized.value,
        }
      : {
          phone: normalized.value,
        }

    return User.findOne({
      ...contactQuery,
      status: {
        $in: RESTRICTED_USER_STATUSES,
      },
      deletedAt: null,
    }).lean<MongoRestrictedUserRecord>()
  }
}

export const mongoModerationAppealRepository =
  new MongoModerationAppealRepository()