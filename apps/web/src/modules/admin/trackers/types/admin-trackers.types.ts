export type AdminTracker = {
  id: string;
  title: string;
  owner: string;
  category: string;
  level: string;
  visibility: string;
  status: 'draft' | 'active' | 'archived';
  verificationStatus: string | null;
  topicsCount: number;
  cloneCount: number;
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
