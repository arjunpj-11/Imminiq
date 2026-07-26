export type AdminTrackerReview = {
  id: string;
  trackerId: string;
  title: string;
  owner: string;
  category: string;
  status: string;
  urgent: boolean;
  passVotes: number;
  failVotes: number;
  createdAt: Date;
};
export type AdminTrackerReviewStatusResult = {
  id: string;
  status: string;
  rewardContext?: {
    submissionId: string;
    consensusChoice: 'pass' | 'fail';
    trackerId: string;
    ownerId: string;
    trackerTitle: string;
  };
};
export type AdminTrackerReviewConsensusChoice = 'pass' | 'fail';
export type AdminTrackerReviewConsensusResult = {
  id: string;
  passVotes: number;
  failVotes: number;
};
export type AdminTrackerReviewConsensusRepositoryResult =
  | { kind: 'success'; value: AdminTrackerReviewConsensusResult }
  | { kind: 'not_found' }
  | { kind: 'not_open' };
