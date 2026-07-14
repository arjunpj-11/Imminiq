export type AdminTracker = {
  id: string;
  title: string;
  owner: string;
  category: string;
  level: string;
  visibility: string;
  status: string;
  verificationStatus: string | null;
  topicsCount: number;
  cloneCount: number;
  createdAt: Date;
};
export type AdminTrackerStatusResult = { id: string; status: string };
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
};
export type AdminTrackerDeleteResult = {
  id: string;
  title: string;
  ownerEmail?: string;
  deletedAt: Date;
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
