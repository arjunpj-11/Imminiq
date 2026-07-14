import type { AdminListQuery, AdminPage } from '../../../shared';
import type { IAdminAuditLogsRepository } from '../../domain/repositories/admin-audit-logs.repository.interface';
import type { IAdminAuditLogDTO } from '../admin-audit-logs.dto';
import type { IAdminAuditLogsMapper } from '../admin-audit-logs.mapper';
export interface IListAdminAuditLogsUseCase {
  execute(query: AdminListQuery): Promise<AdminPage<IAdminAuditLogDTO>>;
}
export class ListAdminAuditLogsUseCase implements IListAdminAuditLogsUseCase {
  constructor(
    private readonly repository: IAdminAuditLogsRepository,
    private readonly mapper: IAdminAuditLogsMapper
  ) {}
  async execute(query: AdminListQuery): Promise<AdminPage<IAdminAuditLogDTO>> {
    return this.mapper.toPageDTO(await this.repository.list(query));
  }
}
