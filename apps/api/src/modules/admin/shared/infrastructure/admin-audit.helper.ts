import { ActivityLog } from '../../../../infrastructure/database/models/activity-log.model'
import type { AdminActor } from '../domain/admin-shared.types'

export const recordAdminAction = (
  actor: AdminActor,
  action: string,
  module: string,
  metadata: Record<string, unknown>,
) => ActivityLog.create({
  userId: actor.userId,
  action,
  module,
  severity: 'info',
  metadata,
  ipAddress: actor.ipAddress,
  userAgent: actor.userAgent,
})
