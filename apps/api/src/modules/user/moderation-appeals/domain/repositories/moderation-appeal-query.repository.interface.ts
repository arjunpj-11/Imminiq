import type { ModerationAppealEntity } from '../entities/moderation-appeal.entity';
import type { RestrictedModerationUserEntity } from '../entities/restricted-moderation-user.entity';

export interface IModerationAppealQueryRepository {
  findRestrictedUserByIdentifier(
    identifier: string
  ): Promise<RestrictedModerationUserEntity | null>;

  findActiveAppealForUser(userId: string): Promise<ModerationAppealEntity | null>;

  findLatestActiveAppealForRestrictedIdentifier(
    identifier: string
  ): Promise<ModerationAppealEntity | null>;

  caseIdExists(caseId: string): Promise<boolean>;
}
