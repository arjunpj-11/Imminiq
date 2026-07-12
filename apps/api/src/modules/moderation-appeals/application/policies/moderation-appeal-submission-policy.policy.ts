import type { ModerationAppealEntity } from '../../domain/entities/moderation-appeal.entity'
import type { RestrictedModerationUserEntity } from '../../domain/entities/restricted-moderation-user.entity'
import { ModerationAppealApplicationError } from '../errors/moderation-appeal-application.error'

export interface IModerationAppealSubmissionPolicy {
  ensureRestrictedUserExists(
    user: RestrictedModerationUserEntity | null,
  ): asserts user is RestrictedModerationUserEntity
  ensureNoActiveAppeal(appeal: ModerationAppealEntity | null): void
}

export class ModerationAppealSubmissionPolicy
  implements IModerationAppealSubmissionPolicy
{
  ensureRestrictedUserExists(
    user: RestrictedModerationUserEntity | null,
  ): asserts user is RestrictedModerationUserEntity {
    if (!user) {
      throw ModerationAppealApplicationError.restrictedAccountNotFound()
    }
  }

  ensureNoActiveAppeal(appeal: ModerationAppealEntity | null): void {
    if (appeal) {
      throw ModerationAppealApplicationError.activeAppealAlreadyExists()
    }
  }
}
