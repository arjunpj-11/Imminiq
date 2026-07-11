import type { CommunityVerificationSubmissionEntity } from '../../domain/entities/community-verification-submission.entity'
import { CommunityApplicationError } from '../errors/community-application.error'

export interface ICommunityVerificationPolicy {
  ensureCanVote(submission: CommunityVerificationSubmissionEntity, userId: string): void
}

export class CommunityVerificationPolicy
  implements ICommunityVerificationPolicy
{
  ensureCanVote(submission: CommunityVerificationSubmissionEntity, userId: string): void {
    if (submission.ownerId === userId) {
      throw CommunityApplicationError.forbidden(
        'You cannot review your own submission',
      )
    }

    if (submission.status !== 'open') {
      throw CommunityApplicationError.conflict('This review is already closed')
    }

    if (submission.expiresAt && submission.expiresAt.getTime() <= Date.now()) {
      throw CommunityApplicationError.conflict('This review window has expired')
    }
  }
}
