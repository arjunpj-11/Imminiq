import type { ICreateNotificationUseCase } from '../../../../notifications';
import type { ITrackerContributionNotifier } from '../../domain';

export class TrackerContributionNotificationGateway implements ITrackerContributionNotifier {
  constructor(private readonly _createNotification: ICreateNotificationUseCase) {}

  async contributionRequested(input: Parameters<ITrackerContributionNotifier['contributionRequested']>[0]) {
    try {
      await this._createNotification.execute({
        userId: input.contribution.ownerId,
        type: 'tracker_topic_contribution_requested',
        message: `${input.contribution.requester.name} proposed “${input.contribution.title}” for ${input.sourceTrackerTitle}.`,
        deepLink: `/trackers/${input.contribution.sourceTrackerId}/manage`,
        metadata: { contributionId: input.contribution.id },
      });
    } catch (error) {
      console.error('[Tracker contribution] Owner notification failed:', error);
    }
  }

  async contributionReviewed(input: Parameters<ITrackerContributionNotifier['contributionReviewed']>[0]) {
    try {
      const approved = input.contribution.status === 'approved';
      await this._createNotification.execute({
        userId: input.contribution.requesterId,
        type: approved
          ? 'tracker_topic_contribution_approved'
          : 'tracker_topic_contribution_rejected',
        message: approved
          ? `Your topic “${input.contribution.title}” was merged into ${input.sourceTrackerTitle}.${
              input.contribution.reviewNote
                ? ` Review note: ${input.contribution.reviewNote}`
                : ''
            }`
          : `Your topic proposal “${input.contribution.title}” was not accepted for ${input.sourceTrackerTitle}.${
              input.contribution.reviewNote
                ? ` Review note: ${input.contribution.reviewNote}`
                : ''
            }`,
        deepLink: approved
          ? `/community/trackers/${input.contribution.sourceTrackerId}`
          : `/trackers/${input.contribution.cloneTrackerId}/manage`,
        metadata: { contributionId: input.contribution.id },
      });
    } catch (error) {
      console.error('[Tracker contribution] Contributor notification failed:', error);
    }
  }
}
