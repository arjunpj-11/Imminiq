import type { SupportTicketCategory, SupportTicketPriority } from './support-tickets.types';

export const SUPPORT_TICKET_CATEGORIES = [
  'account',
  'learning',
  'technical',
  'billing',
  'other',
] as const satisfies readonly SupportTicketCategory[];

export const SUPPORT_TICKET_PRIORITIES = [
  'low',
  'medium',
  'high',
  'urgent',
] as const satisfies readonly SupportTicketPriority[];
