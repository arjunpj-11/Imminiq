import type {
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketStatus,
} from '../support-tickets.types';

export type CreateSupportTicketInput = {
  subject: string;
  description: string;
  category: SupportTicketCategory;
  priority: SupportTicketPriority;
};

export type SupportTicketCreated = {
  id: string;
  subject: string;
  status: SupportTicketStatus;
  createdAt: Date;
};
