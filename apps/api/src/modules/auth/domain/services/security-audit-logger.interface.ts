export interface IAuthSecurityAuditLogger {
  record(data: {
    userId?: string;
    eventType: string;
    outcome: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
  }): Promise<void>;
}
