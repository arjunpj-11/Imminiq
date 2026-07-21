import type { IAdminMockTestsRepository } from '../../domain/repositories/admin-mock-tests.repository.interface';
import { AdminMockTestsApplicationError } from '../admin-mock-tests-application.error';
import type { AdminMockTestDetailDTO } from '../admin-mock-tests.dto';
import type { IAdminMockTestsMapper } from '../admin-mock-tests.mapper';

export interface IGetAdminMockTestDetailUseCase {
  execute(id: string): Promise<AdminMockTestDetailDTO>;
}

export class GetAdminMockTestDetailUseCase implements IGetAdminMockTestDetailUseCase {
  constructor(
    private readonly _repository: Pick<IAdminMockTestsRepository, 'getDetail'>,
    private readonly _mapper: IAdminMockTestsMapper
  ) {}

  async execute(id: string): Promise<AdminMockTestDetailDTO> {
    const test = await this._repository.getDetail(id);
    if (!test) throw AdminMockTestsApplicationError.notFound();
    return this._mapper.toDetailDTO(test);
  }
}
