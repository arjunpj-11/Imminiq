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
  private readonly _useCases: ModerationAppealComposition['useCases']

  constructor(composition: ModerationAppealComposition) {
    this._useCases = composition.useCases
  }

  submitAppeal(
    payload: SubmitModerationAppealPayload
  ): Promise<SubmitModerationAppealResultDto> {
    return this._useCases.submitModerationAppeal.execute(payload)
  }

  getActiveAppealStatus(
    payload: GetModerationAppealStatusPayload
  ): Promise<GetActiveModerationAppealStatusResultDto> {
    return this._useCases.getActiveModerationAppealStatus.execute(payload)
  }
}

export const moderationAppealService = new ModerationAppealService(
  createModerationAppealComposition()
)