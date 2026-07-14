export type AdminAuditLog = {
  id: string;
  action: string;
  module: string;
  outcome: string;
  actor: string;
  actorId: string | null;
  target: string | null;
  targetId: string | null;
  ipAddress: string;
  createdAt: Date;
  metadata: Record<string, unknown>;
};
