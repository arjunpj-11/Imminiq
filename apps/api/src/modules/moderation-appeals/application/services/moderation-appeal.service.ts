import type {
  SubmitModerationAppealPayload,
  GetModerationAppealStatusPayload,
} from '../../moderation-appeal.schema'

import { mongoModerationAppealRepository } from '../../infrastructure/repositories/mongo-moderation-appeal.repository'
import { SubmitModerationAppealUseCase } from '../use-cases/submit-moderation-appeal.usecase'
import { GetActiveModerationAppealStatusUseCase } from '../use-cases/get-active-moderation-appeal-status.usecase'

const submitModerationAppealUseCase =
  new SubmitModerationAppealUseCase(mongoModerationAppealRepository)

const getActiveModerationAppealStatusUseCase =
  new GetActiveModerationAppealStatusUseCase(
    mongoModerationAppealRepository
  )

export const moderationAppealService = {
  submitAppeal: async (payload: SubmitModerationAppealPayload) => {
    return submitModerationAppealUseCase.execute(payload)
  },

  getActiveAppealStatus: async (
    payload: GetModerationAppealStatusPayload
  ) => {
    return getActiveModerationAppealStatusUseCase.execute(payload)
  },
}
