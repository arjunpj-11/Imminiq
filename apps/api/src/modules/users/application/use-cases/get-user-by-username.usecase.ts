import { ApiError } from '../../../../shared/utils/ApiError'
import type { UsersRepository } from '../../domain/repositories/users.repository.interface'
import type { UserRecord } from '../../domain/types/users.types'
import { mapUser } from '../utils/users-view-mappers'

export class GetUserByUsernameUseCase {
  constructor(
    private readonly usersRepository: UsersRepository
  ) {}

  async execute(username: string) {
    const user =
      (await this.usersRepository.findUserByUsername(
        username
      )) as UserRecord | null

    if (!user) {
      throw new ApiError(404, 'User not found')
    }

    return mapUser(user)
  }
}
