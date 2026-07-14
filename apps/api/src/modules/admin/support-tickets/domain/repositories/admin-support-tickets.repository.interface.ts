import type { AdminActor, AdminListQuery, AdminPage } from '../../../shared';
import type {
  AdminSupportTicket,
  AdminSupportTicketResult,
  AdminSupportTicketUpdate,
} from '../entities/admin-support-ticket.entity';
export interface IAdminSupportTicketsRepository {
  list(query: AdminListQuery): Promise<AdminPage<AdminSupportTicket>>;
  update(
    id: string,
    input: AdminSupportTicketUpdate,
    actor: AdminActor
  ): Promise<AdminSupportTicketResult | null>;
}
