import type { AdminActor, AdminListQuery, AdminPage } from '../../../shared';
import type {
  AdminBroadcast,
  AdminBroadcastInput,
  AdminBroadcastResult,
} from '../../domain/admin-broadcast.entity';
import type { IAdminBroadcastRepository } from '../../domain/repositories/admin-broadcast.repository.interface';
export interface IAdminBroadcastsUseCase {
  list(query: AdminListQuery): Promise<AdminPage<AdminBroadcast>>;
  send(input: AdminBroadcastInput, actor: AdminActor): Promise<AdminBroadcastResult>;
}
export class AdminBroadcastsUseCase implements IAdminBroadcastsUseCase {
  constructor(private readonly repository: IAdminBroadcastRepository) {}
  list(query: AdminListQuery) {
    return this.repository.list(query);
  }
  send(input: AdminBroadcastInput, actor: AdminActor) {
    return this.repository.send(input, actor);
  }
}
