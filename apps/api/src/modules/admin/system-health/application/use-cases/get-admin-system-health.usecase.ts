import type { IAdminSystemHealthRepository } from '../../domain/repositories/admin-system-health.repository.interface';
import type { AdminSystemHealthDTO } from '../admin-system-health.dto';
import type { IAdminSystemHealthMapper } from '../admin-system-health.mapper';
export interface IGetAdminSystemHealthUseCase {
  execute(): Promise<AdminSystemHealthDTO>;
}
export class GetAdminSystemHealthUseCase implements IGetAdminSystemHealthUseCase {
  constructor(
    private readonly _repository: IAdminSystemHealthRepository,
    private readonly _mapper: IAdminSystemHealthMapper
  ) {}
  async execute(): Promise<AdminSystemHealthDTO> {
    return this._mapper.toDTO(await this._repository.inspect());
  }
}
