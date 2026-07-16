export interface AdminBroadcastDTO {
  id: string;
  title: string;
  message: string;
  audience: string;
  deepLink: string;
  sender: string;
  recipientCount: number;
  status: string;
  sentAt: Date;
}

export interface AdminBroadcastResultDTO {
  id: string;
  recipientCount: number;
  status: string;
}
