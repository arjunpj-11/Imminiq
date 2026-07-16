import type { AdminActor } from '../../../shared/domain';
import type { AdminTrackerLifecycleInput } from '../../domain/entities/admin-tracker.entity';
import type { IAdminTrackerEmailProvider } from '../../domain/services/admin-tracker-email-provider.interface';
import type { IAdminTrackersRepository } from '../../domain/repositories/admin-trackers.repository.interface';
import { AdminTrackersApplicationError } from '../admin-trackers-application.error';
import type { AdminTrackerLifecycleResult } from '../../domain/entities/admin-tracker.entity';

export interface IUpdateAdminTrackerLifecycleUseCase {
  execute(
    id: string,
    input: AdminTrackerLifecycleInput,
    actor: AdminActor
  ): Promise<AdminTrackerLifecycleResult & { notificationQueued: boolean }>;
}

export class UpdateAdminTrackerLifecycleUseCase implements IUpdateAdminTrackerLifecycleUseCase {
  constructor(
    private readonly repository: IAdminTrackersRepository,
    private readonly emailProvider: IAdminTrackerEmailProvider
  ) {}
  async execute(id: string, input: AdminTrackerLifecycleInput, actor: AdminActor) {
    const result = await this.repository.updateLifecycle(id, input, actor);
    if (!result) throw AdminTrackersApplicationError.trackerNotFound();
    let notificationQueued = false;
    if (input.notifyOwner && result.ownerEmail) {
      try {
        await this.emailProvider.queueTrackerModeration({
          to: result.ownerEmail,
          ownerName: result.owner,
          trackerTitle: result.title,
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
        // The database decision and in-app notification remain authoritative.
      }
    }
    return { ...result, notificationQueued };
  }
}
