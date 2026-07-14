import type { AdminActor } from '../../../shared';
import type {
  AdminBroadcastInput,
  AdminBroadcastResult,
} from '../../domain/entities/admin-broadcast.entity';
import type { IAdminBroadcastRepository } from '../../domain/repositories/admin-broadcast.repository.interface';
import { AdminBroadcastApplicationError } from '../admin-broadcast-application.error';

export interface ISendAdminBroadcastUseCase {
  execute(input: AdminBroadcastInput, actor: AdminActor): Promise<AdminBroadcastResult>;
}

export class SendAdminBroadcastUseCase implements ISendAdminBroadcastUseCase {
  constructor(private readonly repository: IAdminBroadcastRepository) {}

  async execute(input: AdminBroadcastInput, actor: AdminActor): Promise<AdminBroadcastResult> {
    const result = await this.repository.send(input, actor);
    if (!result) throw AdminBroadcastApplicationError.disabled();
    return result;
  }
}
