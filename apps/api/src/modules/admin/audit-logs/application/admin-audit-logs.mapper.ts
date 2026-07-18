import type { AdminPage } from '../../../../shared/admin';
import type { AdminAuditLog } from '../domain/entities/admin-audit-log.entity';
import type { AdminAuditLogDTO } from './admin-audit-logs.dto';

export interface IAdminAuditLogsMapper {
  toDTO(entity: AdminAuditLog): AdminAuditLogDTO;
  toPageDTO(page: AdminPage<AdminAuditLog>): AdminPage<AdminAuditLogDTO>;
}

export class AdminAuditLogsMapper implements IAdminAuditLogsMapper {
  toDTO(entity: AdminAuditLog): AdminAuditLogDTO {
    return { ...entity, metadata: { ...entity.metadata } };
  }

  toPageDTO(page: AdminPage<AdminAuditLog>): AdminPage<AdminAuditLogDTO> {
    return {
      ...page,
      items: page.items.map((item) => this.toDTO(item)),
      pagination: { ...page.pagination },
      ...(page.stats ? { stats: { ...page.stats } } : {}),
    };
  }
}
