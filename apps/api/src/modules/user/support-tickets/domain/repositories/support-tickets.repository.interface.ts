import type {
  CreateSupportTicketInput,
  SupportTicketCreated,
} from '../entities/support-ticket.entity';
export interface ISupportTicketsRepository {
  create(userId: string, input: CreateSupportTicketInput): Promise<SupportTicketCreated>;
}
