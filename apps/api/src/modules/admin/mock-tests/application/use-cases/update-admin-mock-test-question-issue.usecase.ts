import type { AdminActor } from '../../../shared/domain';
import type { AdminMockTestIssueUpdateInput } from '../../domain/entities/admin-mock-test.entity';
import type { IAdminMockTestsRepository } from '../../domain/repositories/admin-mock-tests.repository.interface';
import { AdminMockTestsApplicationError } from '../admin-mock-tests-application.error';
import type { IAdminMockTestsMapper } from '../admin-mock-tests.mapper';

export interface IUpdateAdminMockTestQuestionIssueUseCase {
  execute(id: string, input: AdminMockTestIssueUpdateInput, actor: AdminActor): Promise<object>;
}

export class UpdateAdminMockTestQuestionIssueUseCase
  implements IUpdateAdminMockTestQuestionIssueUseCase
{
  constructor(
    private readonly repository: IAdminMockTestsRepository,
    private readonly mapper: IAdminMockTestsMapper
  ) {}

  async execute(id: string, input: AdminMockTestIssueUpdateInput, actor: AdminActor) {
    const result = await this.repository.updateQuestionIssue(id, input, actor);
    if (!result) throw AdminMockTestsApplicationError.issueNotFound();
    return this.mapper.toIssueDTO(result);
  }
}
