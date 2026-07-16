import type { AdminActor } from '../../shared/domain';
export interface IAdminTrackerVersionService {
  list(trackerId: string): Promise<object[]>;
  restore(trackerId: string, version: number, reason: string, actor: AdminActor): Promise<object>;
}
