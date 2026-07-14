import type { AdminAITokenSpend, AdminAITokenSpendRange } from '../domain/ai-token-spend.entity';
import type { IAdminAITokenSpendRepository } from '../domain/ai-token-spend.repository.interface';

export class GetAdminAITokenSpendUseCase {
  constructor(private readonly repository: IAdminAITokenSpendRepository) {}

  execute(range: AdminAITokenSpendRange): Promise<AdminAITokenSpend> {
    return this.repository.get(range);
  }
}
