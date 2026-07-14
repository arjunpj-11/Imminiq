import type { AdminSupportTicketsUseCases } from './application/admin-support-tickets-use-cases.contract';
import { ListAdminSupportTicketsUseCase } from './application/use-cases/list-admin-support-tickets.usecase';
import { UpdateAdminSupportTicketUseCase } from './application/use-cases/update-admin-support-ticket.usecase';
import { mongoAdminSupportTicketsRepository } from './infrastructure/repositories/mongo-admin-support-tickets.repository';
export type AdminSupportTicketsComposition = { useCases: AdminSupportTicketsUseCases };

export const createAdminSupportTicketsComposition = (): AdminSupportTicketsComposition => ({
  useCases: {
    list: new ListAdminSupportTicketsUseCase(mongoAdminSupportTicketsRepository),
    update: new UpdateAdminSupportTicketUseCase(mongoAdminSupportTicketsRepository),
  },
});
