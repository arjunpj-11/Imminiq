import type { AdminActor } from './admin.types';

export type AdminContentAppealTargetType = 'tracker' | 'mock_test';
export type AdminContentAppealStatus = 'under_review' | 'approved' | 'rejected';
export type AdminContentAppealListQuery = { status: string; page: number; limit: number };
export type AdminContentAppealUpdateInput = {
  status: AdminContentAppealStatus;
  decisionNote: string;
};
export type AdminContentAppealItem = {
  id: string;
  targetId: string;
  targetType: AdminContentAppealTargetType;
  title: string;
  moderationStatus: string;
  ownerId: string;
  ownerName: string;
  ownerEmail?: string;
  reason: string;
  evidenceUrls: string[];
  status: string;
  assignedTo?: string;
  decisionNote?: string | null;
  createdAt: Date;
  updatedAt: Date;
};
export type AdminContentAppealListResult = {
  items: AdminContentAppealItem[];
  stats: { pending: number; underReview: number; approved: number; rejected: number };
  pagination: { page: number; limit: number; total: number; pages: number };
};
export type AdminContentAppealUpdateResult = {
  id: string;
  status: string;
  targetId: string;
  updatedAt: Date;
};

export interface IAdminContentAppealService {
  list(
    targetType: AdminContentAppealTargetType,
    query: AdminContentAppealListQuery
  ): Promise<AdminContentAppealListResult>;
  update(
    targetType: AdminContentAppealTargetType,
    id: string,
    input: AdminContentAppealUpdateInput,
    actor: AdminActor
  ): Promise<AdminContentAppealUpdateResult>;
}
