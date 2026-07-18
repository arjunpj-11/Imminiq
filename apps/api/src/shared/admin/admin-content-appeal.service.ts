import type { AdminActor } from './admin.types';
export interface IAdminContentAppealService {
  list(targetType: 'tracker' | 'mock_test', query: { status: string; page: number; limit: number }): Promise<object>;
  update(targetType: 'tracker' | 'mock_test', id: string, input: { status: 'under_review' | 'approved' | 'rejected'; decisionNote: string }, actor: AdminActor): Promise<object>;
}
