export interface AdminTrackerDTO {
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
}

export interface AdminTrackerSubtopicDTO {
  id: string;
  title: string;
  description: string;
  order: number;
  depth: number;
  parentSubtopicId: string | null;
}

export interface AdminTrackerTopicDTO {
  id: string;
  title: string;
  description: string;
  order: number;
  status: string;
  subtopics: AdminTrackerSubtopicDTO[];
}

export interface AdminTrackerDetailDTO extends AdminTrackerDTO {
  description: string;
  ownerId: string;
  ownerEmail?: string;
  topics: AdminTrackerTopicDTO[];
  moderationHistory: Array<{
    id: string;
    action: string;
    actor: string;
    reason?: string;
    createdAt: Date;
  }>;
}

export type AdminTrackerReportDTO = AdminTrackerReport;
export type AdminTrackerLifecycleResultDTO = Omit<
  AdminTrackerLifecycleResult,
  'owner' | 'ownerEmail'
> & { notificationQueued: boolean };

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
import type {
  AdminTrackerLifecycleResult,
  AdminTrackerReport,
} from '../domain/entities/admin-tracker.entity';
