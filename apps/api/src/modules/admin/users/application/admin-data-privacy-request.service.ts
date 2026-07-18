import type { AdminActor } from '../../../../shared/admin';

export type AdminPrivacyRequestListQuery = {
  search: string;
  status: string;
  type: string;
  page: number;
  limit: number;
};
export type AdminPrivacyRequestUpdateInput = {
  status: 'in_progress' | 'completed' | 'rejected';
  resolutionNote: string;
  downloadUrl?: string;
};
export type AdminPrivacyRequestDTO = {
  id: string;
  userId: string;
  userName: string;
  identifier: string;
  type: string;
  details: string;
  status: string;
  assignedTo?: string;
  resolutionNote?: string | null;
  downloadUrl?: string | null;
  dueAt: Date;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
export type AdminPrivacyRequestListResult = {
  items: AdminPrivacyRequestDTO[];
  stats: { pending: number; inProgress: number; completed: number; overdue: number };
  pagination: { page: number; limit: number; total: number; pages: number };
};
export type AdminPrivacyRequestUpdateResult = {
  id: string;
  status: string;
  updatedAt: Date;
};

export interface IAdminDataPrivacyRequestService {
  list(query: AdminPrivacyRequestListQuery): Promise<AdminPrivacyRequestListResult>;
  update(
    id: string,
    input: AdminPrivacyRequestUpdateInput,
    actor: AdminActor
  ): Promise<AdminPrivacyRequestUpdateResult>;
}
