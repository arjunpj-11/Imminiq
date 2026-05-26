import { mongoModerationAppealRepository } from './infrastructure/repositories/mongo-moderation-appeal.repository'
import { SubmitModerationAppealUseCase } from './application/use-cases/submit-moderation-appeal.usecase'
import { GetActiveModerationAppealStatusUseCase } from './application/use-cases/get-active-moderation-appeal-status.usecase'
import type {
  GetModerationAppealStatusPayload,
  SubmitModerationAppealPayload,
} from './domain/types/moderation-appeal.types'

const moderationAppealRepository = mongoModerationAppealRepository

const submitModerationAppealUseCase =
  new SubmitModerationAppealUseCase(moderationAppealRepository)

const getActiveModerationAppealStatusUseCase =
  new GetActiveModerationAppealStatusUseCase(
    moderationAppealRepository
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
