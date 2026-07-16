import { User } from '../../../../../infrastructure/database/models/user.model';
import { Tracker } from '../../../../../infrastructure/database/models/tracker.model';
import { ActivityLog } from '../../../../../infrastructure/database/models/activity-log.model';
import { SecurityAuditEvent } from '../../../../../infrastructure/database/models/security-audit-event.model';
import { MockTestReportModel } from '../../../../../infrastructure/database/models/mock-test-report.model';
import { AuthToken } from '../../../../../infrastructure/database/models/auth-token.model';
import { Notification } from '../../../../../infrastructure/database/models/notification.model';
import type {
  AdminUserDetailEntity,
  AdminUserEntity,
} from '../../domain/entities/admin-user.entity';
import type {
  AdminUsersListResult,
  IAdminUsersRepository,
  ListAdminUsersInput,
  RecordAdminStatusChangeInput,
} from '../../domain/repositories/admin-users.repository.interface';
import type { AdminManagedUserStatus } from '../../domain/admin-users.types';

type UserRecord = {
  _id: { toString(): string };
  fullName?: string;
  username?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  role?: AdminUserEntity['role'];
  status?: AdminUserEntity['status'];
  emailVerified?: boolean;
  phoneVerified?: boolean;
  isPremium?: boolean;
  coins?: number;
  xp?: number;
  level?: number;
  streakCount?: number;
  lastActiveAt?: Date;
  createdAt?: Date;
  provider?: string;
};

const toEntity = (user: UserRecord): AdminUserEntity => ({
  id: user._id.toString(),
  fullName: user.fullName ?? '',
  username: user.username ?? '',
  ...(user.email ? { email: user.email } : {}),
  ...(user.phone ? { phone: user.phone } : {}),
  ...(user.avatarUrl ? { avatarUrl: user.avatarUrl } : {}),
  role: user.role ?? 'user',
  status: user.status ?? 'active',
  emailVerified: Boolean(user.emailVerified),
  phoneVerified: Boolean(user.phoneVerified),
  isPremium: Boolean(user.isPremium),
  coins: Number(user.coins ?? 0),
  xp: Number(user.xp ?? 0),
  level: Number(user.level ?? 1),
  streakCount: Number(user.streakCount ?? 0),
  lastActiveAt: user.lastActiveAt ?? new Date(0),
  createdAt: user.createdAt ?? new Date(0),
  provider: user.provider ?? 'local',
});

export class MongoAdminUsersRepository implements IAdminUsersRepository {
  async list(input: ListAdminUsersInput): Promise<AdminUsersListResult> {
    const verifiedFilter = { $or: [{ emailVerified: true }, { phoneVerified: true }] };
    const conditions: Record<string, unknown>[] = [{ deletedAt: null }, verifiedFilter];
    if (input.search) {
      const escaped = input.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      conditions.push({
        $or: ['fullName', 'username', 'email'].map((field) => ({
          [field]: { $regex: escaped, $options: 'i' },
        })),
      });
    }
    if (input.status === 'active') conditions.push({ status: 'active' });
    if (input.status === 'blocked') conditions.push({ status: 'blocked' });
    const filter = { $and: conditions };
    const [records, total, allTotal, active, blocked] = await Promise.all([
      User.find(filter)
        .select(
          'fullName username email phone avatarUrl role status emailVerified phoneVerified isPremium coins xp level streakCount lastActiveAt createdAt provider'
        )
        .sort({ createdAt: -1 })
        .skip((input.page - 1) * input.limit)
        .limit(input.limit)
        .lean(),
      User.countDocuments(filter),
      User.countDocuments({ deletedAt: null, ...verifiedFilter }),
      User.countDocuments({ deletedAt: null, status: 'active', ...verifiedFilter }),
      User.countDocuments({ deletedAt: null, status: 'blocked', ...verifiedFilter }),
    ]);
    return {
      users: records.map((record) => toEntity(record)),
      stats: { total: allTotal, active, blocked },
      pagination: {
        page: input.page,
        limit: input.limit,
        total,
        pages: Math.max(1, Math.ceil(total / input.limit)),
      },
    };
  }

  async findById(userId: string): Promise<AdminUserEntity | null> {
    const user = await User.findOne({
      _id: userId,
      deletedAt: null,
      $or: [{ emailVerified: true }, { phoneVerified: true }],
    })
      .select(
        'fullName username email phone avatarUrl role status emailVerified phoneVerified isPremium coins xp level streakCount lastActiveAt createdAt provider'
      )
      .lean();
    return user ? toEntity(user) : null;
  }

  async findDetailById(userId: string): Promise<AdminUserDetailEntity | null> {
    const user = await this.findById(userId);
    if (!user) return null;
    const [trackers, reports, activity, securityEvents, failedSecurityEvents] = await Promise.all([
      Tracker.countDocuments({ ownerId: userId, deletedAt: null, status: 'active' }),
      MockTestReportModel.countDocuments({ userId }),
      ActivityLog.find({ userId, deletedAt: null }).sort({ createdAt: -1 }).limit(8).lean(),
      SecurityAuditEvent.find({ userId }).sort({ createdAt: -1 }).limit(8).lean(),
      SecurityAuditEvent.countDocuments({ userId, outcome: 'failure' }),
    ]);
    return {
      user,
      stats: {
        trackers,
        reports,
        trustScore: Math.max(
          20,
          100 - failedSecurityEvents * 8 - (user.status === 'blocked' ? 35 : 0)
        ),
        failedSecurityEvents,
      },
      activity: activity.map((item) => ({
        id: String(item._id),
        action: item.action,
        module: item.module,
        severity: item.severity,
        createdAt: item.createdAt,
      })),
      securityEvents: securityEvents.map((item) => ({
        id: String(item._id),
        eventType: item.eventType,
        outcome: item.outcome,
        createdAt: item.createdAt,
        ipAddress: item.ipAddress,
      })),
    };
  }

  async updateStatus(userId: string, status: AdminManagedUserStatus): Promise<void> {
    await User.updateOne({ _id: userId, deletedAt: null }, { $set: { status } });
  }

  async revokeSessions(userId: string): Promise<void> {
    await AuthToken.updateMany(
      { userId, revokedAt: null, deletedAt: null },
      { $set: { revokedAt: new Date() } }
    );
  }

  async recordStatusChange(input: RecordAdminStatusChangeInput): Promise<void> {
    await Promise.all([SecurityAuditEvent.create({
      userId: input.userId,
      eventType: input.status === 'blocked' ? 'admin_user_blocked' : 'admin_user_unblocked',
      outcome: 'success',
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      metadata: {
        actorId: input.actorId,
        targetId: input.userId,
        targetName: input.targetName,
        targetUsername: input.targetUsername,
        reason: input.reason ?? '',
        previousStatus: input.previousStatus,
        newStatus: input.status,
        changes: { status: { from: input.previousStatus, to: input.status } },
      },
    }), Notification.create({
      userId: input.userId,
      type: 'account_status_updated',
      message:
        input.status === 'blocked'
          ? `Your account was blocked by Imminiq administration. Reason: ${input.reason ?? 'Administrative review'}`.slice(0, 500)
          : 'Your account access was restored by Imminiq administration.',
      deepLink: input.status === 'blocked' ? '/blocked' : '/dashboard',
      metadata: { status: input.status, reason: input.reason ?? '' },
    })]);
  }
}

export const mongoAdminUsersRepository = new MongoAdminUsersRepository();
