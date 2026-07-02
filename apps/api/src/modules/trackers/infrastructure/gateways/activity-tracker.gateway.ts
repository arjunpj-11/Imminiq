import { activityService } from '../../../activity'
import type {
  RecordTrackerCompletedActivityInput,
  RecordTrackerSubtopicCompletedActivityInput,
  RecordTrackerTopicCompletedActivityInput,
  TrackerActivityServiceContract,
} from '../../domain/services/tracker-activity.service.interface'

export class ActivityTrackerGateway
  implements TrackerActivityServiceContract
{
  async recordSubtopicCompleted(
    input: RecordTrackerSubtopicCompletedActivityInput,
  ): Promise<void> {
    await activityService.recordActivity({
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
    await activityService.recordActivity({
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
    await activityService.recordActivity({
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

export const activityTrackerGateway =
  new ActivityTrackerGateway()