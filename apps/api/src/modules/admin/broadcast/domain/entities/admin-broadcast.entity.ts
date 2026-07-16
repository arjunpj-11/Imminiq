export type AdminBroadcastAudience = 'all' | 'active' | 'free' | 'pro' | 'premium' | 'custom';
export type AdminBroadcastPoll = { question: string; options: string[] };
export type AdminBroadcastInput = {
  title: string;
  message: string;
  audience: AdminBroadcastAudience;
  userIds?: string[];
  deepLink?: string;
  poll?: AdminBroadcastPoll;
};
export type AdminBroadcast = {
  id: string;
  title: string;
  message: string;
  audience: string;
  deepLink: string;
  sender: string;
  recipientCount: number;
  status: string;
  sentAt: Date;
  poll?: AdminBroadcastPoll & { votes: number[]; totalVotes: number };
};
export type AdminBroadcastResult = { id: string; recipientCount: number; status: string };
