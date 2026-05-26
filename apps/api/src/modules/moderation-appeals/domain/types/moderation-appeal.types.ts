export type ModerationAppealStatus = 'pending' | 'under_review'

export interface SubmitModerationAppealPayload {
  identifier: string
  appealReason: string
}

export interface GetModerationAppealStatusPayload {
  identifier: string
}

export interface RestrictedModerationAppealUser {
  _id: {
    toString(): string
  }
}

export interface ActiveModerationAppealRecord {
  caseId: string
  status: ModerationAppealStatus | string
  createdAt: Date
  appealReason: string
}

export interface SubmitModerationAppealResult {
  caseId: string
  status: string
  submittedAt: Date
}

export interface GetActiveModerationAppealStatusResult {
  exists: boolean
  appeal:
    | {
        caseId: string
        status: string
        submittedAt: Date
        appealReason: string
      }
    | null
}
