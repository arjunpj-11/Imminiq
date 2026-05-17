import type {
  RestrictedModerationAppealUser,
  ActiveModerationAppealRecord,
} from '../types/moderation-appeal.types'

export interface CreateModerationAppealInput {
  userId: string
  caseId: string
  identifier: string
  appealReason: string
}

export interface ModerationAppealRepository {
  findRestrictedUserByIdentifier(
    identifier: string
  ): Promise<RestrictedModerationAppealUser | null>

  findActiveAppealForUser(
    userId: string
  ): Promise<ActiveModerationAppealRecord | null>

  caseIdExists(caseId: string): Promise<boolean>

  createAppeal(
    data: CreateModerationAppealInput
  ): Promise<ActiveModerationAppealRecord>

  findLatestActiveAppealForRestrictedIdentifier(
    identifier: string
  ): Promise<ActiveModerationAppealRecord | null>
}
