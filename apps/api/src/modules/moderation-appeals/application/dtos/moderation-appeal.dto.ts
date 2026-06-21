import type { ModerationAppealStatus } from '../../domain/value-objects/moderation-appeal-status.vo'

export interface SubmitModerationAppealPayload {
  identifier: string
  appealReason: string
}

export interface GetModerationAppealStatusPayload {
  identifier: string
}

export interface ModerationAppealStatusDto {
  caseId: string
  status: ModerationAppealStatus
  submittedAt: Date
  appealReason: string
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
