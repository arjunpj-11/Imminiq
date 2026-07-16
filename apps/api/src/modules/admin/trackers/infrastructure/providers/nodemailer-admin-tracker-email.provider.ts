import { emailQueue } from '../../../../../infrastructure/queue/queues';
import type { IAdminTrackerEmailProvider } from '../../domain/services/admin-tracker-email-provider.interface';

export class NodemailerAdminTrackerEmailProvider implements IAdminTrackerEmailProvider {
  async queueTrackerModeration(input: {
    to: string;
    ownerName: string;
    trackerTitle: string;
    action: 'suspended' | 'deleted' | 'restored';
    reason: string;
  }) {
    await emailQueue.add(
      'tracker-moderation',
      { kind: 'tracker_moderation' as const, ...input },
      {
        attempts: 5,
        backoff: { type: 'exponential', delay: 2_000 },
        removeOnComplete: 500,
        removeOnFail: 2_000,
      }
    );
  }
}
export const nodemailerAdminTrackerEmailProvider = new NodemailerAdminTrackerEmailProvider();
