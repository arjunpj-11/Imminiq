import type { AdminListQuery, AdminPage } from '../../../../../shared/admin';
import type { AdminAuditLog } from '../entities/admin-audit-log.entity';
export interface IAdminAuditLogsRepository {
  list(query: AdminListQuery): Promise<AdminPage<AdminAuditLog>>;
}
