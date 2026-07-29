export type TrackerTopicContributionStatus = 'pending' | 'approved' | 'rejected';

export type TrackerTopicContributionRecord = {
  id: string;
  sourceTrackerId: string;
  cloneTrackerId: string;
  cloneTopicId: string;
  requesterId: string;
  ownerId: string;
  requester: { name: string; username: string; avatarUrl?: string | null };
  title: string;
  description: string;
  subtopicsCount: number;
  subtopics: Array<{
    title: string;
    description: string;
    depth: number;
    order: number;
  }>;
  status: TrackerTopicContributionStatus;
  createdAt: Date;
  reviewedAt?: Date | null;
  mergedTopicId?: string | null;
  reviewNote?: string | null;
  /** @deprecated Legacy rejection-only field. */
  rejectionReason?: string | null;
};

export type CreateTopicContributionResult =
  | { ok: true; contribution: TrackerTopicContributionRecord; sourceTrackerTitle: string }
  | {
      ok: false;
      reason:
        | 'tracker-not-found'
        | 'not-a-clone'
        | 'source-unavailable'
        | 'topic-not-found'
        | 'not-a-change'
        | 'duplicate';
    };

export type ListTopicContributionsResult =
  | { ok: true; contributions: TrackerTopicContributionRecord[] }
  | { ok: false; reason: 'tracker-not-found' };

export type ReviewTopicContributionResult =
  | { ok: true; contribution: TrackerTopicContributionRecord; sourceTrackerTitle: string }
  | {
      ok: false;
      reason:
        | 'tracker-not-found'
        | 'contribution-not-found'
        | 'already-reviewed'
        | 'merge-conflict'
        | 'source-unavailable';
    };
