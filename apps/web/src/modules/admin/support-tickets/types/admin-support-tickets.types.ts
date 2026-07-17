export type AdminSupportTicket = {
  id: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  requester: string;
  assignedTo: string;
  resolutionNote: string;
  firstRespondedAt: string | null;
  firstResponseDueAt: string;
  resolutionDueAt: string;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
};
