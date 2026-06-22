import type { CommunityTrackerRepositoryContract } from './community-tracker.repository.interface'
import type { CommunityVerificationRepositoryContract } from './community-verification.repository.interface'

export interface CommunityRepositoryContract
  extends CommunityTrackerRepositoryContract,
    CommunityVerificationRepositoryContract {}
