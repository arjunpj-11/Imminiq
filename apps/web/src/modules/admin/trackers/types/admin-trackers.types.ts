export type AdminTracker = {
  id: string;
  title: string;
  owner: string;
  category: string;
  level: string;
  visibility: string;
  status: "draft" | "active" | "archived";
  moderationStatus: "active" | "suspended" | "deleted";
  moderationReason?: string;
  verificationStatus: string | null;
  topicsCount: number;
  cloneCount: number;
  createdAt: string;
  reportCount: number;
  openReportCount: number;
};
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
export type AdminTrackerSubtopic = {
  id: string;
  title: string;
  description: string;
  order: number;
  depth: number;
  parentSubtopicId: string | null;
  estimatedMinutes: number;
};
export type AdminTrackerTopic = {
  id: string;
  title: string;
  description: string;
  order: number;
  status: string;
  estimatedHours: number;
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
    createdAt: string;
  }>;
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
  publishedAt: string;
  adminLiked: boolean;
  adminRating: number | null;
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
  status: "open" | "reviewing" | "resolved" | "dismissed";
  resolutionAction:
    "none" | "tracker_suspended" | "tracker_deleted" | "tracker_restored";
  resolutionNote: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
};
export type AdminTrackerLifecyclePayload = {
  action: "suspend" | "delete" | "restore";
  reasonCode:
    | "incorrect_content"
    | "unsafe_content"
    | "copyright"
    | "spam_or_abuse"
    | "broken_learning_path"
    | "owner_request"
    | "appeal_accepted"
    | "other";
  reason: string;
  notifyOwner: boolean;
  mfaCode?: string;
};
export type AdminTrackerReportUpdatePayload = {
  status: "reviewing" | "resolved" | "dismissed";
  resolutionNote: string;
  mfaCode?: string;
};
export type AdminTrackerVersion = {
  id: string;
  trackerId: string;
  version: number;
  snapshot: Record<string, unknown>;
  changedBy: string;
  reason: string;
  createdAt: string;
};
