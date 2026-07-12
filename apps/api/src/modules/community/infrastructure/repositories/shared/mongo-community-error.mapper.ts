import { CommunityDomainError } from '../../../domain/community-domain.error'

export type ErrorMapper = (error: unknown) => CommunityDomainError | null

type MongoDuplicateKeyError = {
  code?: number
  keyPattern?: Record<string, unknown>
}

export class MongoCommunityErrorMapper {
  mapDuplicateVote(error: unknown): CommunityDomainError | null {
    if (this.isDuplicateKeyError(error)) {
      return new CommunityDomainError(
        'COMMUNITY_DUPLICATE_VOTE',
        'You have already reviewed this submission',
      )
    }

    return null
  }

  mapDuplicateClone(error: unknown): CommunityDomainError | null {
    if (this.isDuplicateKeyError(error)) {
      return new CommunityDomainError(
        'COMMUNITY_DUPLICATE_CLONE',
        'Tracker already cloned',
      )
    }

    return null
  }

  private isDuplicateKeyError(error: unknown): error is MongoDuplicateKeyError {
    return Boolean(
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as MongoDuplicateKeyError).code === 11000,
    )
  }
}
