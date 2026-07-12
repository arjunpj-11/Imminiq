import type * as Application from '../index'
export type ActivityUseCases = {
  getPage: Application.GetActivityPageUseCase
  getFeed: Application.GetActivityFeedUseCase
  recordActivity: Application.RecordUserActivityUseCase
}
