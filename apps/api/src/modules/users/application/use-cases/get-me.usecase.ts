import type { UserProfileRepositoryContract } from '../../domain/repositories/user-profile.repository.interface'
import type { UserRepositoryContract } from '../../domain/repositories/user.repository.interface'
import { UsersApplicationError } from '../errors/users-application.error'
import type { UsersMapperContract } from '../mappers/users.mapper'

type GetMeRepository = UserRepositoryContract & UserProfileRepositoryContract

export class GetMeUseCase {
  constructor(
    private readonly _usersRepository: GetMeRepository,
    private readonly _usersMapper: UsersMapperContract,
  ) {}

  async execute(userId: string) {
    const user = await this._usersRepository.findById(userId)

    if (!user) {
      throw UsersApplicationError.userNotFound()
    }

    const profile = await this._usersRepository.ensureForUser({
      userId: user.id,
    })

    return {
      user: this._usersMapper.toUserView(user),
      profile: this._usersMapper.toProfileView(profile),
    }
  }
}