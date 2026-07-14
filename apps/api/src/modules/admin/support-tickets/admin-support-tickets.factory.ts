import type { AdminSupportTicketsUseCases } from './application/admin-support-tickets-use-cases.contract';
import { ListAdminSupportTicketsUseCase } from './application/use-cases/list-admin-support-tickets.usecase';
import { UpdateAdminSupportTicketUseCase } from './application/use-cases/update-admin-support-ticket.usecase';
import { mongoAdminSupportTicketsRepository } from './infrastructure/repositories/mongo-admin-support-tickets.repository';
import { AdminSupportTicketsMapper } from './application/admin-support-tickets.mapper';
export type AdminSupportTicketsComposition = { useCases: AdminSupportTicketsUseCases };

export const createAdminSupportTicketsComposition = (): AdminSupportTicketsComposition => {
  const mapper = new AdminSupportTicketsMapper();
  return {
    useCases: {
      list: new ListAdminSupportTicketsUseCase(mongoAdminSupportTicketsRepository, mapper),
      update: new UpdateAdminSupportTicketUseCase(mongoAdminSupportTicketsRepository, mapper),
    },
  };
};
