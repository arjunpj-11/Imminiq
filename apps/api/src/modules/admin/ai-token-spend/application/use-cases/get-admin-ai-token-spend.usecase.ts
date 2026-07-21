import type { AdminAITokenSpendRange } from '../../domain/entities/admin-ai-token-spend.entity';
import type { IAdminAITokenSpendRepository } from '../../domain/repositories/admin-ai-token-spend.repository.interface';
import type { AdminAITokenSpendDTO } from '../admin-ai-token-spend.dto';
import type { IAdminAITokenSpendMapper } from '../admin-ai-token-spend.mapper';

export interface IGetAdminAITokenSpendUseCase {
  execute(range: AdminAITokenSpendRange): Promise<AdminAITokenSpendDTO>;
}

export class GetAdminAITokenSpendUseCase implements IGetAdminAITokenSpendUseCase {
  constructor(
    private readonly _repository: IAdminAITokenSpendRepository,
    private readonly _mapper: IAdminAITokenSpendMapper
  ) {}

  async execute(range: AdminAITokenSpendRange): Promise<AdminAITokenSpendDTO> {
    return this._mapper.toDTO(await this._repository.get(range));
  }
}
