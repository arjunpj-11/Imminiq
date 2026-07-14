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
  createdAt: string;
};
