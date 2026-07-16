import type { AdminActor } from '../../shared/domain';
export interface IAdminDataPrivacyRequestService {
  list(query: { search: string; status: string; type: string; page: number; limit: number }): Promise<object>;
  update(id: string, input: { status: 'in_progress' | 'completed' | 'rejected'; resolutionNote: string; downloadUrl?: string }, actor: AdminActor): Promise<object>;
}
