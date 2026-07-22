import type { AdminMockTestsUseCases } from './application/admin-mock-tests-use-cases.contract';
import { BulkUpdateAdminMockTestLifecycleUseCase } from './application/use-cases/bulk-update-admin-mock-test-lifecycle.usecase';
import { GetAdminMockTestDetailUseCase } from './application/use-cases/get-admin-mock-test-detail.usecase';
import { ListAdminMockTestsUseCase } from './application/use-cases/list-admin-mock-tests.usecase';
import { mongoAdminMockTestsRepository } from './infrastructure/repositories/mongo-admin-mock-tests.repository';
import { AdminMockTestsMapper } from './application/admin-mock-tests.mapper';
import { ListAdminMockTestQuestionIssuesUseCase } from './application/use-cases/list-admin-mock-test-question-issues.usecase';
import { UpdateAdminMockTestLifecycleUseCase } from './application/use-cases/update-admin-mock-test-lifecycle.usecase';
import { UpdateAdminMockTestQuestionIssueUseCase } from './application/use-cases/update-admin-mock-test-question-issue.usecase';
import { bullMqAdminMockTestEmailProvider } from './infrastructure/providers/bullmq-admin-mock-test-email.provider';
import { AdminMockTestQuestionVersionService } from './application/admin-mock-test-question-version.service';
import { AdminContentAppealService, AdminExportService } from './infrastructure';
import { mongoAdminQuestionBankService } from './infrastructure/services/mongo-admin-question-bank.service';
export type AdminMockTestsComposition = { useCases: AdminMockTestsUseCases };

export const createAdminMockTestsComposition = (): AdminMockTestsComposition => {
  const mapper = new AdminMockTestsMapper();
  const updateLifecycle = new UpdateAdminMockTestLifecycleUseCase(
    mongoAdminMockTestsRepository,
    bullMqAdminMockTestEmailProvider
  );
  return {
    useCases: {
      exports: new AdminExportService(),
      contentAppeals: new AdminContentAppealService(),
      bulkUpdateLifecycle: new BulkUpdateAdminMockTestLifecycleUseCase(
        mongoAdminMockTestsRepository,
        updateLifecycle
      ),
      list: new ListAdminMockTestsUseCase(mongoAdminMockTestsRepository, mapper),
      getDetail: new GetAdminMockTestDetailUseCase(mongoAdminMockTestsRepository, mapper),
      listQuestionIssues: new ListAdminMockTestQuestionIssuesUseCase(
        mongoAdminMockTestsRepository,
        mapper
      ),
      updateQuestionIssue: new UpdateAdminMockTestQuestionIssueUseCase(
        mongoAdminMockTestsRepository,
        mapper,
        bullMqAdminMockTestEmailProvider
      ),
      updateLifecycle,
      questionVersions: new AdminMockTestQuestionVersionService(mongoAdminMockTestsRepository),
      questionBank: mongoAdminQuestionBankService,
    },
  };
};
