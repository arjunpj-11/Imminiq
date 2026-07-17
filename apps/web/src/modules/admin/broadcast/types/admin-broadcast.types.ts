export type AdminBroadcastAudience =
  "all" | "active" | "free" | "pro" | "premium" | "custom";
export type AdminBroadcastPoll = {
  question: string;
  options: string[];
  votes?: number[];
  totalVotes?: number;
};
export type AdminBroadcast = {
  id: string;
  title: string;
  message: string;
  audience: AdminBroadcastAudience;
  deepLink: string;
  sender: string;
  recipientCount: number;
  status: string;
  sentAt: string;
  poll?: AdminBroadcastPoll;
};
