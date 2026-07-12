import type { CommunityVerificationSubmissionEntity } from '../../domain/entities/community-verification-submission.entity'
import { CommunityApplicationError } from '../errors/community-application.error'
import type { IClock } from '../../../../shared/time/clock.interface'

export interface ICommunityVerificationPolicy {
  ensureCanVote(submission: CommunityVerificationSubmissionEntity, userId: string): void
}

export class CommunityVerificationPolicy
  implements ICommunityVerificationPolicy
{
  constructor(private readonly clock: IClock) {}

  ensureCanVote(submission: CommunityVerificationSubmissionEntity, userId: string): void {
    if (submission.ownerId === userId) {
      throw CommunityApplicationError.forbidden(
        'You cannot review your own submission',
      )
    }

    if (submission.status !== 'open') {
      throw CommunityApplicationError.conflict('This review is already closed')
    }

    if (submission.expiresAt && submission.expiresAt.getTime() <= this.clock.now().getTime()) {
      throw CommunityApplicationError.conflict('This review window has expired')
    }
  }
}
