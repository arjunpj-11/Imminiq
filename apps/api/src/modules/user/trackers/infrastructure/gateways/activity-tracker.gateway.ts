import type { IRecordUserActivityUseCase } from '../../../activity'
import type {
  RecordTrackerCompletedActivityInput,
  RecordTrackerSubtopicCompletedActivityInput,
  RecordTrackerTopicCompletedActivityInput,
  ITrackerActivityRecorder,
} from '../../domain/services/tracker-activity.interface'

export class ActivityTrackerGateway
  implements ITrackerActivityRecorder
{
  constructor(
    private readonly _activityRecorder: IRecordUserActivityUseCase,
  ) {}
  async recordSubtopicCompleted(
    input: RecordTrackerSubtopicCompletedActivityInput,
  ): Promise<void> {
    await this._activityRecorder.execute({
      userId: input.userId,

      category: 'tracker',
      type: 'subtopic_completed',

      title: `Completed ${input.subtopicTitle}`,
      subtitle: input.trackerTitle,

      xpAwarded: input.xpAwarded,
      xpBucket:
        input.xpAwarded > 0 ? 'learning' : 'none',
      coinsAwarded: 0,

      eventKey: [
        'tracker-subtopic-completed',
        input.userId,
        input.trackerId,
        input.subtopicId,
      ].join(':'),

      trackerId: input.trackerId,
      topicId: input.topicId,
      subtopicId: input.subtopicId,

      details: {},

      ...(input.utcOffsetMinutes !== undefined
        ? {
            utcOffsetMinutes: input.utcOffsetMinutes,
          }
        : {}),
    })
  }

  async recordTopicCompleted(
    input: RecordTrackerTopicCompletedActivityInput,
  ): Promise<void> {
    await this._activityRecorder.execute({
      userId: input.userId,

      category: 'tracker',
      type: 'topic_completed',

      title: `Completed ${input.topicTitle}`,
      subtitle: input.trackerTitle,

      xpAwarded: input.xpAwarded,
      xpBucket:
        input.xpAwarded > 0 ? 'learning' : 'none',
      coinsAwarded: 0,

      eventKey: [
        'tracker-topic-completed',
        input.userId,
        input.trackerId,
        input.topicId,
      ].join(':'),

      trackerId: input.trackerId,
      topicId: input.topicId,

      details: {},

      ...(input.utcOffsetMinutes !== undefined
        ? {
            utcOffsetMinutes: input.utcOffsetMinutes,
          }
        : {}),
    })
  }

  async recordTrackerCompleted(
    input: RecordTrackerCompletedActivityInput,
  ): Promise<void> {
    await this._activityRecorder.execute({
      userId: input.userId,

      category: 'tracker',
      type: 'tracker_completed',

      title: `Completed ${input.trackerTitle}`,
      subtitle: 'Tracker completed',

      xpAwarded: input.xpAwarded,
      xpBucket:
        input.xpAwarded > 0 ? 'learning' : 'none',
      coinsAwarded: 0,

      eventKey: [
        'tracker-completed',
        input.userId,
        input.trackerId,
      ].join(':'),

      trackerId: input.trackerId,

      details: {},

      ...(input.utcOffsetMinutes !== undefined
        ? {
            utcOffsetMinutes: input.utcOffsetMinutes,
          }
        : {}),
    })
  }
}
