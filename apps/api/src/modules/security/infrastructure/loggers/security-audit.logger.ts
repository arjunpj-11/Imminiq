import { securityAuditLogger as sharedSecurityAuditLogger } from '../../../../infrastructure/security/security-audit-logger'
import { SecurityDomainError } from '../../domain/security-domain.error'
import type { ISecurityAuditLogger } from '../../domain/services/security-audit-logger.interface'

export class SecurityAuditLogger implements ISecurityAuditLogger {
  async record(
    data: Parameters<ISecurityAuditLogger['record']>[0],
  ): Promise<void> {
    try {
      await sharedSecurityAuditLogger.record({
        userId: data.userId,
        eventType: data.eventType,
        outcome: data.outcome,
        ...(data.metadata ? { metadata: data.metadata } : {}),
      })
    } catch {
      throw new SecurityDomainError(
        'SECURITY_AUDIT_LOG_FAILED',
        'Security audit event could not be recorded',
      )
    }
  }
}

export const securityAuditLogger = new SecurityAuditLogger()
