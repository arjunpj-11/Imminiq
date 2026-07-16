import { ActivityLog } from '../../../../infrastructure/database/models/activity-log.model';
import type { AdminActor } from '../domain/admin-shared.types';
import type { ClientSession } from 'mongoose';

export const recordAdminAction = (
  actor: AdminActor,
  action: string,
  module: string,
  metadata: Record<string, unknown>,
  session?: ClientSession
) => {
  const document = {
    userId: actor.userId,
    action,
    module,
    severity: 'info',
    metadata,
    ipAddress: actor.ipAddress,
    userAgent: actor.userAgent,
  };
  return session
    ? ActivityLog.create([document], { session }).then(([created]) => created)
    : ActivityLog.create(document);
};
