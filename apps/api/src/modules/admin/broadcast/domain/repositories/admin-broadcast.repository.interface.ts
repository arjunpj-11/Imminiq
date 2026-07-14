import type { AdminActor, AdminListQuery, AdminPage } from '../../../shared';
import type {
  AdminBroadcast,
  AdminBroadcastInput,
  AdminBroadcastResult,
} from '../entities/admin-broadcast.entity';
export interface IAdminBroadcastRepository {
  list(query: AdminListQuery): Promise<AdminPage<AdminBroadcast>>;
  send(input: AdminBroadcastInput, actor: AdminActor): Promise<AdminBroadcastResult | null>;
}
