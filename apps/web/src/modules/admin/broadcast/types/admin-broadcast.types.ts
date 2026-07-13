export type AdminBroadcast = {
  id: string;
  title: string;
  message: string;
  audience: 'all' | 'active';
  sender: string;
  recipientCount: number;
  status: string;
  sentAt: string;
};
