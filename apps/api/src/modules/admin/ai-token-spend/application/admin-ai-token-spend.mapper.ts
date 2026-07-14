import type { AdminAITokenSpend } from '../domain/entities/admin-ai-token-spend.entity';
import type { IAdminAITokenSpendDTO } from './admin-ai-token-spend.dto';

export interface IAdminAITokenSpendMapper {
  toDTO(entity: AdminAITokenSpend): IAdminAITokenSpendDTO;
}

export class AdminAITokenSpendMapper implements IAdminAITokenSpendMapper {
  toDTO(entity: AdminAITokenSpend): IAdminAITokenSpendDTO {
    return {
      ...entity,
      summary: { ...entity.summary },
      daily: entity.daily.map((point) => ({ ...point })),
      byCategory: entity.byCategory.map((item) => ({ ...item })),
      byProvider: entity.byProvider.map((item) => ({ ...item })),
    };
  }
}
