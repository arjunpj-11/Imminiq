import type { AdminListQuery, AdminPage } from '../../../../../shared/admin';
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
    private readonly _repository: Pick<IAdminMockTestsRepository, 'listQuestionIssues'>,
    private readonly _mapper: IAdminMockTestsMapper
  ) {}

  async execute(query: AdminListQuery) {
    const page = await this._repository.listQuestionIssues(query);
    return this._mapper.toIssuePageDTO(page as AdminPage<AdminMockTestQuestionIssue>);
  }
}
