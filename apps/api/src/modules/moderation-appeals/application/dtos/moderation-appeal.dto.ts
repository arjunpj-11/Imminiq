import type { ModerationAppealStatus } from '../../domain/value-objects/moderation-appeal-status.vo'

export interface SubmitModerationAppealPayload {
  userId: string
  identifier: string
  appealReason: string
}

export interface GetModerationAppealStatusPayload {
  userId: string
  identifier: string
}

export interface ModerationAppealStatusDto {
  caseId: string
  status: ModerationAppealStatus
  submittedAt: Date
}

export interface SubmitModerationAppealResultDto {
  caseId: string
  status: ModerationAppealStatus
  submittedAt: Date
}

export interface GetActiveModerationAppealStatusResultDto {
  exists: boolean
  appeal: ModerationAppealStatusDto | null
}
