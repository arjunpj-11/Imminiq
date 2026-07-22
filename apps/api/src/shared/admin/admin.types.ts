export type AdminListQuery = {
  search?: string;
  status?: string;
  from?: string;
  to?: string;
  page: number;
  limit: number;
};

export type AdminActor = {
  userId: string;
  role: 'moderator' | 'admin' | 'superadmin';
  ipAddress: string;
  userAgent: string;
};

export type AdminPage<T> = {
  items: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
  stats?: Record<string, number>;
};

export type AdminBulkActionResult =
  | {
      requested: number;
      eligible: string[];
      blocked: Array<{ id: string; reason: string }>;
    }
  | {
      succeeded: number;
      failed: number;
      results: Array<{ id: string; success: boolean; error?: string }>;
    };
