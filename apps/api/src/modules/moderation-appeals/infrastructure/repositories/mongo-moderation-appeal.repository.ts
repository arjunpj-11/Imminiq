import { Types } from 'mongoose'
import { ModerationAppeal } from '../../../../infrastructure/database/models/moderation-appeal.model'
import { User } from '../../../../infrastructure/database/models/user.model'
import { ModerationAppealEntity } from '../../domain/entities/moderation-appeal.entity'
import { RestrictedModerationUserEntity } from '../../domain/entities/restricted-moderation-user.entity'
import { ModerationAppealDomainError } from '../../domain/errors/moderation-appeal-domain.error'
import type {
  CreateModerationAppealInput,
  ModerationAppealRepositoryContract,
} from '../../domain/repositories/moderation-appeal.repository.interface'
import {
  ACTIVE_MODERATION_APPEAL_STATUSES,
  MODERATION_APPEAL_PENDING_STATUS,
} from '../../domain/value-objects/moderation-appeal-status.vo'
import type { ModerationAppealStatus } from '../../domain/value-objects/moderation-appeal-status.vo'
import { RESTRICTED_USER_STATUSES } from '../../domain/value-objects/restricted-user-status.vo'
import type { RestrictedUserStatus } from '../../domain/value-objects/restricted-user-status.vo'

type MongoIdLike = {
  toString(): string
}

type MongoRestrictedUserRecord = {
  _id: MongoIdLike | string
  status: RestrictedUserStatus | string
}

type MongoModerationAppealRecord = {
  _id?: MongoIdLike | string
  userId: MongoIdLike | string
  caseId: string
  status: ModerationAppealStatus | string
  identifier: string
  createdAt: Date
  updatedAt?: Date
  appealReason: string
}

type MongooseObjectLike<T> = {
  toObject(): T
}

type NormalizedIdentifier = {
  value: string
  isEmail: boolean
}

type MongoDuplicateKeyError = {
  code?: number
}

export class MongoModerationAppealRepository
  implements ModerationAppealRepositoryContract
{
  async findRestrictedUserByIdentifier(
    identifier: string,
  ): Promise<RestrictedModerationUserEntity | null> {
    const normalized = this.normalizeIdentifier(identifier)
    const contactQuery = normalized.isEmail
      ? { email: normalized.value }
      : { phone: normalized.value }

    const user = await User.findOne({
      ...contactQuery,
      status: {
        $in: RESTRICTED_USER_STATUSES,
      },
      deletedAt: null,
    }).lean<MongoRestrictedUserRecord>()

    return this.toRestrictedUserEntity(user)
  }

  async findActiveAppealForUser(
    userId: string,
  ): Promise<ModerationAppealEntity | null> {
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
      .sort({ createdAt: -1 })
      .lean<MongoModerationAppealRecord>()

    return this.toModerationAppealEntity(appeal)
  }

  async findLatestActiveAppealForRestrictedIdentifier(
    identifier: string,
  ): Promise<ModerationAppealEntity | null> {
    const user = await this.findRestrictedUserByIdentifier(identifier)

    if (!user) {
      return null
    }

    return this.findActiveAppealForUser(user.id)
  }

  async caseIdExists(caseId: string): Promise<boolean> {
    const normalizedCaseId = caseId.trim()

    if (!normalizedCaseId) {
      return false
    }

    const exists = await ModerationAppeal.exists({
      caseId: normalizedCaseId,
      deletedAt: null,
    })

    return Boolean(exists)
  }

  async createAppeal(
    data: CreateModerationAppealInput,
  ): Promise<ModerationAppealEntity> {
    const userId = this.toObjectIdOrThrow(data.userId)

    try {
      const appeal = await ModerationAppeal.create({
        userId,
        caseId: data.caseId.trim(),
        identifier: this.normalizeIdentifier(data.identifier).value,
        appealReason: data.appealReason.trim(),
        status: MODERATION_APPEAL_PENDING_STATUS,
      })

      return this.toModerationAppealEntityOrThrow(
        this.toPlainRecord<MongoModerationAppealRecord>(appeal),
      )
    } catch (error) {
      this.throwMappedCreateError(error)
    }
  }

  private normalizePhone(phone: string): string {
    return phone.trim().replace(/\s/g, '')
  }

  private normalizeIdentifier(identifier: string): NormalizedIdentifier {
    const value = identifier.trim()
    const isEmail = value.includes('@')

    return {
      value: isEmail ? value.toLowerCase() : this.normalizePhone(value),
      isEmail,
    }
  }

  private toObjectIdOrNull(value: string): Types.ObjectId | null {
    if (!Types.ObjectId.isValid(value)) {
      return null
    }

    return new Types.ObjectId(value)
  }

  private toObjectIdOrThrow(value: string): Types.ObjectId {
    const objectId = this.toObjectIdOrNull(value)

    if (!objectId) {
      throw new ModerationAppealDomainError(
        'INVALID_OBJECT_ID',
        'Invalid moderation appeal object id',
      )
    }

    return objectId
  }

  private toId(value: MongoIdLike | string): string {
    return typeof value === 'string' ? value : value.toString()
  }

  private toPlainRecord<T>(document: MongooseObjectLike<T>): T {
    return document.toObject()
  }

  private toRestrictedUserStatus(status: string): RestrictedUserStatus {
    if (RESTRICTED_USER_STATUSES.includes(status as RestrictedUserStatus)) {
      return status as RestrictedUserStatus
    }

    throw new ModerationAppealDomainError(
      'INVALID_RESTRICTED_USER_STATUS',
      'Invalid restricted user status',
    )
  }

  private toModerationAppealStatus(status: string): ModerationAppealStatus {
    if (
      ACTIVE_MODERATION_APPEAL_STATUSES.includes(
        status as ModerationAppealStatus,
      )
    ) {
      return status as ModerationAppealStatus
    }

    throw new ModerationAppealDomainError(
      'INVALID_MODERATION_APPEAL_STATUS',
      'Invalid moderation appeal status',
    )
  }

  private toRestrictedUserEntity(
    user: MongoRestrictedUserRecord | null,
  ): RestrictedModerationUserEntity | null {
    if (!user) {
      return null
    }

    return new RestrictedModerationUserEntity({
      id: this.toId(user._id),
      status: this.toRestrictedUserStatus(user.status),
    })
  }

  private toModerationAppealEntity(
    appeal: MongoModerationAppealRecord | null,
  ): ModerationAppealEntity | null {
    if (!appeal) {
      return null
    }

    return new ModerationAppealEntity({
      id: appeal._id ? this.toId(appeal._id) : undefined,
      userId: this.toId(appeal.userId),
      caseId: appeal.caseId,
      status: this.toModerationAppealStatus(appeal.status),
      identifier: appeal.identifier,
      appealReason: appeal.appealReason,
      createdAt: appeal.createdAt,
      updatedAt: appeal.updatedAt,
    })
  }

  private toModerationAppealEntityOrThrow(
    appeal: MongoModerationAppealRecord | null,
  ): ModerationAppealEntity {
    const entity = this.toModerationAppealEntity(appeal)

    if (!entity) {
      throw new ModerationAppealDomainError(
        'MAPPING_FAILED',
        'Failed to map moderation appeal entity',
      )
    }

    return entity
  }

  private isMongoDuplicateKeyError(
    error: unknown,
  ): error is MongoDuplicateKeyError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as MongoDuplicateKeyError).code === 11000
    )
  }

  private throwMappedCreateError(error: unknown): never {
    if (this.isMongoDuplicateKeyError(error)) {
      throw new ModerationAppealDomainError(
        'DUPLICATE_APPEAL_CASE_ID',
        'Moderation appeal case id already exists',
      )
    }

    if (error instanceof ModerationAppealDomainError) {
      throw error
    }

    throw new ModerationAppealDomainError(
      'CREATE_APPEAL_FAILED',
      'Failed to create moderation appeal',
    )
  }
}

export const mongoModerationAppealRepository =
  new MongoModerationAppealRepository()
