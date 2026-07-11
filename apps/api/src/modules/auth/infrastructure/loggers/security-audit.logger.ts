import { securityAuditLogger as sharedSecurityAuditLogger } from '../../../../infrastructure/security/security-audit-logger'
import type { ISecurityAuditLogger } from '../../domain/services/security-audit-logger.interface'

type SecurityAuditLoggerInput = Parameters<
  typeof sharedSecurityAuditLogger.record
>[0]

export class SecurityAuditLogger implements ISecurityAuditLogger {
  async record(data: {
    userId?: string
    eventType: SecurityAuditLoggerInput['eventType']
    outcome: SecurityAuditLoggerInput['outcome']
    ipAddress?: string
    userAgent?: string
    metadata?: Record<string, unknown>
  }): Promise<void> {
    const payload: SecurityAuditLoggerInput = {
      eventType: data.eventType,
      outcome: data.outcome,
      ...(data.userId ? { userId: data.userId } : {}),
      ...(data.ipAddress ? { ipAddress: data.ipAddress } : {}),
      ...(data.userAgent ? { userAgent: data.userAgent } : {}),
      ...(data.metadata ? { metadata: data.metadata } : {}),
    }

    await sharedSecurityAuditLogger.record(payload)
  }
}

export const securityAuditLogger = new SecurityAuditLogger()
