import { emailQueue } from '../../../../../infrastructure/queue/queues';
import type { IAdminUserEmailProvider } from '../../domain/services/admin-user-email-provider.interface';

export class QueuedAdminUserEmailProvider implements IAdminUserEmailProvider {
  async queueStatusEmail(input: {
    to: string;
    userName: string;
    status: 'active' | 'paused' | 'blocked';
    reason: string;
  }) {
    await emailQueue.add(
      'admin-user-status',
      { kind: 'admin_user_status' as const, ...input },
      {
        attempts: 5,
        backoff: { type: 'exponential', delay: 2_000 },
        removeOnComplete: 500,
        removeOnFail: 2_000,
      }
    );
  }

  async queueDirectMessage(input: {
    to: string;
    userName: string;
    subject: string;
    message: string;
  }) {
    await emailQueue.add(
      'admin-user-message',
      { kind: 'admin_user_message' as const, ...input },
      {
        attempts: 5,
        backoff: { type: 'exponential', delay: 2_000 },
        removeOnComplete: 500,
        removeOnFail: 2_000,
      }
    );
  }
}

export const queuedAdminUserEmailProvider = new QueuedAdminUserEmailProvider();
