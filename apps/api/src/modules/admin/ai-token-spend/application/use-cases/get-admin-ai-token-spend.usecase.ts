import type {
  AdminAITokenSpend,
  AdminAITokenSpendRange,
} from '../../domain/entities/admin-ai-token-spend.entity';
import type { IAdminAITokenSpendRepository } from '../../domain/repositories/admin-ai-token-spend.repository.interface';

export interface IGetAdminAITokenSpendUseCase {
  execute(range: AdminAITokenSpendRange): Promise<AdminAITokenSpend>;
}

export class GetAdminAITokenSpendUseCase implements IGetAdminAITokenSpendUseCase {
  constructor(private readonly repository: IAdminAITokenSpendRepository) {}

  execute(range: AdminAITokenSpendRange): Promise<AdminAITokenSpend> {
    return this.repository.get(range);
  }
}
