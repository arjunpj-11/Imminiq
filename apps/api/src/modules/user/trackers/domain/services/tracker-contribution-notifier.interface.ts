import type { TrackerTopicContributionRecord } from '../tracker-topic-contribution.types';

export interface ITrackerContributionNotifier {
  contributionRequested(input: {
    contribution: TrackerTopicContributionRecord;
    sourceTrackerTitle: string;
  }): Promise<void>;
  contributionReviewed(input: {
    contribution: TrackerTopicContributionRecord;
    sourceTrackerTitle: string;
  }): Promise<void>;
}
