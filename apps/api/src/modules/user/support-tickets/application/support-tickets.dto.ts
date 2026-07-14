import type {
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketStatus,
} from '../domain/support-tickets.types';

export type CreateSupportTicketDTO = {
  subject: string;
  description: string;
  category: SupportTicketCategory;
  priority: SupportTicketPriority;
};

export type SupportTicketCreatedDTO = {
  id: string;
  subject: string;
  status: SupportTicketStatus;
  createdAt: string;
};
