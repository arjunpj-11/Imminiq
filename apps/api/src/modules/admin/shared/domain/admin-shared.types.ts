export type AdminListQuery = {
  search?: string;
  status?: string;
  page: number;
  limit: number;
};

export type AdminActor = {
  userId: string;
  role: 'admin' | 'superadmin';
  ipAddress: string;
  userAgent: string;
};

export type AdminPage<T> = {
  items: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
  stats?: Record<string, number>;
};
