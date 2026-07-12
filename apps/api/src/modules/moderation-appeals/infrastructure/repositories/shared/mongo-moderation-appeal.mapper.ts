import { ModerationAppealEntity } from '../../../domain/entities/moderation-appeal.entity'
import { RestrictedModerationUserEntity } from '../../../domain/entities/restricted-moderation-user.entity'
import { ModerationAppealDomainError } from '../../../domain/moderation-appeal-domain.error'
import {
  ACTIVE_MODERATION_APPEAL_STATUSES,
  MODERATION_APPEAL_PENDING_STATUS,
} from '../../../domain/value-objects/moderation-appeal-status.vo'
import type { ModerationAppealStatus } from '../../../domain/value-objects/moderation-appeal-status.vo'
import { RESTRICTED_USER_STATUSES } from '../../../domain/value-objects/restricted-user-status.vo'
import type { RestrictedUserStatus } from '../../../domain/value-objects/restricted-user-status.vo'
import type {
  MongoIdLike,
  MongoModerationAppealRecord,
  MongoRestrictedUserRecord,
  MongooseObjectLike,
} from './mongo-moderation-appeal.types'

export class MongoModerationAppealMapper {
  toPlainRecord<T>(document: MongooseObjectLike<T>): T {
    return document.toObject()
  }

  toId(value: MongoIdLike | string): string {
    return typeof value === 'string' ? value : value.toString()
  }

  toRestrictedUserEntity(
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

  toModerationAppealEntity(
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

  toModerationAppealEntityOrThrow(
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
    const allowedStatuses: ModerationAppealStatus[] = [
      ...ACTIVE_MODERATION_APPEAL_STATUSES,
      MODERATION_APPEAL_PENDING_STATUS,
    ]

    if (allowedStatuses.includes(status as ModerationAppealStatus)) {
      return status as ModerationAppealStatus
    }

    throw new ModerationAppealDomainError(
      'INVALID_MODERATION_APPEAL_STATUS',
      'Invalid moderation appeal status',
    )
  }
}
