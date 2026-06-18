import { securityAuditLogger as sharedSecurityAuditLogger } from '../../../../infrastructure/security/security-audit-logger'
import { SecurityDomainError } from '../../domain/errors/security-domain.error'
import type { SecurityAuditLoggerContract } from '../../domain/services/security-audit-logger.interface'

export class SecurityAuditLogger implements SecurityAuditLoggerContract {
  async record(
    data: Parameters<SecurityAuditLoggerContract['record']>[0],
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
