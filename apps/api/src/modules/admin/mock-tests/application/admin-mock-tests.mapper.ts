import type { AdminPage } from '../../shared';
import type {
  AdminMockTest,
  AdminMockTestDetail,
} from '../domain/entities/admin-mock-test.entity';
import type { IAdminMockTestDetailDTO, IAdminMockTestDTO } from './admin-mock-tests.dto';

export interface IAdminMockTestsMapper {
  toDTO(entity: AdminMockTest): IAdminMockTestDTO;
  toDetailDTO(entity: AdminMockTestDetail): IAdminMockTestDetailDTO;
  toPageDTO(page: AdminPage<AdminMockTest>): AdminPage<IAdminMockTestDTO>;
}

export class AdminMockTestsMapper implements IAdminMockTestsMapper {
  toDTO(entity: AdminMockTest): IAdminMockTestDTO {
    return { ...entity };
  }

  toDetailDTO(entity: AdminMockTestDetail): IAdminMockTestDetailDTO {
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

  toPageDTO(page: AdminPage<AdminMockTest>): AdminPage<IAdminMockTestDTO> {
    return {
      ...page,
      items: page.items.map((item) => this.toDTO(item)),
      pagination: { ...page.pagination },
      ...(page.stats ? { stats: { ...page.stats } } : {}),
    };
  }
}
