import type { AdminActor } from '../../../shared/domain';
import type { AdminMockTestLifecycleInput } from '../../domain/entities/admin-mock-test.entity';
import type { IAdminMockTestsRepository } from '../../domain/repositories/admin-mock-tests.repository.interface';
import type { IAdminMockTestEmailProvider } from '../../domain/services/admin-mock-test-email-provider.interface';
import { AdminMockTestsApplicationError } from '../admin-mock-tests-application.error';
import type { AdminMockTestLifecycleResultDTO } from '../admin-mock-tests.dto';

export interface IUpdateAdminMockTestLifecycleUseCase {
  execute(
    id: string,
    input: AdminMockTestLifecycleInput,
    actor: AdminActor
  ): Promise<AdminMockTestLifecycleResultDTO>;
}

export class UpdateAdminMockTestLifecycleUseCase
  implements IUpdateAdminMockTestLifecycleUseCase
{
  constructor(
    private readonly repository: IAdminMockTestsRepository,
    private readonly emailProvider: IAdminMockTestEmailProvider
  ) {}

  async execute(id: string, input: AdminMockTestLifecycleInput, actor: AdminActor) {
    const result = await this.repository.updateLifecycle(id, input, actor);
    if (!result) throw AdminMockTestsApplicationError.notFound();

    let notificationQueued = false;
    if (input.notifyOwner && result.ownerEmail) {
      try {
        await this.emailProvider.queueModerationEmail({
          to: result.ownerEmail,
          ownerName: result.owner,
          testTitle: result.title,
          action:
            input.action === 'restore'
              ? 'restored'
              : input.action === 'suspend'
                ? 'suspended'
                : 'deleted',
          reason: input.reason,
        });
        notificationQueued = true;
      } catch {
        // The moderation transaction has already completed. In-app notification and audit
        // remain authoritative; the API must not report a false action failure.
      }
    }

    return {
      id: result.id,
      title: result.title,
      moderationStatus: result.moderationStatus,
      reason: result.reason,
      affectedActiveAttempts: result.affectedActiveAttempts,
      notificationQueued,
      updatedAt: result.updatedAt,
    };
  }
}
