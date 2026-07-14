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
export type AdminTrackerReviewStatusResult = { id: string; status: string };
export type AdminTrackerReviewConsensusChoice = 'pass' | 'fail';
export type AdminTrackerReviewConsensusResult = {
  id: string;
  passVotes: number;
  failVotes: number;
};
