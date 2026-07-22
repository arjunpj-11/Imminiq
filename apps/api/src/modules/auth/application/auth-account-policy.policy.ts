import { AuthApplicationError } from './auth-application.error';
import type { AuthUserEntity } from '../domain/entities/auth-user.entity';
import type { IClock } from '../../../shared/time/clock.interface';

export interface IAuthAccountPolicy {
  ensureUserCanAuthenticate(user: AuthUserEntity): void;
}

export class AuthAccountPolicy implements IAuthAccountPolicy {
  constructor(private readonly _clock: IClock) {}

  ensureUserCanAuthenticate(user: AuthUserEntity): void {
    const reason = user.adminStatusReason ? ` Reason: ${user.adminStatusReason}` : '';
    if (user.status === 'blocked' || user.status === 'banned') {
      throw AuthApplicationError.accountBlocked(`Account blocked.${reason}`);
    }

    if (user.status === 'deactivated') {
      if (this.hasRecoverableScheduledDeletion(user)) {
        return;
      }

      throw AuthApplicationError.accountDeactivated('Account deactivated');
    }

    if (user.status === 'paused') {
      throw AuthApplicationError.accountPaused(`Account suspended.${reason}`);
    }
  }

  private hasRecoverableScheduledDeletion(user: AuthUserEntity): boolean {
    if (user.status !== 'deactivated' || !user.scheduledDeletionAt) {
      return false;
    }

    const scheduledDeletionTime = new Date(user.scheduledDeletionAt).getTime();

    return (
      Number.isFinite(scheduledDeletionTime) && scheduledDeletionTime > this._clock.now().getTime()
    );
  }
}
