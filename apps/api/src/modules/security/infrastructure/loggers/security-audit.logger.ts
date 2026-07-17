import { securityAuditLogger as sharedAccountSecurityAuditLogger } from '../../../../infrastructure/security/security-audit-logger';
import { SecurityDomainError } from '../../domain/security-domain.error';
import type { IAccountSecurityAuditLogger } from '../../domain/services/security-audit-logger.interface';

export class AccountSecurityAuditLogger implements IAccountSecurityAuditLogger {
  async record(data: Parameters<IAccountSecurityAuditLogger['record']>[0]): Promise<void> {
    try {
      await sharedAccountSecurityAuditLogger.record({
        userId: data.userId,
        eventType: data.eventType,
        outcome: data.outcome,
        ...(data.metadata ? { metadata: data.metadata } : {}),
      });
    } catch {
      throw new SecurityDomainError(
        'SECURITY_AUDIT_LOG_FAILED',
        'Security audit event could not be recorded'
      );
    }
  }
}

export const accountSecurityAuditLogger = new AccountSecurityAuditLogger();
