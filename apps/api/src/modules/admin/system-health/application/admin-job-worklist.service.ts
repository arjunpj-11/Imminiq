import type { AdminActor } from '../../../../shared/admin';

export type AdminJobWorklistQuery = {
  queue?: string;
  status?: string;
  page: number;
  limit: number;
};

export interface IAdminJobWorklistService {
  list(query: AdminJobWorklistQuery): Promise<{
    items: Array<Record<string, unknown>>;
    pagination: { page: number; limit: number; total: number; pages: number };
  }>;
  act(
    queueName: string,
    jobId: string,
    action: 'cancel' | 'retry' | 'remove',
    actor: AdminActor
  ): Promise<{ queue: string; jobId: string; action: string; state: string }>;
}
