import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { UsersApplicationError } from '../users-application.error';
import type { CurrentUserViewDTO } from '../users.dto';
import type { IUsersMapper } from '../users.mapper';

export interface IGetUserByUsernameUseCase {
  execute(username: string): Promise<CurrentUserViewDTO>;
}

export class GetUserByUsernameUseCase implements IGetUserByUsernameUseCase {
  constructor(
    private readonly _usersRepository: IUserRepository,
    private readonly _usersMapper: IUsersMapper
  ) {}

  async execute(username: string) {
    const user = await this._usersRepository.findByUsername(username);

    if (!user) {
      throw UsersApplicationError.userNotFound();
    }

    return this._usersMapper.toUserView(user);
  }
}
