import type {
  SecurityAuditEventType,
  SecurityAuditOutcome,
} from '../security.types'

export interface ISecurityAuditLogger {
  record(data: {
    userId: string
    eventType: SecurityAuditEventType
    outcome: SecurityAuditOutcome
    metadata?: Record<string, unknown>
  }): Promise<void>
}
