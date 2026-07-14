import type {
  IAdminUsersRepository,
  ListAdminUsersInput,
} from '../../domain/repositories/admin-users.repository.interface';
import type { AdminUsersListDTO } from '../admin-users.dto';
import type { IAdminUsersMapper } from '../admin-users.mapper';

export interface IListAdminUsersUseCase {
  execute(input: ListAdminUsersInput): Promise<AdminUsersListDTO>;
}
export class ListAdminUsersUseCase implements IListAdminUsersUseCase {
  constructor(
    private readonly _repository: IAdminUsersRepository,
    private readonly _mapper: IAdminUsersMapper
  ) {}
  async execute(input: ListAdminUsersInput) {
    return this._mapper.toListDTO(await this._repository.list(input));
  }
}
