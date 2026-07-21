import type {
  UpdateSubtopicProgressResultDTO,
} from '../tracker.dto';
import { TrackerApplicationError } from '../tracker-application.error';
import type { ITrackerMapper } from '../tracker.mapper';
import type { ITrackerRepository } from '../../domain/repositories/tracker.repository.interface';
import type { ITrackerActivityRecorder } from '../../domain/services/tracker-activity.interface';
import type { UpdateSubtopicProgressInput } from '../../domain/trackers.types';
import type { ITrackerPolicyReader } from '../../../../../shared/platform-policy';

type UpdateSubtopicProgressRepository = Pick<
  ITrackerRepository,
  | 'checkAndCompleteParentSubtopic'
  | 'checkAndCompleteTopicAndUnlockNext'
  | 'ensureUserProgressInitialized'
  | 'findOwnedTrackerById'
  | 'getSubtopicById'
  | 'recomputeTrackerProgress'
  | 'unlockNextSubtopic'
  | 'updateSubtopicProgress'
>;

type TopicCompletionResult = Awaited<
  ReturnType<ITrackerRepository['checkAndCompleteTopicAndUnlockNext']>
>;

const getUtcOffsetMinutes = (input: UpdateSubtopicProgressInput): number | undefined => {
  if (
    'utcOffsetMinutes' in input &&
    typeof input.utcOffsetMinutes === 'number' &&
    Number.isFinite(input.utcOffsetMinutes)
  ) {
    return input.utcOffsetMinutes;
  }

  return undefined;
};

const getSafeTitle = (value: string | null | undefined, fallback: string): string => {
  const normalizedValue = value?.trim();

  return normalizedValue || fallback;
};

export interface IUpdateSubtopicProgressUseCase {
  execute(input: UpdateSubtopicProgressInput): Promise<UpdateSubtopicProgressResultDTO>;
}

export class UpdateSubtopicProgressUseCase implements IUpdateSubtopicProgressUseCase {
  constructor(
    private readonly _trackerRepository: UpdateSubtopicProgressRepository,
    private readonly _trackerActivityRecorder: ITrackerActivityRecorder,
    private readonly _trackerMapper: ITrackerMapper,
    private readonly _policyReader: ITrackerPolicyReader
  ) {}

  async execute(input: UpdateSubtopicProgressInput): Promise<UpdateSubtopicProgressResultDTO> {
    const policy = await this._policyReader.getTrackerPolicy();
    const tracker = await this._trackerRepository.findOwnedTrackerById({
      trackerId: input.trackerId,
      userId: input.userId,
    });

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found');
    }

    const existingSubtopic = await this._trackerRepository.getSubtopicById({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
    });

    if (!existingSubtopic) {
      throw TrackerApplicationError.subtopicNotFound('Subtopic not found');
    }

    await this._trackerRepository.ensureUserProgressInitialized({
      userId: input.userId,
      trackerId: input.trackerId,
    });

    const subtopicResult = await this._trackerRepository.updateSubtopicProgress(input);

    if (!subtopicResult) {
      throw TrackerApplicationError.subtopicNotFound('Subtopic not found');
    }

    const topicId = subtopicResult.subtopic.topicId.toString();

    let topicResult: TopicCompletionResult | null = null;

    if (input.status === 'completed') {
      if (subtopicResult.subtopic.depth === 1) {
        await this._trackerRepository.unlockNextSubtopic({
          trackerId: input.trackerId,
          topicId,
          completedSubtopicOrder: subtopicResult.subtopic.order,
          parentSubtopicId: null,
          userId: input.userId,
        });
      }

      if (subtopicResult.subtopic.parentSubtopicId) {
        await this._trackerRepository.checkAndCompleteParentSubtopic({
          trackerId: input.trackerId,
          topicId,
          parentSubtopicId: subtopicResult.subtopic.parentSubtopicId.toString(),
          userId: input.userId,
        });
      }

      topicResult = await this._trackerRepository.checkAndCompleteTopicAndUnlockNext({
        trackerId: input.trackerId,
        topicId,
        userId: input.userId,
      });
    }

    const trackerProgressResult = await this._trackerRepository.recomputeTrackerProgress({
      trackerId: input.trackerId,
      userId: input.userId,
    });

    const utcOffsetMinutes = getUtcOffsetMinutes(input);

    const trackerTitle = getSafeTitle(tracker.title, 'Untitled tracker');

    const subtopicTitle = getSafeTitle(existingSubtopic.title, 'Untitled subtopic');

    /*
     * The current completion state is used instead of only
     * wasNewlyCompleted.
     *
     * Activity event keys are deterministic, so calling the
     * activity service again will not duplicate:
     *
     * - activity records
     * - XP
     * - leaderboard XP events
     * - streak activity
     *
     * This also allows recovery when progress was saved but
     * an earlier activity call failed.
     */
    if (subtopicResult.isCompleted) {
      await this._trackerActivityRecorder.recordSubtopicCompleted({
        userId: input.userId,
        trackerId: input.trackerId,
        topicId,
        subtopicId: input.subtopicId,

        trackerTitle,
        subtopicTitle,

        xpAwarded: policy.subtopicCompletionXp,

        ...(utcOffsetMinutes !== undefined
          ? {
              utcOffsetMinutes,
            }
          : {}),
      });
    }

    if (topicResult?.isCompleted) {
      const topicTitle = getSafeTitle(topicResult.topicTitle, 'Untitled topic');

      await this._trackerActivityRecorder.recordTopicCompleted({
        userId: input.userId,
        trackerId: input.trackerId,
        topicId: topicResult.topicId,

        trackerTitle,
        topicTitle,

        xpAwarded: policy.topicCompletionXp,

        ...(utcOffsetMinutes !== undefined
          ? {
              utcOffsetMinutes,
            }
          : {}),
      });
    }

    if (trackerProgressResult.isCompleted) {
      await this._trackerActivityRecorder.recordTrackerCompleted({
        userId: input.userId,
        trackerId: input.trackerId,

        trackerTitle,

        xpAwarded: policy.trackerCompletionXp,

        ...(utcOffsetMinutes !== undefined
          ? {
              utcOffsetMinutes,
            }
          : {}),
      });
    }

    return this._trackerMapper.toSubtopicProgressResultDto({
      subtopic: subtopicResult.subtopic,
      progress: trackerProgressResult.progress,
    });
  }
}
