export type AdminTrackerReview = { id: string; title: string; owner: string; category: string; status: string; urgent: boolean; passVotes: number; failVotes: number; createdAt: Date }
export type AdminTrackerReviewStatusResult = { id: string; status: string }
