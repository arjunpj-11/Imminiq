export type ModerationAppealStatus = 'pending' | 'under_review'

export const MODERATION_APPEAL_PENDING_STATUS: ModerationAppealStatus = 'pending'
export const MODERATION_APPEAL_UNDER_REVIEW_STATUS: ModerationAppealStatus =
  'under_review'

export const ACTIVE_MODERATION_APPEAL_STATUSES: readonly ModerationAppealStatus[] = [
  MODERATION_APPEAL_PENDING_STATUS,
  MODERATION_APPEAL_UNDER_REVIEW_STATUS,
]
