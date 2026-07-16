import type { AdminListQuery, AdminPage } from '../../../shared/domain';
import type { AdminMockTestQuestionIssue } from '../../domain/entities/admin-mock-test.entity';
import type { IAdminMockTestsRepository } from '../../domain/repositories/admin-mock-tests.repository.interface';
import type { AdminMockTestQuestionIssueDTO } from '../admin-mock-tests.dto';
import type { IAdminMockTestsMapper } from '../admin-mock-tests.mapper';

export interface IListAdminMockTestQuestionIssuesUseCase {
  execute(query: AdminListQuery): Promise<AdminPage<AdminMockTestQuestionIssueDTO>>;
}

export class ListAdminMockTestQuestionIssuesUseCase
  implements IListAdminMockTestQuestionIssuesUseCase
{
  constructor(
    private readonly repository: IAdminMockTestsRepository,
    private readonly mapper: IAdminMockTestsMapper
  ) {}

  async execute(query: AdminListQuery) {
    const page = await this.repository.listQuestionIssues(query);
    return this.mapper.toIssuePageDTO(page as AdminPage<AdminMockTestQuestionIssue>);
  }
}
