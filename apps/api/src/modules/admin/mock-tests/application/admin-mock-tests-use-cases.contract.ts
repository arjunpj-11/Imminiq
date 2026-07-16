import type { IGetAdminMockTestDetailUseCase } from './use-cases/get-admin-mock-test-detail.usecase';
import type { IListAdminMockTestsUseCase } from './use-cases/list-admin-mock-tests.usecase';
import type { IListAdminMockTestQuestionIssuesUseCase } from './use-cases/list-admin-mock-test-question-issues.usecase';
import type { IUpdateAdminMockTestLifecycleUseCase } from './use-cases/update-admin-mock-test-lifecycle.usecase';
import type { IUpdateAdminMockTestQuestionIssueUseCase } from './use-cases/update-admin-mock-test-question-issue.usecase';
import type { IAdminMockTestQuestionVersionService } from './admin-mock-test-question-version.service';

export type AdminMockTestsUseCases = {
  exports: import('../../shared/application').IAdminExportService;
  contentAppeals: import('../../shared/application').IAdminContentAppealService;
  list: IListAdminMockTestsUseCase;
  getDetail: IGetAdminMockTestDetailUseCase;
  listQuestionIssues: IListAdminMockTestQuestionIssuesUseCase;
  updateQuestionIssue: IUpdateAdminMockTestQuestionIssueUseCase;
  updateLifecycle: IUpdateAdminMockTestLifecycleUseCase;
  questionVersions: IAdminMockTestQuestionVersionService;
};
