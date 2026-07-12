import type * as Application from './index'
export type ActivityUseCases = {
  getPage: Application.IGetActivityPageUseCase
  getFeed: Application.IGetActivityFeedUseCase
  recordActivity: Application.IRecordUserActivityUseCase
}
