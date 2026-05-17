import { ApiError } from '../../../../shared/utils/ApiError'
import type { UsersRepository } from '../../domain/repositories/users.repository.interface'
import type {
  ProfileRecord,
  UserRecord,
} from '../../domain/types/users.types'
import {
  mapProfile,
  mapUser,
  toIdString,
} from '../utils/users-view-mappers'

export class GetMeUseCase {
  constructor(
    private readonly usersRepository: UsersRepository
  ) {}

  async execute(userId: string) {
    const user =
      (await this.usersRepository.findUserById(userId)) as UserRecord | null

    if (!user) {
      throw new ApiError(404, 'User not found')
    }

    const profile =
      (await this.usersRepository.ensureProfileForUser(
        toIdString(user._id),
        user.fullName ?? ''
      )) as ProfileRecord

    return {
      user: mapUser(user),
      profile: mapProfile(profile, toIdString(user._id)),
    }
  }
}
