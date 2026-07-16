import type { AdminPage } from '../../shared/domain';
import type {
  AdminMockTest,
  AdminMockTestDetail,
  AdminMockTestQuestionIssue,
} from '../domain/entities/admin-mock-test.entity';
import type {
  AdminMockTestDetailDTO,
  AdminMockTestDTO,
  AdminMockTestQuestionIssueDTO,
} from './admin-mock-tests.dto';

export interface IAdminMockTestsMapper {
  toDTO(entity: AdminMockTest): AdminMockTestDTO;
  toDetailDTO(entity: AdminMockTestDetail): AdminMockTestDetailDTO;
  toPageDTO(page: AdminPage<AdminMockTest>): AdminPage<AdminMockTestDTO>;
  toIssueDTO(entity: AdminMockTestQuestionIssue): AdminMockTestQuestionIssueDTO;
  toIssuePageDTO(
    page: AdminPage<AdminMockTestQuestionIssue>
  ): AdminPage<AdminMockTestQuestionIssueDTO>;
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

  toIssueDTO(entity: AdminMockTestQuestionIssue): AdminMockTestQuestionIssueDTO {
    return { ...entity };
  }

  toIssuePageDTO(page: AdminPage<AdminMockTestQuestionIssue>) {
    return {
      ...page,
      items: page.items.map((item) => this.toIssueDTO(item)),
      pagination: { ...page.pagination },
      ...(page.stats ? { stats: { ...page.stats } } : {}),
    };
  }
}
