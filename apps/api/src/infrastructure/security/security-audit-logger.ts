import { Types } from 'mongoose';
import { SecurityAuditEvent } from '../database/models/security-audit-event.model';

export type SecurityAuditOutcome = 'success' | 'failure' | 'blocked' | 'detected';

export type SecurityAuditEventInput = {
  userId?: string | null;
  eventType: string;
  outcome: SecurityAuditOutcome;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
};

const toObjectIdOrNull = (userId?: string | null) => {
  if (!userId || !Types.ObjectId.isValid(userId)) {
    return null;
  }

  return new Types.ObjectId(userId);
};

export const securityAuditLogger = {
  async record(event: SecurityAuditEventInput): Promise<void> {
    try {
      await SecurityAuditEvent.create({
        userId: toObjectIdOrNull(event.userId),
        eventType: event.eventType,
        outcome: event.outcome,
        ipAddress: event.ipAddress ?? '',
        userAgent: event.userAgent ?? '',
        metadata: event.metadata ?? {},
      });
    } catch {
      /**
       * Security logging must not break the user-facing auth/security flow.
       * Operational monitoring should still watch DB/log transport failures.
       */
    }
  },
};
