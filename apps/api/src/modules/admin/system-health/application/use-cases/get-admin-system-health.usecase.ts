import type { AdminSystemHealth } from '../../domain/admin-system-health.entity';
import type { IAdminSystemHealthRepository } from '../../domain/repositories/admin-system-health.repository.interface';
export interface IGetAdminSystemHealthUseCase {
  execute(): Promise<AdminSystemHealth>;
}
export class GetAdminSystemHealthUseCase implements IGetAdminSystemHealthUseCase {
  constructor(private readonly repository: IAdminSystemHealthRepository) {}
  execute() {
    return this.repository.inspect();
  }
}
