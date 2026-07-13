import { ListAdminAuditLogsUseCase } from './application/use-cases/list-admin-audit-logs.usecase'
import { mongoAdminAuditLogsRepository } from './infrastructure/repositories/mongo-admin-audit-logs.repository'
export const createAdminAuditLogsComposition = () => ({ useCase: new ListAdminAuditLogsUseCase(mongoAdminAuditLogsRepository) })
