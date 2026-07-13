export type CreateSupportTicketInput = { subject: string; description: string; category: 'account' | 'learning' | 'technical' | 'billing' | 'other'; priority: 'low' | 'medium' | 'high' | 'urgent' }
export type SupportTicketCreated = { id: string; subject: string; status: string; createdAt: string }
