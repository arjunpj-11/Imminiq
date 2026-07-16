export type AdminBroadcast = {
  id: string;
  title: string;
  message: string;
  audience: 'all' | 'active';
  deepLink: string;
  sender: string;
  recipientCount: number;
  status: string;
  sentAt: string;
};
