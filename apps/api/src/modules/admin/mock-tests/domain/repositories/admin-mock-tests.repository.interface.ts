import type { AdminActor, AdminListQuery, AdminPage } from '../../../shared/domain';
import type {
  AdminMockTest,
  AdminMockTestDetail,
  AdminMockTestIssueUpdateInput,
  AdminMockTestLifecycleInput,
  AdminMockTestLifecycleResult,
  AdminMockTestQuestionIssue,
} from '../entities/admin-mock-test.entity';
export interface IAdminMockTestsRepository {
  list(query: AdminListQuery): Promise<AdminPage<AdminMockTest>>;
  getDetail(id: string): Promise<AdminMockTestDetail | null>;
  listQuestionIssues(query: AdminListQuery): Promise<AdminPage<AdminMockTestQuestionIssue>>;
  updateQuestionIssue(
    id: string,
    input: AdminMockTestIssueUpdateInput,
    actor: AdminActor
  ): Promise<AdminMockTestQuestionIssue | null>;
  updateLifecycle(
    id: string,
    input: AdminMockTestLifecycleInput,
    actor: AdminActor
  ): Promise<AdminMockTestLifecycleResult | null>;
}
