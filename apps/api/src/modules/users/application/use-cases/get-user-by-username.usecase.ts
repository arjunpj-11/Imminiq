import type { IUserRepository } from '../../domain/repositories/user.repository.interface'
import { UsersApplicationError } from '../errors/users-application.error'
import type { IUsersMapper } from '../mappers/users.mapper'

export class GetUserByUsernameUseCase {
  constructor(
    private readonly _usersRepository: IUserRepository,
    private readonly _usersMapper: IUsersMapper,
  ) {}

  async execute(username: string) {
    const user = await this._usersRepository.findByUsername(username)

    if (!user) {
      throw UsersApplicationError.userNotFound()
    }

    return this._usersMapper.toUserView(user)
  }
}
