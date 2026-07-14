import type { AdminPage } from '../../shared';
import type { AdminAuditLog } from '../domain/entities/admin-audit-log.entity';
import type { IAdminAuditLogDTO } from './admin-audit-logs.dto';

export interface IAdminAuditLogsMapper {
  toDTO(entity: AdminAuditLog): IAdminAuditLogDTO;
  toPageDTO(page: AdminPage<AdminAuditLog>): AdminPage<IAdminAuditLogDTO>;
}

export class AdminAuditLogsMapper implements IAdminAuditLogsMapper {
  toDTO(entity: AdminAuditLog): IAdminAuditLogDTO {
    return { ...entity, metadata: { ...entity.metadata } };
  }

  toPageDTO(page: AdminPage<AdminAuditLog>): AdminPage<IAdminAuditLogDTO> {
    return {
      ...page,
      items: page.items.map((item) => this.toDTO(item)),
      pagination: { ...page.pagination },
      ...(page.stats ? { stats: { ...page.stats } } : {}),
    };
  }
}
