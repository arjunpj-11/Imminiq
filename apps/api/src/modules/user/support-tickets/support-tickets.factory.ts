import type { SupportTicketsUseCases } from './application/support-tickets-use-cases.contract';
import { SupportTicketsMapper } from './application/support-tickets.mapper';
import { CreateSupportTicketUseCase } from './application/use-cases/create-support-ticket.usecase';
import { mongoSupportTicketsRepository } from './infrastructure/repositories/mongo-support-tickets.repository';

export type SupportTicketsComposition = {
  useCases: SupportTicketsUseCases;
};

export const createSupportTicketsComposition = (): SupportTicketsComposition => {
  const mapper = new SupportTicketsMapper();

  return {
    useCases: {
      createTicket: new CreateSupportTicketUseCase(mongoSupportTicketsRepository, mapper),
    },
  };
};
