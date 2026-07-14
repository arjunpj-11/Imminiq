export interface IAdminBroadcastDTO {
  id: string;
  title: string;
  message: string;
  audience: string;
  sender: string;
  recipientCount: number;
  status: string;
  sentAt: Date;
}

export interface IAdminBroadcastResultDTO {
  id: string;
  recipientCount: number;
  status: string;
}
