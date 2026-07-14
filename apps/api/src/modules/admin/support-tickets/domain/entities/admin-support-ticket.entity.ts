export type AdminSupportTicket = {
  id: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  requester: string;
  resolutionNote: string;
  createdAt: Date;
  updatedAt: Date;
};
export type AdminSupportTicketUpdate = {
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  resolutionNote?: string;
  notificationMessage?: string;
};
export type AdminSupportTicketResult = {
  id: string;
  status: string;
  resolutionNote: string;
  notificationSent: boolean;
};
