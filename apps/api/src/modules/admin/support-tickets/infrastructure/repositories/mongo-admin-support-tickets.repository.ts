import { SupportTicket } from '../../../../../infrastructure/database/models/support-ticket.model';
import { Notification } from '../../../../../infrastructure/database/models/notification.model';
import type { AdminActor, AdminListQuery } from '../../../shared/domain';
import { recordAdminAction } from '../../../shared/infrastructure';
import { createAdminPage, escapeAdminSearch } from '../../../shared/infrastructure';
import type { AdminSupportTicketUpdate } from '../../domain/entities/admin-support-ticket.entity';
import type { IAdminSupportTicketsRepository } from '../../domain/repositories/admin-support-tickets.repository.interface';
const SLA_HOURS: Record<string, { firstResponse: number; resolution: number }> = {
  urgent: { firstResponse: 1, resolution: 8 },
  high: { firstResponse: 4, resolution: 24 },
  medium: { firstResponse: 8, resolution: 72 },
  low: { firstResponse: 24, resolution: 120 },
};
const addHours = (date: Date, hours: number) => new Date(date.getTime() + hours * 3_600_000);
export class MongoAdminSupportTicketsRepository implements IAdminSupportTicketsRepository {
  async list(query: AdminListQuery) {
    const filter: Record<string, unknown> = {};
    if (query.status && query.status !== 'all') filter.status = query.status;
    if (query.search)
      filter.$or = [
        { subject: new RegExp(escapeAdminSearch(query.search), 'i') },
        { description: new RegExp(escapeAdminSearch(query.search), 'i') },
      ];
    const now = Date.now();
    const [rows, total, open, inProgress, resolved, overdue] = await Promise.all([
      SupportTicket.find(filter)
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .populate('userId', 'fullName username email')
        .populate('assignedTo', 'fullName username email')
        .lean(),
      SupportTicket.countDocuments(filter),
      SupportTicket.countDocuments({ status: 'open' }),
      SupportTicket.countDocuments({ status: 'in_progress' }),
      SupportTicket.countDocuments({ status: { $in: ['resolved', 'closed'] } }),
      SupportTicket.countDocuments({
        status: { $in: ['open', 'in_progress'] },
        $or: Object.entries(SLA_HOURS).map(([priority, sla]) => ({
          priority,
          createdAt: { $lt: new Date(now - sla.resolution * 3_600_000) },
        })),
      }),
    ]);
    const items = rows.map((row) => {
      const user = row.userId as unknown as {
        fullName?: string;
        username?: string;
        email?: string;
      };
      const assignee = row.assignedTo as unknown as {
        fullName?: string;
        username?: string;
        email?: string;
      } | null;
      const sla = SLA_HOURS[row.priority] ?? SLA_HOURS.medium;
      const firstResponseDueAt = addHours(row.createdAt, sla.firstResponse);
      const resolutionDueAt = addHours(row.createdAt, sla.resolution);
      const isOverdue = !['resolved', 'closed'].includes(row.status) && resolutionDueAt < new Date();
      return {
        id: String(row._id),
        subject: row.subject,
        description: row.description,
        category: row.category,
        priority: row.priority,
        status: row.status,
        requester: user?.fullName ?? user?.username ?? user?.email ?? 'Unknown',
        assignedTo: assignee?.fullName ?? assignee?.username ?? assignee?.email ?? 'Unassigned',
        resolutionNote: row.resolutionNote,
        firstRespondedAt: row.firstRespondedAt ?? null,
        firstResponseDueAt,
        resolutionDueAt,
        isOverdue,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      };
    });
    return createAdminPage(items, query, total, { open, inProgress, resolved, overdue });
  }
  async update(id: string, input: AdminSupportTicketUpdate, actor: AdminActor) {
    const session = await mongoose.startSession();
    let result: { id: string; status: string; resolutionNote: string; notificationSent: boolean } | null = null;
    try {
      await session.withTransaction(async () => {
        const current = await SupportTicket.findById(id).session(session).lean();
        if (!current) return;
        const update: Record<string, unknown> = {
          status: input.status,
          assignedTo: actor.userId,
          resolutionNote: input.resolutionNote ?? '',
          resolvedAt:
            input.status === 'resolved' || input.status === 'closed' ? new Date() : null,
        };
        if (!current.firstRespondedAt) update.firstRespondedAt = new Date();
        const ticket = await SupportTicket.findByIdAndUpdate(
          id,
          { $set: update },
          { returnDocument: 'after', session }
        ).lean();
        if (!ticket) return;
        const readableStatus = input.status.replace('_', ' ');
        const message = input.notificationMessage?.trim() ||
          `Your support ticket “${ticket.subject}” is now ${readableStatus}.`;
        const notificationSent = Boolean(ticket.userId);
        if (ticket.userId) {
          await Notification.create([{
            userId: ticket.userId,
            type: 'support_ticket_update',
            message,
            isRead: false,
            deepLink: '/support',
            metadata: { ticketId: id, subject: ticket.subject, status: input.status },
          }], { session });
        }
        await recordAdminAction(actor, 'admin_support_ticket_updated', 'admin.support-tickets', {
          targetType: 'support_ticket',
          targetId: id,
          targetTitle: ticket.subject,
          ownerId: ticket.userId ? String(ticket.userId) : '',
          previousStatus: current.status,
          newStatus: input.status,
          changes: {
            status: { from: current.status, to: input.status },
            resolutionNote: input.resolutionNote ?? '',
          },
          notificationMessage: message,
          notificationSent,
        }, session);
        result = { id, status: ticket.status, resolutionNote: ticket.resolutionNote, notificationSent };
      });
      return result;
    } finally {
      await session.endSession();
    }
  }
}
export const mongoAdminSupportTicketsRepository = new MongoAdminSupportTicketsRepository();
import mongoose from 'mongoose';
