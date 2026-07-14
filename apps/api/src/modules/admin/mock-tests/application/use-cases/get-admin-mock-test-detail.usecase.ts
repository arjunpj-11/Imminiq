import type { AdminMockTestDetail } from '../../domain/entities/admin-mock-test.entity';
import type { IAdminMockTestsRepository } from '../../domain/repositories/admin-mock-tests.repository.interface';
import { AdminMockTestsApplicationError } from '../admin-mock-tests-application.error';

export interface IGetAdminMockTestDetailUseCase {
  execute(id: string): Promise<AdminMockTestDetail>;
}

export class GetAdminMockTestDetailUseCase implements IGetAdminMockTestDetailUseCase {
  constructor(private readonly repository: IAdminMockTestsRepository) {}

  async execute(id: string): Promise<AdminMockTestDetail> {
    const test = await this.repository.getDetail(id);
    if (!test) throw AdminMockTestsApplicationError.notFound();
    return test;
  }
}
