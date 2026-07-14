export interface IAdminTrackerReviewDTO {
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

export interface IAdminTrackerReviewStatusResultDTO {
  id: string;
  status: string;
}

export interface IAdminTrackerReviewConsensusResultDTO {
  id: string;
  passVotes: number;
  failVotes: number;
}
