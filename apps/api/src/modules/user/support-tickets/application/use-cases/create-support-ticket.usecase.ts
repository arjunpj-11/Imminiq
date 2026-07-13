import type {
  CreateSupportTicketInput,
  SupportTicketCreated,
} from '../../domain/support-ticket.entity';
import type { ISupportTicketsRepository } from '../../domain/repositories/support-tickets.repository.interface';
export interface ICreateSupportTicketUseCase {
  execute(userId: string, input: CreateSupportTicketInput): Promise<SupportTicketCreated>;
}
export class CreateSupportTicketUseCase implements ICreateSupportTicketUseCase {
  constructor(private readonly repository: ISupportTicketsRepository) {}
  execute(userId: string, input: CreateSupportTicketInput) {
    return this.repository.create(userId, input);
  }
}
