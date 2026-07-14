import {
  COMMUNITY_VERIFICATION_DEFAULT_DURATION_HOURS,
  COMMUNITY_VERIFICATION_DEFAULT_REQUIRED_VOTES,
  COMMUNITY_VERIFICATION_MAX_DURATION_HOURS,
  COMMUNITY_VERIFICATION_MAX_REQUIRED_VOTES,
} from '../../domain/community.constants';
import type { ICommunityRepository } from '../../domain/repositories/community.repository.interface';
import type {
  ICommunityVerificationSubmissionViewDTO,
  ISubmitTrackerForVerificationPayloadDTO,
} from '../community.dto';
import { CommunityApplicationError } from '../community-application.error';
import type { ICommunityMapper } from '../community.mapper';

export interface ISubmitTrackerForVerificationUseCase {
  execute(
    payload: ISubmitTrackerForVerificationPayloadDTO
  ): Promise<ICommunityVerificationSubmissionViewDTO>;
}

export class SubmitTrackerForVerificationUseCase implements ISubmitTrackerForVerificationUseCase {
  constructor(
    private readonly _repository: ICommunityRepository,
    private readonly _mapper: ICommunityMapper
  ) {}

  async execute(
    payload: ISubmitTrackerForVerificationPayloadDTO
  ): Promise<ICommunityVerificationSubmissionViewDTO> {
    const submission = await this._repository.submitTrackerForVerification({
      trackerId: payload.trackerId,
      userId: payload.userId,
      requiredVotes: this.normalizeRequiredVotes(payload.requiredVotes),
      durationHours: this.normalizeDurationHours(payload.durationHours),
      urgent: Boolean(payload.urgent),
    });

    if (!submission) {
      throw CommunityApplicationError.notFound(
        'Tracker not found or cannot be submitted for verification'
      );
    }

    return this._mapper.toVerificationSubmissionView(submission);
  }

  private normalizeRequiredVotes(value?: number): number {
    if (!value || value < 1) {
      return COMMUNITY_VERIFICATION_DEFAULT_REQUIRED_VOTES;
    }

    return Math.min(Math.floor(value), COMMUNITY_VERIFICATION_MAX_REQUIRED_VOTES);
  }

  private normalizeDurationHours(value?: number): number {
    if (!value || value < 1) {
      return COMMUNITY_VERIFICATION_DEFAULT_DURATION_HOURS;
    }

    return Math.min(Math.floor(value), COMMUNITY_VERIFICATION_MAX_DURATION_HOURS);
  }
}
