export interface AdminTrackerReviewDTO {
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
}

export interface AdminTrackerReviewStatusResultDTO {
  id: string;
  status: string;
}

export interface AdminTrackerReviewConsensusResultDTO {
  id: string;
  passVotes: number;
  failVotes: number;
}
