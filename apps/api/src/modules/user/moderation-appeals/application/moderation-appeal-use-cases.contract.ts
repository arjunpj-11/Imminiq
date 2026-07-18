import type * as Application from './index';
import type { IContentModerationAppealService } from './content-moderation-appeal.service';
export type ModerationAppealUseCases = {
  submitModerationAppeal: Application.ISubmitModerationAppealUseCase;
  getActiveModerationAppealStatus: Application.IGetActiveModerationAppealStatusUseCase;
  contentAppeals: IContentModerationAppealService;
};
