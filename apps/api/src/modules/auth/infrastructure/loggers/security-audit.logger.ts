import { securityAuditLogger as sharedAuthSecurityAuditLogger } from '../../../../infrastructure/security/security-audit-logger';
import type { IAuthSecurityAuditLogger } from '../../domain/services/security-audit-logger.interface';

type AuthSecurityAuditLoggerInput = Parameters<typeof sharedAuthSecurityAuditLogger.record>[0];

export class AuthSecurityAuditLogger implements IAuthSecurityAuditLogger {
  async record(data: {
    userId?: string;
    eventType: AuthSecurityAuditLoggerInput['eventType'];
    outcome: AuthSecurityAuditLoggerInput['outcome'];
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    const payload: AuthSecurityAuditLoggerInput = {
      eventType: data.eventType,
      outcome: data.outcome,
      ...(data.userId ? { userId: data.userId } : {}),
      ...(data.ipAddress ? { ipAddress: data.ipAddress } : {}),
      ...(data.userAgent ? { userAgent: data.userAgent } : {}),
      ...(data.metadata ? { metadata: data.metadata } : {}),
    };

    await sharedAuthSecurityAuditLogger.record(payload);
  }
}

export const authSecurityAuditLogger = new AuthSecurityAuditLogger();
