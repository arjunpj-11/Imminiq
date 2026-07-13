import { CreateSupportTicketUseCase } from './application/use-cases/create-support-ticket.usecase'
import { mongoSupportTicketsRepository } from './infrastructure/repositories/mongo-support-tickets.repository'
export const createSupportTicketsComposition = () => ({ useCase: new CreateSupportTicketUseCase(mongoSupportTicketsRepository) })
