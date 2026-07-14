export interface IAdminSupportTicketDTO {
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
}

export interface IAdminSupportTicketResultDTO {
  id: string;
  status: string;
  resolutionNote: string;
  notificationSent: boolean;
}
