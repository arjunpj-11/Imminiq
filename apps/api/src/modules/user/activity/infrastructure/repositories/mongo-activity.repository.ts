import type {
  RecordUserActivityInput,
} from '../../domain/repositories/activity-command.repository.interface'
import type {
  IActivityRepository,
} from '../../domain/repositories/activity.repository.interface'
import type {
  FindActivityAnalyticsInput,
  FindActivityFeedInput,
  FindDailyGoalStateInput,
} from '../../domain/repositories/activity-query.repository.interface'
import { MongoActivityCommandRepository } from './internal/mongo-activity-command.repository'
import { MongoActivityQueryRepository } from './internal/mongo-activity-query.repository'

export class MongoActivityRepository
  implements IActivityRepository
{
  constructor(
    private readonly _queryRepository =
      new MongoActivityQueryRepository(),
    private readonly _commandRepository =
      new MongoActivityCommandRepository(),
  ) {}

  findActivityFeed(input: FindActivityFeedInput) {
    return this._queryRepository.findActivityFeed(input)
  }

  findActivityAnalytics(
    input: FindActivityAnalyticsInput,
  ) {
    return this._queryRepository.findActivityAnalytics(
      input,
    )
  }

  findDailyGoalState(
    input: FindDailyGoalStateInput,
  ) {
    return this._queryRepository.findDailyGoalState(
      input,
    )
  }

  recordActivityAndApplyReward(
    input: RecordUserActivityInput,
  ) {
    return this._commandRepository.recordActivityAndApplyReward(
      input,
    )
  }
}

export const mongoActivityRepository =
  new MongoActivityRepository()
