import type { RecordUserActivityPayloadDTO } from './activity.dto';
import { ActivityApplicationError } from './activity-application.error';
import type { ActivityCategory } from '../domain/value-objects/activity-category.vo';
import type { ActivityType } from '../domain/value-objects/activity-type.vo';

const ALLOWED_TYPES_BY_CATEGORY: Record<ActivityCategory, readonly ActivityType[]> = {
  tracker: ['subtopic_completed', 'topic_completed', 'tracker_completed'],

  mock_test: ['mock_test_generated', 'mock_test_completed'],

  community: ['tracker_cloned', 'tracker_verified', 'community_review_completed'],

  streak: ['streak_milestone', 'daily_goal_completed'],

  xp_milestone: ['xp_milestone'],
};

export class ActivityEventPolicy {
  ensureValid(payload: RecordUserActivityPayloadDTO): void {
    const title = payload.title.trim();
    const eventKey = payload.eventKey.trim();
    const subtitle = payload.subtitle?.trim() ?? '';

    if (title.length < 1 || title.length > 180) {
      throw ActivityApplicationError.invalidEvent(
        'Activity title must contain between 1 and 180 characters'
      );
    }

    if (subtitle.length > 300) {
      throw ActivityApplicationError.invalidEvent('Activity subtitle cannot exceed 300 characters');
    }

    if (eventKey.length < 8 || eventKey.length > 250) {
      throw ActivityApplicationError.invalidEvent(
        'Activity event key must contain between 8 and 250 characters'
      );
    }

    if (!ALLOWED_TYPES_BY_CATEGORY[payload.category].includes(payload.type)) {
      throw ActivityApplicationError.invalidEvent(
        `Activity type ${payload.type} is not valid for category ${payload.category}`
      );
    }

    const xpAwarded = payload.xpAwarded ?? 0;
    const coinsAwarded = payload.coinsAwarded ?? 0;
    const xpBucket = payload.xpBucket ?? 'none';

    if (!Number.isInteger(xpAwarded) || xpAwarded < 0) {
      throw ActivityApplicationError.invalidEvent('Activity XP must be a non-negative integer');
    }

    if (!Number.isInteger(coinsAwarded) || coinsAwarded < 0) {
      throw ActivityApplicationError.invalidEvent('Activity coins must be a non-negative integer');
    }

    if (xpAwarded > 0 && xpBucket === 'none') {
      throw ActivityApplicationError.invalidEvent(
        'An XP bucket is required when activity XP is greater than zero'
      );
    }

    if (xpAwarded === 0 && xpBucket !== 'none') {
      throw ActivityApplicationError.invalidEvent('XP bucket must be none when no XP is awarded');
    }

    this.ensureValidDetails(payload);
  }

  private ensureValidDetails(payload: RecordUserActivityPayloadDTO): void {
    const details = payload.details;

    if (!details) {
      return;
    }

    if (
      details.scorePercentage !== undefined &&
      (details.scorePercentage < 0 || details.scorePercentage > 100)
    ) {
      throw ActivityApplicationError.invalidEvent(
        'Activity score percentage must be between 0 and 100'
      );
    }

    if (
      details.correctAnswers !== undefined &&
      details.totalQuestions !== undefined &&
      details.correctAnswers > details.totalQuestions
    ) {
      throw ActivityApplicationError.invalidEvent('Correct answers cannot exceed total questions');
    }
  }
}
