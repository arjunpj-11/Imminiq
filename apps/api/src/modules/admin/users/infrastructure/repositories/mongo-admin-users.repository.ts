import { User } from '../../../../../infrastructure/database/models/user.model';
import { Tracker } from '../../../../../infrastructure/database/models/tracker.model';
import { ActivityLog } from '../../../../../infrastructure/database/models/activity-log.model';
import { SecurityAuditEvent } from '../../../../../infrastructure/database/models/security-audit-event.model';
import { MockTestReportModel } from '../../../../../infrastructure/database/models/mock-test-report.model';
import { AuthToken } from '../../../../../infrastructure/database/models/auth-token.model';
import { Notification } from '../../../../../infrastructure/database/models/notification.model';
import { ModerationAppeal } from '../../../../../infrastructure/database/models/moderation-appeal.model';
import type {
  AdminUserDetailEntity,
  AdminUserEntity,
} from '../../domain/entities/admin-user.entity';
import type {
  AdminUsersListResult,
  IAdminUsersRepository,
  ListAdminUsersInput,
  ListAdminUserAppealsInput,
  RecordAdminStatusChangeInput,
  RecordAdminMessageInput,
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
  adminStatusReason?: string | null;
  adminStatusReasonCode?: string | null;
  adminStatusChangedAt?: Date | null;
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
  adminActionPasswordSetAt?: Date | null;
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
  ...(user.adminStatusReason ? { adminStatusReason: user.adminStatusReason } : {}),
  ...(user.adminStatusReasonCode ? { adminStatusReasonCode: user.adminStatusReasonCode } : {}),
  ...(user.adminStatusChangedAt ? { adminStatusChangedAt: user.adminStatusChangedAt } : {}),
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
  adminActionPasswordConfigured: Boolean(user.adminActionPasswordSetAt),
  ...(user.adminActionPasswordSetAt
    ? { adminActionPasswordSetAt: user.adminActionPasswordSetAt }
    : {}),
});

export class MongoAdminUsersRepository implements IAdminUsersRepository {
  async list(input: ListAdminUsersInput): Promise<AdminUsersListResult> {
    const conditions: Record<string, unknown>[] = [{ deletedAt: null }];
    if (input.search) {
      const escaped = input.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      conditions.push({
        $or: ['fullName', 'username', 'email', 'phone'].map((field) => ({
          [field]: { $regex: escaped, $options: 'i' },
        })),
      });
    }
    if (input.status === 'active') conditions.push({ status: 'active' });
    if (input.status === 'paused') conditions.push({ status: 'paused' });
    if (input.status === 'blocked') conditions.push({ status: 'blocked' });
    if (input.status === 'deactivated') conditions.push({ status: 'deactivated' });
    if (input.status === 'banned') conditions.push({ status: 'banned' });
    const filter = { $and: conditions };
    const [records, total, allTotal, active, paused, blocked] = await Promise.all([
      User.find(filter)
        .select(
          'fullName username email phone avatarUrl role status adminStatusReason adminStatusReasonCode adminStatusChangedAt emailVerified phoneVerified isPremium coins xp level streakCount lastActiveAt createdAt provider adminActionPasswordSetAt'
        )
        .sort({ createdAt: -1 })
        .skip((input.page - 1) * input.limit)
        .limit(input.limit)
        .lean(),
      User.countDocuments(filter),
      User.countDocuments({ deletedAt: null }),
      User.countDocuments({ deletedAt: null, status: 'active' }),
      User.countDocuments({ deletedAt: null, status: 'paused' }),
      User.countDocuments({ deletedAt: null, status: 'blocked' }),
    ]);
    return {
      users: records.map((record) => toEntity(record)),
      stats: { total: allTotal, active, paused, blocked },
      pagination: {
        page: input.page,
        limit: input.limit,
        total,
        pages: Math.max(1, Math.ceil(total / input.limit)),
      },
    };
  }

  async listAppeals(input: ListAdminUserAppealsInput) {
    const filter: Record<string, unknown> = { deletedAt: null };
    if (input.status !== 'all') filter.status = input.status;
    if (input.search) {
      const escaped = input.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = ['caseId', 'identifier', 'appealReason'].map((field) => ({
        [field]: { $regex: escaped, $options: 'i' },
      }));
    }
    const [rows, total, pending, underReview, approved, rejected] = await Promise.all([
      ModerationAppeal.find(filter)
        .sort({ createdAt: 1 })
        .skip((input.page - 1) * input.limit)
        .limit(input.limit)
        .populate('userId', 'fullName username adminStatusReason')
        .populate('reviewedBy', 'fullName username')
        .lean(),
      ModerationAppeal.countDocuments(filter),
      ModerationAppeal.countDocuments({ deletedAt: null, status: 'pending' }),
      ModerationAppeal.countDocuments({ deletedAt: null, status: 'under_review' }),
      ModerationAppeal.countDocuments({ deletedAt: null, status: 'approved' }),
      ModerationAppeal.countDocuments({ deletedAt: null, status: 'rejected' }),
    ]);
    return {
      items: rows.map((row) => {
        const user = row.userId as unknown as {
          _id?: unknown;
          fullName?: string;
          username?: string;
          adminStatusReason?: string;
        };
        const reviewer = row.reviewedBy as unknown as {
          fullName?: string;
          username?: string;
        } | null;
        return {
          id: String(row._id),
          caseId: row.caseId,
          userId: String(user?._id ?? ''),
          userName: user?.fullName ?? user?.username ?? 'Unknown user',
          identifier: row.identifier,
          appealReason: row.appealReason,
          ...(user?.adminStatusReason ? { originalReason: user.adminStatusReason } : {}),
          status: row.status,
          ...(reviewer
            ? { reviewedBy: reviewer.fullName ?? reviewer.username ?? 'Administrator' }
            : {}),
          ...(row.reviewNote ? { reviewNote: row.reviewNote } : {}),
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          ...(row.reviewedAt ? { reviewedAt: row.reviewedAt } : {}),
        };
      }),
      stats: { pending, underReview, approved, rejected },
      pagination: {
        page: input.page,
        limit: input.limit,
        total,
        pages: Math.max(1, Math.ceil(total / input.limit)),
      },
    };
  }

  async updateAppeal(
    appealId: string,
    input: {
      status: 'under_review' | 'approved' | 'rejected';
      reviewNote: string;
      actorId: string;
      ipAddress: string;
      userAgent: string;
    }
  ) {
    const now = new Date();
    const appealFilter: Record<string, unknown> =
      input.status === 'under_review'
        ? { _id: appealId, deletedAt: null, status: 'pending' }
        : {
            _id: appealId,
            deletedAt: null,
            $or: [{ status: 'pending' }, { status: 'under_review', reviewedBy: input.actorId }],
          };
    const appeal = await ModerationAppeal.findOneAndUpdate(
      appealFilter,
      {
        $set: {
          status: input.status,
          reviewedBy: input.actorId,
          reviewNote: input.reviewNote,
          reviewedAt: input.status === 'under_review' ? null : now,
        },
      },
      { returnDocument: 'after' }
    ).lean();
    if (!appeal) return null;

    if (input.status === 'approved') {
      await User.updateOne(
        { _id: appeal.userId, deletedAt: null },
        {
          $set: {
            status: 'active',
            adminStatusChangedAt: now,
            adminStatusChangedBy: input.actorId,
          },
          $unset: { adminStatusReason: 1, adminStatusReasonCode: 1 },
        }
      );
    }

    const user = await User.findById(appeal.userId)
      .select('fullName username email adminStatusReason')
      .lean();
    await Promise.all([
      Notification.create({
        userId: appeal.userId,
        type: 'moderation_appeal_updated',
        message:
          input.status === 'under_review'
            ? `Your moderation appeal ${appeal.caseId} is now under review.`
            : `Your moderation appeal ${appeal.caseId} was ${input.status}. ${input.reviewNote}`.slice(
                0,
                500
              ),
        deepLink: input.status === 'approved' ? '/dashboard' : '/blocked',
        metadata: { appealId, caseId: appeal.caseId, status: input.status },
      }),
      SecurityAuditEvent.create({
        userId: appeal.userId,
        eventType: `admin_moderation_appeal_${input.status}`,
        outcome: 'success',
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        metadata: {
          actorId: input.actorId,
          appealId,
          caseId: appeal.caseId,
          reviewNote: input.reviewNote,
        },
      }),
    ]);
    return {
      id: String(appeal._id),
      caseId: appeal.caseId,
      userId: String(appeal.userId),
      userName: user?.fullName ?? user?.username ?? 'Unknown user',
      identifier: user?.email ?? appeal.identifier,
      appealReason: appeal.appealReason,
      ...(user?.adminStatusReason ? { originalReason: user.adminStatusReason } : {}),
      status: appeal.status,
      reviewedBy: input.actorId,
      reviewNote: appeal.reviewNote ?? input.reviewNote,
      createdAt: appeal.createdAt,
      updatedAt: appeal.updatedAt,
      ...(appeal.reviewedAt ? { reviewedAt: appeal.reviewedAt } : {}),
    };
  }

  async findById(userId: string): Promise<AdminUserEntity | null> {
    const user = await User.findOne({
      _id: userId,
      deletedAt: null,
    })
      .select(
        'fullName username email phone avatarUrl role status adminStatusReason adminStatusReasonCode adminStatusChangedAt emailVerified phoneVerified isPremium coins xp level streakCount lastActiveAt createdAt provider adminActionPasswordSetAt'
      )
      .lean();
    return user ? toEntity(user) : null;
  }

  async findDetailById(userId: string): Promise<AdminUserDetailEntity | null> {
    const user = await this.findById(userId);
    if (!user) return null;
    const [trackers, reports, activity, securityEvents, failedSecurityEvents, sessions] =
      await Promise.all([
        Tracker.countDocuments({ ownerId: userId, deletedAt: null, status: 'active' }),
        MockTestReportModel.countDocuments({ userId }),
        ActivityLog.find({ userId, deletedAt: null }).sort({ createdAt: -1 }).limit(8).lean(),
        SecurityAuditEvent.find({ userId }).sort({ createdAt: -1 }).limit(8).lean(),
        SecurityAuditEvent.countDocuments({ userId, outcome: 'failure' }),
        AuthToken.find({
          userId,
          revokedAt: null,
          deletedAt: null,
          expiresAt: { $gt: new Date() },
        })
          .select('device ipAddress userAgent createdAt updatedAt expiresAt')
          .sort({ updatedAt: -1 })
          .lean(),
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
      sessions: sessions.map((session) => ({
        id: String(session._id),
        device: session.device ?? 'Unknown device',
        ipAddress: session.ipAddress ?? 'Unknown IP',
        userAgent: session.userAgent ?? 'Unknown client',
        createdAt: session.createdAt,
        lastActiveAt: session.updatedAt,
        expiresAt: session.expiresAt,
      })),
    };
  }

  async updateStatus(
    userId: string,
    status: AdminManagedUserStatus,
    input: { actorId: string; reason: string; reasonCode: string }
  ): Promise<void> {
    const now = new Date();
    await User.updateOne(
      { _id: userId, deletedAt: null },
      status === 'active'
        ? {
            $set: {
              status,
              adminStatusChangedAt: now,
              adminStatusChangedBy: input.actorId,
            },
            $unset: { adminStatusReason: 1, adminStatusReasonCode: 1 },
          }
        : {
            $set: {
              status,
              adminStatusReason: input.reason,
              adminStatusReasonCode: input.reasonCode,
              adminStatusChangedAt: now,
              adminStatusChangedBy: input.actorId,
            },
          }
    );
  }

  async revokeSessions(userId: string): Promise<void> {
    await AuthToken.updateMany(
      { userId, revokedAt: null, deletedAt: null },
      { $set: { revokedAt: new Date() } }
    );
  }

  async revokeSession(
    userId: string,
    sessionId: string,
    input: { actorId: string; ipAddress: string; userAgent: string }
  ): Promise<boolean> {
    const result = await AuthToken.updateOne(
      { _id: sessionId, userId, revokedAt: null, deletedAt: null },
      { $set: { revokedAt: new Date() } }
    );
    if (!result.modifiedCount) return false;
    await SecurityAuditEvent.create({
      userId,
      eventType: 'admin_user_session_revoked',
      outcome: 'success',
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      metadata: { actorId: input.actorId, targetId: userId, sessionId },
    });
    return true;
  }

  async updateRole(
    userId: string,
    role: 'user' | 'moderator' | 'admin',
    input: { actorId: string; reason: string; ipAddress: string; userAgent: string }
  ) {
    const previous = await User.findOneAndUpdate(
      { _id: userId, deletedAt: null, role: { $ne: 'superadmin' } },
      {
        $set: { role },
        $unset: {
          adminActionPasswordHash: 1,
          adminActionPasswordSetAt: 1,
          adminActionPasswordSetBy: 1,
        },
      },
      { returnDocument: 'before' }
    ).lean<UserRecord | null>();
    if (!previous) return null;
    await Promise.all([
      this.revokeSessions(userId),
      SecurityAuditEvent.create({
        userId,
        eventType: 'admin_user_role_changed',
        outcome: 'success',
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        metadata: {
          actorId: input.actorId,
          targetId: userId,
          previousRole: previous.role ?? 'user',
          role,
          reason: input.reason,
        },
      }),
      Notification.create({
        userId,
        type: 'account_role_updated',
        message: `Your Imminiq account role changed to ${role}. Reason: ${input.reason}`.slice(
          0,
          500
        ),
        deepLink: '/dashboard',
        metadata: { role },
      }),
    ]);
    return this.findById(userId);
  }

  async setAdminActionPassword(
    userId: string,
    passwordHash: string,
    input: { actorId: string; ipAddress: string; userAgent: string }
  ): Promise<AdminUserEntity | null> {
    const user = await User.findOneAndUpdate(
      {
        _id: userId,
        deletedAt: null,
        role: { $in: ['admin', 'moderator'] },
      },
      {
        $set: {
          adminActionPasswordHash: passwordHash,
          adminActionPasswordSetAt: new Date(),
          adminActionPasswordSetBy: input.actorId,
        },
      },
      { returnDocument: 'after' }
    ).lean<UserRecord | null>();
    if (!user) return null;
    await SecurityAuditEvent.create({
      userId,
      eventType: 'admin_action_password_set',
      outcome: 'success',
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      metadata: { actorId: input.actorId, targetId: userId },
    });
    return toEntity(user);
  }

  async recordStatusChange(input: RecordAdminStatusChangeInput): Promise<void> {
    await Promise.all([
      SecurityAuditEvent.create({
        userId: input.userId,
        eventType:
          input.status === 'blocked'
            ? 'admin_user_blocked'
            : input.status === 'paused'
              ? 'admin_user_suspended'
              : 'admin_user_restored',
        outcome: 'success',
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        metadata: {
          actorId: input.actorId,
          targetId: input.userId,
          targetName: input.targetName,
          targetUsername: input.targetUsername,
          reason: input.reason ?? '',
          reasonCode: input.reasonCode,
          previousStatus: input.previousStatus,
          newStatus: input.status,
          changes: { status: { from: input.previousStatus, to: input.status } },
        },
      }),
      Notification.create({
        userId: input.userId,
        type: 'account_status_updated',
        message:
          input.status === 'blocked'
            ? `Your account was blocked by Imminiq administration. Reason: ${input.reason}`.slice(
                0,
                500
              )
            : input.status === 'paused'
              ? `Your account was suspended by Imminiq administration. Reason: ${input.reason}`.slice(
                  0,
                  500
                )
              : `Your account access was restored. Reason: ${input.reason}`.slice(0, 500),
        deepLink: input.status === 'active' ? '/dashboard' : '/blocked',
        metadata: { status: input.status, reason: input.reason, reasonCode: input.reasonCode },
      }),
    ]);
  }

  async recordAdminMessage(input: RecordAdminMessageInput): Promise<void> {
    await Promise.all([
      Notification.create({
        userId: input.userId,
        type: 'admin_direct_message',
        message: `${input.subject}: ${input.message}`.slice(0, 500),
        deepLink: '/notifications',
        metadata: { subject: input.subject, message: input.message },
      }),
      SecurityAuditEvent.create({
        userId: input.userId,
        eventType: 'admin_user_message_sent',
        outcome: 'success',
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        metadata: {
          actorId: input.actorId,
          targetId: input.userId,
          subject: input.subject,
        },
      }),
    ]);
  }
}

export const mongoAdminUsersRepository = new MongoAdminUsersRepository();
