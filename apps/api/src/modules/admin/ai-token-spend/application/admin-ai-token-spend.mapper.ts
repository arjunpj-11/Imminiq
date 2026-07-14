import type { AdminAITokenSpend } from '../domain/entities/admin-ai-token-spend.entity';
import type { AdminAITokenSpendDTO } from './admin-ai-token-spend.dto';

export interface IAdminAITokenSpendMapper {
  toDTO(entity: AdminAITokenSpend): AdminAITokenSpendDTO;
}

export class AdminAITokenSpendMapper implements IAdminAITokenSpendMapper {
  toDTO(entity: AdminAITokenSpend): AdminAITokenSpendDTO {
    return {
      ...entity,
      summary: { ...entity.summary },
      daily: entity.daily.map((point) => ({ ...point })),
      byCategory: entity.byCategory.map((item) => ({ ...item })),
      byProvider: entity.byProvider.map((item) => ({ ...item })),
    };
  }
}
