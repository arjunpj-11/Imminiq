import type { AdminMockTestsUseCases } from './application/admin-mock-tests-use-cases.contract';
import { GetAdminMockTestDetailUseCase } from './application/use-cases/get-admin-mock-test-detail.usecase';
import { ListAdminMockTestsUseCase } from './application/use-cases/list-admin-mock-tests.usecase';
import { mongoAdminMockTestsRepository } from './infrastructure/repositories/mongo-admin-mock-tests.repository';
import { AdminMockTestsMapper } from './application/admin-mock-tests.mapper';
import { ListAdminMockTestQuestionIssuesUseCase } from './application/use-cases/list-admin-mock-test-question-issues.usecase';
import { UpdateAdminMockTestLifecycleUseCase } from './application/use-cases/update-admin-mock-test-lifecycle.usecase';
import { UpdateAdminMockTestQuestionIssueUseCase } from './application/use-cases/update-admin-mock-test-question-issue.usecase';
import { bullMqAdminMockTestEmailProvider } from './infrastructure/providers/bullmq-admin-mock-test-email.provider';
export type AdminMockTestsComposition = { useCases: AdminMockTestsUseCases };

export const createAdminMockTestsComposition = (): AdminMockTestsComposition => {
  const mapper = new AdminMockTestsMapper();
  return {
    useCases: {
      list: new ListAdminMockTestsUseCase(mongoAdminMockTestsRepository, mapper),
      getDetail: new GetAdminMockTestDetailUseCase(mongoAdminMockTestsRepository, mapper),
      listQuestionIssues: new ListAdminMockTestQuestionIssuesUseCase(
        mongoAdminMockTestsRepository,
        mapper
      ),
      updateQuestionIssue: new UpdateAdminMockTestQuestionIssueUseCase(
        mongoAdminMockTestsRepository,
        mapper
      ),
      updateLifecycle: new UpdateAdminMockTestLifecycleUseCase(
        mongoAdminMockTestsRepository,
        bullMqAdminMockTestEmailProvider
      ),
    },
  };
};
