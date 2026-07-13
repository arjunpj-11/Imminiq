import type * as Application from './index';
export type ModerationAppealUseCases = {
  submitModerationAppeal: Application.ISubmitModerationAppealUseCase;
  getActiveModerationAppealStatus: Application.IGetActiveModerationAppealStatusUseCase;
};
