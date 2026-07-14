import type { ICreateSupportTicketUseCase } from './use-cases/create-support-ticket.usecase';

export type SupportTicketsUseCases = {
  createTicket: ICreateSupportTicketUseCase;
};
