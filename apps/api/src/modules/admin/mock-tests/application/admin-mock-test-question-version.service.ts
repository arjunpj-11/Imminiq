import type { AdminActor } from '../../../../shared/admin';
import type { IAdminMockTestsRepository } from '../domain/repositories/admin-mock-tests.repository.interface';
import { AdminMockTestsApplicationError } from './admin-mock-tests-application.error';

export interface IAdminMockTestQuestionVersionService {
  list(questionId: string): ReturnType<IAdminMockTestsRepository['listQuestionVersions']>;
  restore(
    questionId: string,
    version: number,
    reason: string,
    actor: AdminActor
  ): Promise<{ questionId: string; version: number }>;
}

export class AdminMockTestQuestionVersionService
  implements IAdminMockTestQuestionVersionService
{
  constructor(private readonly repository: IAdminMockTestsRepository) {}

  list(questionId: string) {
    return this.repository.listQuestionVersions(questionId);
  }

  async restore(questionId: string, version: number, reason: string, actor: AdminActor) {
    const result = await this.repository.restoreQuestionVersion(questionId, version, reason, actor);
    if (!result) throw AdminMockTestsApplicationError.issueNotFound();
    return result;
  }
}
