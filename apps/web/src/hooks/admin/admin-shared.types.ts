export type AdminContentAppeal = {
  id: string;
  title: string;
  moderationStatus: string;
  ownerName: string;
  ownerEmail?: string;
  reason: string;
  evidenceUrls: string[];
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  assignedTo?: string;
  createdAt: string;
};

export type AdminContentAppealsData = {
  items: AdminContentAppeal[];
  stats: { pending: number; underReview: number; approved: number; rejected: number };
  pagination: { page: number; pages: number };
};

export type AdminContentAppealDecision = {
  id: string;
  decisionStatus: 'under_review' | 'approved' | 'rejected';
  decisionNote: string;
  actionPassword: string;
};
