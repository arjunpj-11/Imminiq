import type { ModerationAppealStatus } from '../../domain/value-objects/moderation-appeal-status.vo'

export interface ISubmitModerationAppealPayloadDTO {
  userId: string
  identifier: string
  appealReason: string
}

export interface IGetModerationAppealStatusPayloadDTO {
  userId: string
  identifier: string
}

export interface IModerationAppealStatusDTO {
  caseId: string
  status: ModerationAppealStatus
  submittedAt: Date
}

export interface ISubmitModerationAppealResultDTO {
  caseId: string
  status: ModerationAppealStatus
  submittedAt: Date
}

export interface IGetActiveModerationAppealStatusResultDTO {
  exists: boolean
  appeal: IModerationAppealStatusDTO | null
}
