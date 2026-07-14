import { SupportTicket } from '../../../../../infrastructure/database/models/support-ticket.model';
import { Notification } from '../../../../../infrastructure/database/models/notification.model';
import type { AdminActor, AdminListQuery } from '../../../shared/domain';
import { recordAdminAction } from '../../../shared/infrastructure';
import { createAdminPage, escapeAdminSearch } from '../../../shared/infrastructure';
import type { AdminSupportTicketUpdate } from '../../domain/entities/admin-support-ticket.entity';
import type { IAdminSupportTicketsRepository } from '../../domain/repositories/admin-support-tickets.repository.interface';
export class MongoAdminSupportTicketsRepository implements IAdminSupportTicketsRepository {
  async list(query: AdminListQuery) {
    const filter: Record<string, unknown> = {};
    if (query.status && query.status !== 'all') filter.status = query.status;
    if (query.search)
      filter.$or = [
        { subject: new RegExp(escapeAdminSearch(query.search), 'i') },
        { description: new RegExp(escapeAdminSearch(query.search), 'i') },
      ];
    const [rows, total, open, inProgress, resolved] = await Promise.all([
      SupportTicket.find(filter)
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .populate('userId', 'fullName username email')
        .lean(),
      SupportTicket.countDocuments(filter),
      SupportTicket.countDocuments({ status: 'open' }),
      SupportTicket.countDocuments({ status: 'in_progress' }),
      SupportTicket.countDocuments({ status: { $in: ['resolved', 'closed'] } }),
    ]);
    const items = rows.map((row) => {
      const user = row.userId as unknown as {
        fullName?: string;
        username?: string;
        email?: string;
      };
      return {
        id: String(row._id),
        subject: row.subject,
        description: row.description,
        category: row.category,
        priority: row.priority,
        status: row.status,
        requester: user?.fullName ?? user?.username ?? user?.email ?? 'Unknown',
        resolutionNote: row.resolutionNote,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      };
    });
    return createAdminPage(items, query, total, { open, inProgress, resolved });
  }
  async update(id: string, input: AdminSupportTicketUpdate, actor: AdminActor) {
    const current = await SupportTicket.findById(id).lean();
    if (!current) return null;
    const update: Record<string, unknown> = {
      status: input.status,
      assignedTo: actor.userId,
      resolutionNote: input.resolutionNote ?? '',
    };
    if (input.status === 'resolved' || input.status === 'closed') update.resolvedAt = new Date();
    else update.resolvedAt = null;
    const ticket = await SupportTicket.findByIdAndUpdate(
      id,
      { $set: update },
      { returnDocument: "after" }
    ).lean();
    if (!ticket) return null;
    const readableStatus = input.status.replace('_', ' ');
    const message =
      input.notificationMessage?.trim() ||
      `Your support ticket “${ticket.subject}” is now ${readableStatus}.`;
    let notificationSent = false;
    if (ticket.userId) {
      await Notification.create({
        userId: ticket.userId,
        type: 'support_ticket_update',
        message,
        isRead: false,
        deepLink: '/support',
        metadata: { ticketId: id, subject: ticket.subject, status: input.status },
      });
      notificationSent = true;
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
    });
    return { id, status: ticket.status, resolutionNote: ticket.resolutionNote, notificationSent };
  }
}
export const mongoAdminSupportTicketsRepository = new MongoAdminSupportTicketsRepository();
