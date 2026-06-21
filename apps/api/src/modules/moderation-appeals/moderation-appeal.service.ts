import type {
  GetActiveModerationAppealStatusResultDto,
  GetModerationAppealStatusPayload,
  SubmitModerationAppealPayload,
  SubmitModerationAppealResultDto,
} from './application/dtos/moderation-appeal.dto'
import {
  createModerationAppealComposition,
  type ModerationAppealComposition,
} from './moderation-appeal.factory'

export class ModerationAppealService {
  private readonly useCases: ModerationAppealComposition['useCases']

  constructor(composition: ModerationAppealComposition) {
    this.useCases = composition.useCases
  }

  submitAppeal(
    payload: SubmitModerationAppealPayload
  ): Promise<SubmitModerationAppealResultDto> {
    return this.useCases.submitModerationAppeal.execute(payload)
  }

  getActiveAppealStatus(
    payload: GetModerationAppealStatusPayload
  ): Promise<GetActiveModerationAppealStatusResultDto> {
    return this.useCases.getActiveModerationAppealStatus.execute(payload)
  }
}

export const moderationAppealService = new ModerationAppealService(
  createModerationAppealComposition()
)