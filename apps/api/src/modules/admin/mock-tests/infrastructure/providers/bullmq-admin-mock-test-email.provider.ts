import { emailQueue } from '../../../../../infrastructure/queue/queues';
import type {
  AdminMockTestModerationEmail,
  IAdminMockTestEmailProvider,
} from '../../domain/services/admin-mock-test-email-provider.interface';

export class BullMqAdminMockTestEmailProvider implements IAdminMockTestEmailProvider {
  async queueModerationEmail(input: AdminMockTestModerationEmail) {
    await emailQueue.add(
      'mock-test-moderation',
      { kind: 'mock_test_moderation' as const, ...input },
      {
        attempts: 5,
        backoff: { type: 'exponential', delay: 2_000 },
        removeOnComplete: 500,
        removeOnFail: 2_000,
      }
    );
  }
}

export const bullMqAdminMockTestEmailProvider = new BullMqAdminMockTestEmailProvider();
