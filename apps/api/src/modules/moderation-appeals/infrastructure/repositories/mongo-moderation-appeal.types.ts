import type { ModerationAppealStatus } from '../../domain/value-objects/moderation-appeal-status.vo'
import type { RestrictedUserStatus } from '../../domain/value-objects/restricted-user-status.vo'

export type MongoIdLike = {
  toString(): string
}

export type MongoRestrictedUserRecord = {
  _id: MongoIdLike | string
  status: RestrictedUserStatus | string
}

export type MongoModerationAppealRecord = {
  _id?: MongoIdLike | string
  userId: MongoIdLike | string
  caseId: string
  status: ModerationAppealStatus | string
  identifier: string
  createdAt: Date
  updatedAt?: Date
  appealReason: string
}

export type MongooseObjectLike<T> = {
  toObject(): T
}

export type NormalizedIdentifier = {
  value: string
  isEmail: boolean
}

export type MongoDuplicateKeyError = {
  code?: number
}