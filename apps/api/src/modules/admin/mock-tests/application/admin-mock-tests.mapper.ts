import type { AdminPage } from '../../shared/domain';
import type { AdminMockTest, AdminMockTestDetail } from '../domain/entities/admin-mock-test.entity';
import type { AdminMockTestDetailDTO, AdminMockTestDTO } from './admin-mock-tests.dto';

export interface IAdminMockTestsMapper {
  toDTO(entity: AdminMockTest): AdminMockTestDTO;
  toDetailDTO(entity: AdminMockTestDetail): AdminMockTestDetailDTO;
  toPageDTO(page: AdminPage<AdminMockTest>): AdminPage<AdminMockTestDTO>;
}

export class AdminMockTestsMapper implements IAdminMockTestsMapper {
  toDTO(entity: AdminMockTest): AdminMockTestDTO {
    return { ...entity };
  }

  toDetailDTO(entity: AdminMockTestDetail): AdminMockTestDetailDTO {
    return {
      ...entity,
      tags: [...entity.tags],
      questions: entity.questions.map((question) => ({
        ...question,
        ...(question.options ? { options: [...question.options] } : {}),
        ...(question.coding ? { coding: { ...question.coding } } : {}),
      })),
    };
  }

  toPageDTO(page: AdminPage<AdminMockTest>): AdminPage<AdminMockTestDTO> {
    return {
      ...page,
      items: page.items.map((item) => this.toDTO(item)),
      pagination: { ...page.pagination },
      ...(page.stats ? { stats: { ...page.stats } } : {}),
    };
  }
}
