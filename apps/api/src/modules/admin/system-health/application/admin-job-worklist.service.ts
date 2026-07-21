import type { AdminActor } from '../../../../shared/admin';

export type AdminJobWorklistQuery = {
  queue?: string;
  status?: string;
  page: number;
  limit: number;
};

export type AdminJobWorklistPage = {
  items: Array<Record<string, unknown>>;
  pagination: { page: number; limit: number; total: number; pages: number };
};

export type AdminJobActionInput = {
  queueName: string;
  jobId: string;
  action: 'cancel' | 'retry' | 'remove';
  actor: AdminActor;
};

export type AdminJobActionResult = {
  queue: string;
  jobId: string;
  action: string;
  state: string;
};

export interface IAdminJobWorklistService {
  list(query: AdminJobWorklistQuery): Promise<AdminJobWorklistPage>;
  act(input: AdminJobActionInput): Promise<AdminJobActionResult>;
}
