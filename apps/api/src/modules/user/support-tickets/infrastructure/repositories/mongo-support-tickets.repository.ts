import { ActivityLog } from '../../../../../infrastructure/database/models/activity-log.model'
import { SupportTicket } from '../../../../../infrastructure/database/models/support-ticket.model'
import type { CreateSupportTicketInput } from '../../domain/support-ticket.entity'
import type { ISupportTicketsRepository } from '../../domain/repositories/support-tickets.repository.interface'
export class MongoSupportTicketsRepository implements ISupportTicketsRepository { async create(userId: string, input: CreateSupportTicketInput) { const ticket = await SupportTicket.create({ ...input, userId, status: 'open' }); await ActivityLog.create({ userId, action: 'support_ticket_created', module: 'support-tickets', severity: input.priority === 'urgent' ? 'warning' : 'info', metadata: { targetType: 'support_ticket', targetId: String(ticket._id), targetTitle: ticket.subject, category: ticket.category, priority: ticket.priority } }); return { id: String(ticket._id), subject: ticket.subject, status: ticket.status, createdAt: ticket.createdAt } } }
export const mongoSupportTicketsRepository = new MongoSupportTicketsRepository()
