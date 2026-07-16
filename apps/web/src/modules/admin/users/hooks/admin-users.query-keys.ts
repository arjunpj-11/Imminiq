export type AdminUsersQuery = {
  search?: string;
  status?: 'all' | 'active' | 'paused' | 'blocked' | 'deactivated' | 'banned' | 'unverified';
  page?: number;
};

export const adminUsersKeys = {
  all: ['admin', 'users'] as const,
  lists: () => [...adminUsersKeys.all, 'list'] as const,
  list: (query: AdminUsersQuery) => [...adminUsersKeys.lists(), query] as const,
  details: () => [...adminUsersKeys.all, 'detail'] as const,
  detail: (userId: string) => [...adminUsersKeys.details(), userId] as const,
  appeals: () => [...adminUsersKeys.all, 'appeals'] as const,
  appealList: (query: AdminUserAppealsQuery) => [...adminUsersKeys.appeals(), query] as const,
  privacyRequests: () => [...adminUsersKeys.all, 'privacy-requests'] as const,
  privacyRequestList: (query: AdminPrivacyRequestsQuery) => [...adminUsersKeys.privacyRequests(), query] as const,
};

export type AdminPrivacyRequestsQuery = {
  search?: string;
  status?: 'all' | 'pending' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';
  type?: 'all' | 'access' | 'export' | 'delete' | 'correction';
  page?: number;
};

export type AdminUserAppealsQuery = {
  search?: string;
  status?: 'all' | 'pending' | 'under_review' | 'approved' | 'rejected';
  page?: number;
};
