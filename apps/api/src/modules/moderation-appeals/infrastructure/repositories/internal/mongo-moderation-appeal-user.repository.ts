import type { RestrictedModerationUserEntity } from '../../../domain/entities/restricted-moderation-user.entity'
import { MongoModerationAppealBaseRepository } from '../shared/mongo-moderation-appeal-base.repository'
import { MongoModerationAppealMapper } from '../shared/mongo-moderation-appeal.mapper'
import {
  MongoModerationAppealRestrictedUserReader,
  mongoModerationAppealRestrictedUserReader,
} from './mongo-moderation-appeal-restricted-user.reader'

export class MongoModerationAppealUserRepository extends MongoModerationAppealBaseRepository {
  constructor(
    private readonly _mapper = new MongoModerationAppealMapper(),
    private readonly _restrictedUserReader: MongoModerationAppealRestrictedUserReader =
      mongoModerationAppealRestrictedUserReader,
  ) {
    super()
  }

  async findRestrictedUserByIdentifier(
    identifier: string,
  ): Promise<RestrictedModerationUserEntity | null> {
    return this.execute(
      'RESTRICTED_USER_READ_FAILED',
      'Failed to read restricted moderation user',
      async () => {
        const user = await this._restrictedUserReader.findByIdentifier(identifier)

        return this._mapper.toRestrictedUserEntity(user)
      },
    )
  }
}

export const mongoModerationAppealUserRepository =
  new MongoModerationAppealUserRepository()
