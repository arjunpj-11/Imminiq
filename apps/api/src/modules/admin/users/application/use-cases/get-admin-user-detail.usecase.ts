import type { IAdminUsersRepository } from '../../domain/repositories/admin-users.repository.interface';
import { AdminUsersDomainError } from '../../domain/admin-users-domain.error';
import type { AdminUserDetailDTO } from '../admin-users.dto';
import type { IAdminUsersMapper } from '../admin-users.mapper';
import { AdminUsersApplicationError } from '../admin-users-application.error';

export interface IGetAdminUserDetailUseCase {
  execute(userId: string): Promise<AdminUserDetailDTO>;
}
export class GetAdminUserDetailUseCase implements IGetAdminUserDetailUseCase {
  constructor(
    private readonly _repository: IAdminUsersRepository,
    private readonly _mapper: IAdminUsersMapper
  ) {}
  async execute(userId: string) {
    if (!/^[a-f\d]{24}$/i.test(userId))
      throw new AdminUsersDomainError('INVALID_USER_ID', 'Invalid user ID');
    const detail = await this._repository.findDetailById(userId);
    if (!detail) throw AdminUsersApplicationError.userNotFound();
    return this._mapper.toDetailDTO(detail);
  }
}
