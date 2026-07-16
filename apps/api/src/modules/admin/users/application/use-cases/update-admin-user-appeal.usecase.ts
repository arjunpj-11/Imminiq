import type { IAdminUserEmailProvider } from '../../domain/services/admin-user-email-provider.interface';
import type { IAdminUsersRepository } from '../../domain/repositories/admin-users.repository.interface';
import type { AdminUserAppealUpdateResultDTO } from '../admin-users.dto';
import { AdminUsersApplicationError } from '../admin-users-application.error';

export interface IUpdateAdminUserAppealUseCase {
  execute(
    appealId: string,
    input: { status: 'under_review' | 'approved' | 'rejected'; reviewNote: string },
    actor: { userId: string },
    meta: { ipAddress: string; userAgent: string; notifyEmail: boolean }
  ): Promise<AdminUserAppealUpdateResultDTO>;
}

export class UpdateAdminUserAppealUseCase implements IUpdateAdminUserAppealUseCase {
  constructor(
    private readonly _repository: IAdminUsersRepository,
    private readonly _emailProvider: IAdminUserEmailProvider
  ) {}

  async execute(
    appealId: string,
    input: { status: 'under_review' | 'approved' | 'rejected'; reviewNote: string },
    actor: { userId: string },
    meta: { ipAddress: string; userAgent: string; notifyEmail: boolean }
  ) {
    const appeal = await this._repository.updateAppeal(appealId, {
      ...input,
      actorId: actor.userId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });
    if (!appeal) throw AdminUsersApplicationError.appealConflict();

    let emailQueued = false;
    if (meta.notifyEmail && appeal.identifier.includes('@')) {
      try {
        await this._emailProvider.queueDirectMessage({
          to: appeal.identifier,
          userName: appeal.userName,
          subject: `Moderation appeal ${appeal.caseId}: ${input.status.replace('_', ' ')}`,
          message: input.reviewNote,
        });
        emailQueued = true;
      } catch {
        // The persisted decision and in-app notification remain authoritative.
      }
    }
    return { appeal, emailQueued };
  }
}
