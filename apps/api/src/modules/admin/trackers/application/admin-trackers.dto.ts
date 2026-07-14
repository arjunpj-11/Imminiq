export interface AdminTrackerDTO {
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
}

export interface AdminTrackerSubtopicDTO {
  id: string;
  title: string;
  description: string;
  order: number;
  depth: number;
  parentSubtopicId: string | null;
  estimatedMinutes: number;
}

export interface AdminTrackerTopicDTO {
  id: string;
  title: string;
  description: string;
  order: number;
  status: string;
  estimatedHours: number;
  subtopics: AdminTrackerSubtopicDTO[];
}

export interface AdminTrackerDetailDTO extends AdminTrackerDTO {
  description: string;
  ownerId: string;
  ownerEmail?: string;
  topics: AdminTrackerTopicDTO[];
}

export interface AdminTrackerDeleteResultDTO {
  id: string;
  title: string;
  owner: string;
  ownerEmail?: string;
  deletedAt: Date;
}

export interface AdminPublishedTrackerDTO {
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
}

export interface AdminPublishedTrackerEngagementResultDTO {
  id: string;
  likeCount: number;
  ratingAverage: number;
  ratingCount: number;
  adminLiked: boolean;
  adminRating: number | null;
}
