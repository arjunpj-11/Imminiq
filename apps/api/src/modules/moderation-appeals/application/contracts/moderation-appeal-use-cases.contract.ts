import type * as Application from '../index'
export type ModerationAppealUseCases = {
  submitModerationAppeal: Application.SubmitModerationAppealUseCase
  getActiveModerationAppealStatus: Application.GetActiveModerationAppealStatusUseCase
}
