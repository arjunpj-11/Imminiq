import type { ModerationAppealEntity } from '../entities/moderation-appeal.entity'

export type CreateModerationAppealInput = {
  userId: string
  caseId: string
  identifier: string
  appealReason: string
}

export interface IModerationAppealCommandRepository {
  createAppeal(
    data: CreateModerationAppealInput
  ): Promise<ModerationAppealEntity>
}