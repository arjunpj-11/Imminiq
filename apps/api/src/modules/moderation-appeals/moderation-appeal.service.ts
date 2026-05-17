import crypto from 'crypto'

import { ApiError } from '../../shared/utils/ApiError'
import { moderationAppealRepository } from './moderation-appeal.repository'
import type {
  SubmitModerationAppealPayload,
  GetModerationAppealStatusPayload,
} from './moderation-appeal.schema'

const generateCaseId = async (): Promise<string> => {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const randomPart = crypto.randomInt(1000, 10000).toString()
    const caseId = `CASE-IQ-${randomPart}`

    const exists = await moderationAppealRepository.caseIdExists(caseId)

    if (!exists) {
      return caseId
    }
  }

  throw new ApiError(
    500,
    'Unable to generate an appeal case ID. Please try again.',
    'APPEAL_CASE_ID_GENERATION_FAILED'
  )
}

export const moderationAppealService = {
  submitAppeal: async (payload: SubmitModerationAppealPayload) => {
    const user =
      await moderationAppealRepository.findRestrictedUserByIdentifier(
        payload.identifier
      )

    if (!user) {
      throw new ApiError(
        404,
        'No restricted account was found for this email or phone number.',
        'RESTRICTED_ACCOUNT_NOT_FOUND'
      )
    }

    const existingAppeal =
      await moderationAppealRepository.findActiveAppealForUser(
        user._id.toString()
      )

    if (existingAppeal) {
      throw new ApiError(
        409,
        'An appeal is already under review for this account.',
        'ACTIVE_APPEAL_ALREADY_EXISTS'
      )
    }

    const caseId = await generateCaseId()

    const appeal = await moderationAppealRepository.createAppeal({
      userId: user._id.toString(),
      caseId,
      identifier: payload.identifier,
      appealReason: payload.appealReason,
    })

    return {
      caseId: appeal.caseId,
      status: appeal.status,
      submittedAt: appeal.createdAt,
    }
  },

  getActiveAppealStatus: async (
  payload: GetModerationAppealStatusPayload
) => {
  const appeal =
    await moderationAppealRepository.findLatestActiveAppealForRestrictedIdentifier(
      payload.identifier
    )

  if (!appeal) {
    return {
      exists: false,
      appeal: null,
    }
  }

  return {
    exists: true,
    appeal: {
  caseId: appeal.caseId,
  status: appeal.status,
  submittedAt: appeal.createdAt,
  appealReason: appeal.appealReason,
},
  }
},
}