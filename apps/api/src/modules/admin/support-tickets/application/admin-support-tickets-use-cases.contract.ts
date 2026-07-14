import type { IListAdminSupportTicketsUseCase } from './use-cases/list-admin-support-tickets.usecase';
import type { IUpdateAdminSupportTicketUseCase } from './use-cases/update-admin-support-ticket.usecase';

export type AdminSupportTicketsUseCases = {
  list: IListAdminSupportTicketsUseCase;
  update: IUpdateAdminSupportTicketUseCase;
};
