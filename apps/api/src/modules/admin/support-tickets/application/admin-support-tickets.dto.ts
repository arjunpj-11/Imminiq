export interface AdminSupportTicketDTO {
  id: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  requester: string;
  assignedTo: string;
  resolutionNote: string;
  firstRespondedAt: Date | null;
  firstResponseDueAt: Date;
  resolutionDueAt: Date;
  isOverdue: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminSupportTicketResultDTO {
  id: string;
  status: string;
  resolutionNote: string;
  notificationSent: boolean;
}
