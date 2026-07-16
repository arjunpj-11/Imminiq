export interface IAdminUserEmailProvider {
  queueStatusEmail(input: {
    to: string;
    userName: string;
    status: 'active' | 'paused' | 'blocked';
    reason: string;
  }): Promise<void>;
  queueDirectMessage(input: {
    to: string;
    userName: string;
    subject: string;
    message: string;
  }): Promise<void>;
}
