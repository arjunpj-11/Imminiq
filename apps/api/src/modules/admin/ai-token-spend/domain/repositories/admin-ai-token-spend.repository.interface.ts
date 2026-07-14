import type {
  AdminAITokenSpend,
  AdminAITokenSpendRange,
} from '../entities/admin-ai-token-spend.entity';

export interface IAdminAITokenSpendRepository {
  get(range: AdminAITokenSpendRange): Promise<AdminAITokenSpend>;
}
