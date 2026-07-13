import type { AdminListQuery, AdminPage } from '../../../shared';
import type { AdminAuditLog } from '../../domain/admin-audit-log.entity';
import type { IAdminAuditLogsRepository } from '../../domain/repositories/admin-audit-logs.repository.interface';
export interface IListAdminAuditLogsUseCase {
  execute(query: AdminListQuery): Promise<AdminPage<AdminAuditLog>>;
}
export class ListAdminAuditLogsUseCase implements IListAdminAuditLogsUseCase {
  constructor(private readonly repository: IAdminAuditLogsRepository) {}
  execute(query: AdminListQuery) {
    return this.repository.list(query);
  }
}
