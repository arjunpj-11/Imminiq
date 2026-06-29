import { User } from '../../../../../infrastructure/database/models/user.model'
import { RESTRICTED_USER_STATUSES } from '../../../domain/value-objects/restricted-user-status.vo'
import { MongoModerationAppealNormalizer } from '../shared/mongo-moderation-appeal-normalizer'
import type { MongoRestrictedUserRecord } from '../shared/mongo-moderation-appeal.types'

export class MongoModerationAppealRestrictedUserReader {
  async findByIdentifier(
    identifier: string,
  ): Promise<MongoRestrictedUserRecord | null> {
    const normalized = MongoModerationAppealNormalizer.identifier(identifier)

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

export const mongoModerationAppealRestrictedUserReader =
  new MongoModerationAppealRestrictedUserReader()
