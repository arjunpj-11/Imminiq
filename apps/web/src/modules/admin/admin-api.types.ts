export type ApiEnvelope<T> = { data: T };
export type AdminPagination = { page: number; limit: number; total: number; pages: number };
export type AdminPageData<T> = {
  items: T[];
  pagination: AdminPagination;
  stats?: Record<string, number>;
};
export type AdminListQuery = {
  search?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
};
