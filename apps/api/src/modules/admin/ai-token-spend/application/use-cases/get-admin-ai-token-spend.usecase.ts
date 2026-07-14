import type { AdminAITokenSpendRange } from '../../domain/entities/admin-ai-token-spend.entity';
import type { IAdminAITokenSpendRepository } from '../../domain/repositories/admin-ai-token-spend.repository.interface';
import type { IAdminAITokenSpendDTO } from '../admin-ai-token-spend.dto';
import type { IAdminAITokenSpendMapper } from '../admin-ai-token-spend.mapper';

export interface IGetAdminAITokenSpendUseCase {
  execute(range: AdminAITokenSpendRange): Promise<IAdminAITokenSpendDTO>;
}

export class GetAdminAITokenSpendUseCase implements IGetAdminAITokenSpendUseCase {
  constructor(
    private readonly repository: IAdminAITokenSpendRepository,
    private readonly mapper: IAdminAITokenSpendMapper
  ) {}

  async execute(range: AdminAITokenSpendRange): Promise<IAdminAITokenSpendDTO> {
    return this.mapper.toDTO(await this.repository.get(range));
  }
}
