import type { AdminListQuery, AdminPage } from '../../../shared';
import type { AdminSupportTicket } from '../../domain/entities/admin-support-ticket.entity';
import type { IAdminSupportTicketsRepository } from '../../domain/repositories/admin-support-tickets.repository.interface';

export interface IListAdminSupportTicketsUseCase {
  execute(query: AdminListQuery): Promise<AdminPage<AdminSupportTicket>>;
}

export class ListAdminSupportTicketsUseCase implements IListAdminSupportTicketsUseCase {
  constructor(private readonly repository: IAdminSupportTicketsRepository) {}

  execute(query: AdminListQuery): Promise<AdminPage<AdminSupportTicket>> {
    return this.repository.list(query);
  }
}
