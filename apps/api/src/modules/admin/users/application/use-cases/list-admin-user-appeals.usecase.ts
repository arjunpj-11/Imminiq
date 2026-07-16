import type {
  IAdminUsersRepository,
  ListAdminUserAppealsInput,
} from '../../domain/repositories/admin-users.repository.interface';
import type { AdminUserAppealsListDTO } from '../admin-users.dto';

export interface IListAdminUserAppealsUseCase {
  execute(input: ListAdminUserAppealsInput): Promise<AdminUserAppealsListDTO>;
}

export class ListAdminUserAppealsUseCase implements IListAdminUserAppealsUseCase {
  constructor(private readonly _repository: IAdminUsersRepository) {}

  execute(input: ListAdminUserAppealsInput) {
    return this._repository.listAppeals(input);
  }
}
