import type { AdminAuditLogsUseCases } from './application/admin-audit-logs-use-cases.contract';
import { ListAdminAuditLogsUseCase } from './application/use-cases/list-admin-audit-logs.usecase';
import { mongoAdminAuditLogsRepository } from './infrastructure/repositories/mongo-admin-audit-logs.repository';
export type AdminAuditLogsComposition = { useCases: AdminAuditLogsUseCases };

export const createAdminAuditLogsComposition = (): AdminAuditLogsComposition => ({
  useCases: { list: new ListAdminAuditLogsUseCase(mongoAdminAuditLogsRepository) },
});
