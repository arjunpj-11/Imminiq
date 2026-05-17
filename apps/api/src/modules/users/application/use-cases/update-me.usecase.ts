import { ApiError } from '../../../../shared/utils/ApiError'
import type { UsersRepository } from '../../domain/repositories/users.repository.interface'
import type {
  ProfileRecord,
  UpdateMyProfileInput,
  UserRecord,
} from '../../domain/types/users.types'
import {
  cleanTags,
  mapProfile,
  mapUser,
  toIdString,
} from '../utils/users-view-mappers'

export class UpdateMeUseCase {
  constructor(
    private readonly usersRepository: UsersRepository
  ) {}

  async execute(userId: string, payload: UpdateMyProfileInput) {
    const user =
      (await this.usersRepository.findUserById(userId)) as UserRecord | null

    if (!user) {
      throw new ApiError(404, 'User not found')
    }

    const normalizedPayload: UpdateMyProfileInput = {
      ...payload,
      fullName: payload.fullName?.trim(),
      skills: cleanTags(payload.skills),
      interests: cleanTags(payload.interests),
    }

    const updatedProfile =
      (await this.usersRepository.updateProfileByUserId(
        toIdString(user._id),
        normalizedPayload
      )) as ProfileRecord | null

    if (!updatedProfile) {
      throw new ApiError(500, 'Profile update failed')
    }

    let resolvedUser: UserRecord = user

    if (
      normalizedPayload.fullName &&
      normalizedPayload.fullName !== user.fullName
    ) {
      const updatedUser =
        (await this.usersRepository.updateUserFullName(
          toIdString(user._id),
          normalizedPayload.fullName
        )) as UserRecord | null

      if (!updatedUser) {
        throw new ApiError(500, 'User full name update failed')
      }

      resolvedUser = updatedUser
    }

    return {
      user: mapUser(resolvedUser),
      profile: mapProfile(updatedProfile, toIdString(user._id)),
    }
  }
}
