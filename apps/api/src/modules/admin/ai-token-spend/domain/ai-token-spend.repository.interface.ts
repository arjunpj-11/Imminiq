import type {
  AdminAITokenSpend,
  AdminAITokenSpendRange,
} from './ai-token-spend.entity';

export interface IAdminAITokenSpendRepository {
  get(range: AdminAITokenSpendRange): Promise<AdminAITokenSpend>;
}
