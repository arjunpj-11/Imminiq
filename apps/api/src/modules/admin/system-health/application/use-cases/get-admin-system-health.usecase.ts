import type { IAdminSystemHealthRepository } from '../../domain/repositories/admin-system-health.repository.interface';
import type { AdminSystemHealthDTO } from '../admin-system-health.dto';
import type { IAdminSystemHealthMapper } from '../admin-system-health.mapper';
export interface IGetAdminSystemHealthUseCase {
  execute(): Promise<AdminSystemHealthDTO>;
}
export class GetAdminSystemHealthUseCase implements IGetAdminSystemHealthUseCase {
  constructor(
    private readonly repository: IAdminSystemHealthRepository,
    private readonly mapper: IAdminSystemHealthMapper
  ) {}
  async execute(): Promise<AdminSystemHealthDTO> {
    return this.mapper.toDTO(await this.repository.inspect());
  }
}
