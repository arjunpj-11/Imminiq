import {
  COMMUNITY_VERIFICATION_DEFAULT_DURATION_HOURS,
  COMMUNITY_VERIFICATION_DEFAULT_REQUIRED_VOTES,
  COMMUNITY_VERIFICATION_MAX_DURATION_HOURS,
  COMMUNITY_VERIFICATION_MAX_REQUIRED_VOTES,
} from '../../domain/constants/community.constants'
import type { CommunityRepositoryContract } from '../../domain/repositories/community.repository.interface'
import type {
  CommunityVerificationSubmissionView,
  SubmitTrackerForVerificationPayload,
} from '../dtos/community.dto'
import { CommunityApplicationError } from '../errors/community-application.error'
import type { CommunityMapperContract } from '../mappers/community.mapper'

export class SubmitTrackerForVerificationUseCase {
  constructor(
    private readonly repository: CommunityRepositoryContract,
    private readonly mapper: CommunityMapperContract,
  ) {}

  async execute(
    payload: SubmitTrackerForVerificationPayload,
  ): Promise<CommunityVerificationSubmissionView> {
    const submission = await this.repository.submitTrackerForVerification({
      trackerId: payload.trackerId,
      userId: payload.userId,
      requiredVotes: this.normalizeRequiredVotes(payload.requiredVotes),
      durationHours: this.normalizeDurationHours(payload.durationHours),
      urgent: Boolean(payload.urgent),
    })

    if (!submission) {
      throw CommunityApplicationError.notFound(
        'Tracker not found or cannot be submitted for verification',
      )
    }

    return this.mapper.toVerificationSubmissionView(submission)
  }

  private normalizeRequiredVotes(value?: number): number {
    if (!value || value < 1) {
      return COMMUNITY_VERIFICATION_DEFAULT_REQUIRED_VOTES
    }

    return Math.min(
      Math.floor(value),
      COMMUNITY_VERIFICATION_MAX_REQUIRED_VOTES,
    )
  }

  private normalizeDurationHours(value?: number): number {
    if (!value || value < 1) {
      return COMMUNITY_VERIFICATION_DEFAULT_DURATION_HOURS
    }

    return Math.min(
      Math.floor(value),
      COMMUNITY_VERIFICATION_MAX_DURATION_HOURS,
    )
  }
}