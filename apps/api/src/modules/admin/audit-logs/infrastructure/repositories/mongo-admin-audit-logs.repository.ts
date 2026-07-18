import { ActivityLog } from '../../../../../infrastructure/database/models/activity-log.model';
import { SecurityAuditEvent } from '../../../../../infrastructure/database/models/security-audit-event.model';
import { User } from '../../../../../infrastructure/database/models/user.model';
import type { AdminListQuery } from '../../../../../shared/admin';
import { createAdminPage } from '../../../../../infrastructure/admin';
import type { IAdminAuditLogsRepository } from '../../domain/repositories/admin-audit-logs.repository.interface';

const SENSITIVE_METADATA_KEY =
  /(authorization|cookie|token|secret|password|passcode|otp|mfa|api[-_]?key|session|credential)/i;
const redactMetadata = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(redactMetadata);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, nested]) => [
      key,
      SENSITIVE_METADATA_KEY.test(key) ? '[REDACTED]' : redactMetadata(nested),
    ])
  );
};
export class MongoAdminAuditLogsRepository implements IAdminAuditLogsRepository {
  async list(query: AdminListQuery) {
    const text = query.search?.toLowerCase();
    const escapedText = text?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const textPattern = escapedText ? new RegExp(escapedText, 'i') : null;
    const createdAt = {
      ...(query.from ? { $gte: new Date(`${query.from}T00:00:00.000Z`) } : {}),
      ...(query.to ? { $lte: new Date(`${query.to}T23:59:59.999Z`) } : {}),
    };
    const matchingUsers = textPattern
      ? await User.find({
          $or: [{ fullName: textPattern }, { username: textPattern }],
          deletedAt: null,
        })
          .select('_id')
          .limit(1_000)
          .lean()
      : [];
    const matchingUserIds = matchingUsers.map((user) => user._id);
    const activityFilter: Record<string, unknown> = {
      deletedAt: null,
      ...(Object.keys(createdAt).length ? { createdAt } : {}),
      ...(textPattern
        ? {
            $or: [
              { action: textPattern },
              { module: textPattern },
              { ipAddress: textPattern },
              { 'metadata.targetTitle': textPattern },
              ...(matchingUserIds.length ? [{ userId: { $in: matchingUserIds } }] : []),
            ],
          }
        : {}),
    };
    const securityFilter: Record<string, unknown> = {
      ...(Object.keys(createdAt).length ? { createdAt } : {}),
      ...(textPattern
        ? {
            $or: [
              { eventType: textPattern },
              { outcome: textPattern },
              { ipAddress: textPattern },
              ...(matchingUserIds.length
                ? [
                    { userId: { $in: matchingUserIds } },
                    { 'metadata.actorId': { $in: matchingUserIds.map(String) } },
                  ]
                : []),
            ],
          }
        : {}),
    };
    const fetchLimit = query.page * query.limit;
    const [activity, security, activityCount, securityCount] = await Promise.all([
      ActivityLog.find(activityFilter).sort({ createdAt: -1 }).limit(fetchLimit).lean(),
      SecurityAuditEvent.find(securityFilter).sort({ createdAt: -1 }).limit(fetchLimit).lean(),
      ActivityLog.countDocuments(activityFilter),
      SecurityAuditEvent.countDocuments(securityFilter),
    ]);
    const ids = new Set<string>();
    activity.forEach((row) => ids.add(String(row.userId)));
    security.forEach((row) => {
      if (row.userId) ids.add(String(row.userId));
      const metadata = row.metadata as Record<string, unknown>;
      if (metadata?.actorId) ids.add(String(metadata.actorId));
    });
    const users = await User.find({ _id: { $in: [...ids] } })
      .select('fullName username')
      .lean();
    const names = new Map(users.map((user) => [String(user._id), user.fullName || user.username]));
    const normalized = [
      ...activity.map((row) => {
        const metadata = (row.metadata ?? {}) as Record<string, unknown>;
        const actorId = String(row.userId);
        const targetId = metadata.targetId
          ? String(metadata.targetId)
          : metadata.ownerId
            ? String(metadata.ownerId)
            : null;
        return {
          id: String(row._id),
          action: row.action,
          module: row.module,
          outcome: row.severity,
          actor: names.get(actorId) ?? 'System',
          actorId,
          target: metadata.targetTitle
            ? String(metadata.targetTitle)
            : targetId
              ? (names.get(targetId) ?? null)
              : null,
          targetId,
          ipAddress: row.ipAddress,
          createdAt: row.createdAt,
          metadata: redactMetadata(metadata) as Record<string, unknown>,
        };
      }),
      ...security.map((row) => {
        const metadata = (row.metadata ?? {}) as Record<string, unknown>;
        const actorId = metadata.actorId ? String(metadata.actorId) : null;
        const targetId = row.userId ? String(row.userId) : null;
        return {
          id: String(row._id),
          action: row.eventType,
          module: 'security',
          outcome: row.outcome,
          actor: actorId ? (names.get(actorId) ?? 'Administrator') : 'System',
          actorId,
          target: targetId ? (names.get(targetId) ?? 'User') : null,
          targetId,
          ipAddress: row.ipAddress,
          createdAt: row.createdAt,
          metadata: redactMetadata(metadata) as Record<string, unknown>,
        };
      }),
    ]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const start = (query.page - 1) * query.limit;
    return createAdminPage(
      normalized.slice(start, start + query.limit),
      query,
      activityCount + securityCount,
      { activity: activityCount, security: securityCount }
    );
  }
}
export const mongoAdminAuditLogsRepository = new MongoAdminAuditLogsRepository();
