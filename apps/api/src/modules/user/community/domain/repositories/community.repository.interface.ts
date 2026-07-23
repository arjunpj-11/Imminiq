import type { ICommunityTrackerRepository } from './community-tracker.repository.interface';
import type { ICommunityVerificationRepository } from './community-verification.repository.interface';

export interface ICommunityRepository
  extends ICommunityTrackerRepository,
    ICommunityVerificationRepository {}
