import type { AdminActor, AdminListQuery, AdminPage } from '../../../shared';
import type {
  AdminSupportTicket,
  AdminSupportTicketResult,
  AdminSupportTicketUpdate,
} from '../../domain/admin-support-ticket.entity';
import type { IAdminSupportTicketsRepository } from '../../domain/repositories/admin-support-tickets.repository.interface';
export interface IAdminSupportTicketsUseCase {
  list(query: AdminListQuery): Promise<AdminPage<AdminSupportTicket>>;
  update(
    id: string,
    input: AdminSupportTicketUpdate,
    actor: AdminActor
  ): Promise<AdminSupportTicketResult>;
}
export class AdminSupportTicketsUseCase implements IAdminSupportTicketsUseCase {
  constructor(private readonly repository: IAdminSupportTicketsRepository) {}
  list(query: AdminListQuery) {
    return this.repository.list(query);
  }
  update(id: string, input: AdminSupportTicketUpdate, actor: AdminActor) {
    return this.repository.update(id, input, actor);
  }
}
