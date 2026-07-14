import type { AdminListQuery, AdminPage } from '../../../shared/domain';
import type { IAdminAuditLogsRepository } from '../../domain/repositories/admin-audit-logs.repository.interface';
import type { AdminAuditLogDTO } from '../admin-audit-logs.dto';
import type { IAdminAuditLogsMapper } from '../admin-audit-logs.mapper';
export interface IListAdminAuditLogsUseCase {
  execute(query: AdminListQuery): Promise<AdminPage<AdminAuditLogDTO>>;
}
export class ListAdminAuditLogsUseCase implements IListAdminAuditLogsUseCase {
  constructor(
    private readonly repository: IAdminAuditLogsRepository,
    private readonly mapper: IAdminAuditLogsMapper
  ) {}
  async execute(query: AdminListQuery): Promise<AdminPage<AdminAuditLogDTO>> {
    return this.mapper.toPageDTO(await this.repository.list(query));
  }
}
