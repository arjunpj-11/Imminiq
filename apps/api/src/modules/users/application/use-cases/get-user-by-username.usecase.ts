import type { UserRepositoryContract } from '../../domain/repositories/user.repository.interface'
import { UsersApplicationError } from '../errors/users-application.error'
import type { UsersMapperContract } from '../mappers/users.mapper'

export class GetUserByUsernameUseCase {
  constructor(
    private readonly usersRepository: UserRepositoryContract,
    private readonly usersMapper: UsersMapperContract,
  ) {}

  async execute(username: string) {
    const user = await this.usersRepository.findByUsername(username)

    if (!user) {
      throw UsersApplicationError.userNotFound()
    }

    return this.usersMapper.toUserView(user)
  }
}
