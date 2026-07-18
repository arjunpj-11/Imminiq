import type { AdminActionMeta, AdminActor } from '../../domain/admin-users.types';
import type { AdminUserMessageInput } from '../../domain/entities/admin-user.entity';
import type { IAdminUsersRepository } from '../../domain/repositories/admin-users.repository.interface';
import type { IAdminUserEmailProvider } from '../../domain/services/admin-user-email-provider.interface';
import { AdminUsersDomainError } from '../../domain/admin-users-domain.error';
import { AdminUsersApplicationError } from '../admin-users-application.error';
import type { AdminUserMessageResultDTO } from '../admin-users.dto';

export interface ISendAdminUserMessageUseCase {
  execute(
    userId: string,
    input: AdminUserMessageInput,
    actor: AdminActor,
    meta: Pick<AdminActionMeta, 'ipAddress' | 'userAgent'>
  ): Promise<AdminUserMessageResultDTO>;
}

export class SendAdminUserMessageUseCase implements ISendAdminUserMessageUseCase {
  constructor(
    private readonly repository: Pick<
      IAdminUsersRepository,
      'findById' | 'recordAdminMessage'
    >,
    private readonly emailProvider: IAdminUserEmailProvider
  ) {}

  async execute(
    userId: string,
    input: AdminUserMessageInput,
    actor: AdminActor,
    meta: Pick<AdminActionMeta, 'ipAddress' | 'userAgent'>
  ) {
    if (!/^[a-f\d]{24}$/i.test(userId)) {
      throw new AdminUsersDomainError('INVALID_USER_ID', 'Invalid user ID');
    }
    const target = await this.repository.findById(userId);
    if (!target) throw AdminUsersApplicationError.userNotFound();
    await this.repository.recordAdminMessage({
      actorId: actor.userId,
      userId,
      subject: input.subject,
      message: input.message,
      ...meta,
    });
    let emailQueued = false;
    if (input.notifyEmail && target.email) {
      try {
        await this.emailProvider.queueDirectMessage({
          to: target.email,
          userName: target.fullName,
          subject: input.subject,
          message: input.message,
        });
        emailQueued = true;
      } catch {
        // The in-app message and audit record remain authoritative.
      }
    }
    return { userId, emailQueued };
  }
}
