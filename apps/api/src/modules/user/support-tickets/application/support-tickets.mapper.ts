import type {
  CreateSupportTicketInput,
  SupportTicketCreated,
} from '../domain/entities/support-ticket.entity';
import type {
  CreateSupportTicketDTO,
  SupportTicketCreatedDTO,
} from './support-tickets.dto';

export interface ISupportTicketsMapper {
  toCreateInput(dto: CreateSupportTicketDTO): CreateSupportTicketInput;
  toCreatedDTO(ticket: SupportTicketCreated): SupportTicketCreatedDTO;
}

export class SupportTicketsMapper implements ISupportTicketsMapper {
  toCreateInput(dto: CreateSupportTicketDTO): CreateSupportTicketInput {
    return { ...dto };
  }

  toCreatedDTO(ticket: SupportTicketCreated): SupportTicketCreatedDTO {
    return {
      ...ticket,
      createdAt: ticket.createdAt.toISOString(),
    };
  }
}
