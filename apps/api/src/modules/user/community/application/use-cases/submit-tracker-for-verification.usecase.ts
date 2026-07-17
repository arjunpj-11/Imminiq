import {
  COMMUNITY_VERIFICATION_MAX_DURATION_HOURS,
  COMMUNITY_VERIFICATION_MAX_REQUIRED_VOTES,
} from '../../domain/community.constants';
import type { ICommunityVerificationRepository } from '../../domain/repositories/community-verification.repository.interface';
import type {
  CommunityVerificationSubmissionViewDTO,
  SubmitTrackerForVerificationPayloadDTO,
} from '../community.dto';
import { CommunityApplicationError } from '../community-application.error';
import type { ICommunityMapper } from '../community.mapper';
import type { ICommunityPolicyReader } from '../../../../../shared/platform-policy';

export interface ISubmitTrackerForVerificationUseCase {
  execute(
    payload: SubmitTrackerForVerificationPayloadDTO
  ): Promise<CommunityVerificationSubmissionViewDTO>;
}

export class SubmitTrackerForVerificationUseCase implements ISubmitTrackerForVerificationUseCase {
  constructor(
    private readonly _repository: ICommunityVerificationRepository,
    private readonly _mapper: ICommunityMapper,
    private readonly _policyReader: ICommunityPolicyReader
  ) {}

  async execute(
    payload: SubmitTrackerForVerificationPayloadDTO
  ): Promise<CommunityVerificationSubmissionViewDTO> {
    const policy = await this._policyReader.getCommunityPolicy();
    const submission = await this._repository.submitTrackerForVerification({
      trackerId: payload.trackerId,
      userId: payload.userId,
      requiredVotes: this.normalizeRequiredVotes(
        payload.requiredVotes,
        policy.verificationRequiredVotes
      ),
      durationHours: this.normalizeDurationHours(
        payload.durationHours,
        policy.verificationDurationHours
      ),
      urgent: Boolean(payload.urgent),
    });

    if (!submission) {
      throw CommunityApplicationError.notFound(
        'Tracker not found or cannot be submitted for verification'
      );
    }

    return this._mapper.toVerificationSubmissionView(submission);
  }

  private normalizeRequiredVotes(value: number | undefined, defaultValue: number): number {
    if (!value || value < 1) {
      return defaultValue;
    }

    return Math.min(Math.floor(value), COMMUNITY_VERIFICATION_MAX_REQUIRED_VOTES);
  }

  private normalizeDurationHours(value: number | undefined, defaultValue: number): number {
    if (!value || value < 1) {
      return defaultValue;
    }

    return Math.min(Math.floor(value), COMMUNITY_VERIFICATION_MAX_DURATION_HOURS);
  }
}
