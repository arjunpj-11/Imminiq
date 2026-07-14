export interface IAdminTrackerDTO {
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

export interface IAdminTrackerSubtopicDTO {
  id: string;
  title: string;
  description: string;
  order: number;
  depth: number;
  parentSubtopicId: string | null;
  estimatedMinutes: number;
}

export interface IAdminTrackerTopicDTO {
  id: string;
  title: string;
  description: string;
  order: number;
  status: string;
  estimatedHours: number;
  subtopics: IAdminTrackerSubtopicDTO[];
}

export interface IAdminTrackerDetailDTO extends IAdminTrackerDTO {
  description: string;
  ownerId: string;
  ownerEmail?: string;
  topics: IAdminTrackerTopicDTO[];
}

export interface IAdminTrackerDeleteResultDTO {
  id: string;
  title: string;
  owner: string;
  ownerEmail?: string;
  deletedAt: Date;
}

export interface IAdminPublishedTrackerDTO {
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

export interface IAdminPublishedTrackerEngagementResultDTO {
  id: string;
  likeCount: number;
  ratingAverage: number;
  ratingCount: number;
  adminLiked: boolean;
  adminRating: number | null;
}
