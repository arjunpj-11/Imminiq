export type AdminTracker = {
  id: string;
  title: string;
  owner: string;
  category: string;
  level: string;
  visibility: string;
  status: string;
  moderationStatus: 'active' | 'suspended' | 'deleted';
  moderationReason?: string;
  verificationStatus: string | null;
  topicsCount: number;
  cloneCount: number;
  createdAt: Date;
  reportCount: number;
  openReportCount: number;
};
export type AdminTrackerStatusResult = { id: string; status: string };
export type AdminTrackerSubtopic = {
  id: string;
  title: string;
  description: string;
  order: number;
  depth: number;
  parentSubtopicId: string | null;
};
export type AdminTrackerTopic = {
  id: string;
  title: string;
  description: string;
  order: number;
  status: string;
  subtopics: AdminTrackerSubtopic[];
};
export type AdminTrackerDetail = AdminTracker & {
  description: string;
  ownerId: string;
  ownerEmail?: string;
  topics: AdminTrackerTopic[];
  moderationHistory: Array<{
    id: string;
    action: string;
    actor: string;
    reason?: string;
    createdAt: Date;
  }>;
};
export type AdminTrackerReport = {
  id: string;
  trackerId: string;
  trackerTitle: string;
  trackerOwner: string;
  reporterId: string;
  reporter: string;
  reporterEmail?: string;
  reason: string;
  details: string;
  status: 'open' | 'reviewing' | 'resolved' | 'dismissed';
  resolutionAction: string;
  resolutionNote: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
};
export type AdminTrackerLifecycleInput = {
  action: 'suspend' | 'delete' | 'restore';
  reasonCode: string;
  reason: string;
  notifyOwner: boolean;
};
export type AdminTrackerLifecycleResult = {
  id: string;
  title: string;
  owner: string;
  ownerEmail?: string;
  moderationStatus: 'active' | 'suspended' | 'deleted';
  reason: string;
  updatedAt: Date;
};
export type AdminTrackerReportUpdateInput = {
  status: 'reviewing' | 'resolved' | 'dismissed';
  resolutionNote: string;
};
export type AdminPublishedTracker = {
  id: string;
  title: string;
  owner: string;
  category: string;
  level: string;
  topicsCount: number;
  cloneCount: number;
  likeCount: number;
  ratingAverage: number;
  ratingCount: number;
  publishedAt: Date;
  adminLiked: boolean;
  adminRating: number | null;
};
export type AdminPublishedTrackerEngagementResult = {
  id: string;
  likeCount: number;
  ratingAverage: number;
  ratingCount: number;
  adminLiked: boolean;
  adminRating: number | null;
};
