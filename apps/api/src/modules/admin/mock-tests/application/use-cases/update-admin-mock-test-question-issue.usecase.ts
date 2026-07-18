import type { AdminActor } from '../../../../../shared/admin';
import type { AdminMockTestIssueUpdateInput } from '../../domain/entities/admin-mock-test.entity';
import type { IAdminMockTestsRepository } from '../../domain/repositories/admin-mock-tests.repository.interface';
import type { IAdminMockTestEmailProvider } from '../../domain/services/admin-mock-test-email-provider.interface';
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
    private readonly mapper: IAdminMockTestsMapper,
    private readonly emailProvider: IAdminMockTestEmailProvider
  ) {}

  async execute(id: string, input: AdminMockTestIssueUpdateInput, actor: AdminActor) {
    const result = await this.repository.updateQuestionIssue(id, input, actor);
    if (!result) throw AdminMockTestsApplicationError.issueNotFound();

    if (
      result.testOwnerEmail &&
      (input.resolutionAction === 'test_suspended' || input.resolutionAction === 'test_deleted')
    ) {
      try {
        await this.emailProvider.queueModerationEmail({
          to: result.testOwnerEmail,
          ownerName: result.testOwner,
          testTitle: result.testTitle,
          action: input.resolutionAction === 'test_deleted' ? 'deleted' : 'suspended',
          reason: input.resolutionNote,
        });
      } catch {
        // The in-app notification and audit event remain authoritative if email is unavailable.
      }
    }
    return this.mapper.toIssueDTO(result);
  }
}
