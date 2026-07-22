import type { AdminActor } from '../../../../../shared/admin';
import type { AdminBroadcastInput } from '../../domain/entities/admin-broadcast.entity';
import type { IAdminBroadcastRepository } from '../../domain/repositories/admin-broadcast.repository.interface';
import { AdminBroadcastApplicationError } from '../admin-broadcast-application.error';
import type { AdminBroadcastResultDTO } from '../admin-broadcast.dto';
import type { IAdminBroadcastMapper } from '../admin-broadcast.mapper';

export interface ISendAdminBroadcastUseCase {
  execute(input: AdminBroadcastInput, actor: AdminActor): Promise<AdminBroadcastResultDTO>;
}

export class SendAdminBroadcastUseCase implements ISendAdminBroadcastUseCase {
  constructor(
    private readonly _repository: IAdminBroadcastRepository,
    private readonly _mapper: IAdminBroadcastMapper
  ) {}

  async execute(input: AdminBroadcastInput, actor: AdminActor): Promise<AdminBroadcastResultDTO> {
    const result = await this._repository.send(input, actor);
    if (!result) throw AdminBroadcastApplicationError.disabled();
    return this._mapper.toResultDTO(result);
  }
}
