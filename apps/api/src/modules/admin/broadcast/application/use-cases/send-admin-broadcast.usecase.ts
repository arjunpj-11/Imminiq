import type { AdminActor } from '../../../shared/domain';
import type {
  AdminBroadcastInput,
} from '../../domain/entities/admin-broadcast.entity';
import type { IAdminBroadcastRepository } from '../../domain/repositories/admin-broadcast.repository.interface';
import { AdminBroadcastApplicationError } from '../admin-broadcast-application.error';
import type { AdminBroadcastResultDTO } from '../admin-broadcast.dto';
import type { IAdminBroadcastMapper } from '../admin-broadcast.mapper';

export interface ISendAdminBroadcastUseCase {
  execute(input: AdminBroadcastInput, actor: AdminActor): Promise<AdminBroadcastResultDTO>;
}

export class SendAdminBroadcastUseCase implements ISendAdminBroadcastUseCase {
  constructor(
    private readonly repository: IAdminBroadcastRepository,
    private readonly mapper: IAdminBroadcastMapper
  ) {}

  async execute(input: AdminBroadcastInput, actor: AdminActor): Promise<AdminBroadcastResultDTO> {
    const result = await this.repository.send(input, actor);
    if (!result) throw AdminBroadcastApplicationError.disabled();
    return this.mapper.toResultDTO(result);
  }
}
