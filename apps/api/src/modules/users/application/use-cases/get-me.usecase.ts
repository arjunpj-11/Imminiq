import type { UserProfileRepositoryContract } from '../../domain/repositories/user-profile.repository.interface'
import type { UserRepositoryContract } from '../../domain/repositories/user.repository.interface'
import { UsersApplicationError } from '../errors/users-application.error'
import type { UsersMapperContract } from '../mappers/users.mapper'

type GetMeRepository = UserRepositoryContract & UserProfileRepositoryContract

export class GetMeUseCase {
  constructor(
    private readonly usersRepository: GetMeRepository,
    private readonly usersMapper: UsersMapperContract,
  ) {}

  async execute(userId: string) {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      throw UsersApplicationError.userNotFound()
    }

    const profile = await this.usersRepository.ensureForUser({
      userId: user.id,
    })

    return {
      user: this.usersMapper.toUserView(user),
      profile: this.usersMapper.toProfileView(profile),
    }
  }
}