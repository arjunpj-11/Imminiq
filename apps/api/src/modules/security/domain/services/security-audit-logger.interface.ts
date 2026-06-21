import type {
  SecurityAuditEventType,
  SecurityAuditOutcome,
} from '../value-objects/security-audit.vo'

export interface SecurityAuditLoggerContract {
  record(data: {
    userId: string
    eventType: SecurityAuditEventType
    outcome: SecurityAuditOutcome
    metadata?: Record<string, unknown>
  }): Promise<void>
}
