import type { UserProfileRepositoryContract } from '../../domain/repositories/user-profile.repository.interface'
import type { UserRepositoryContract } from '../../domain/repositories/user.repository.interface'
import type { UserProfileUpdate } from '../../domain/value-objects/user-profile-update.vo'
import type { UpdateMyProfileInput } from '../dtos/users.dto'
import { UsersApplicationError } from '../errors/users-application.error'
import type { UsersMapperContract } from '../mappers/users.mapper'

type UpdateMeRepository = UserRepositoryContract & UserProfileRepositoryContract

export class UpdateMeUseCase {
  constructor(
    private readonly usersRepository: UpdateMeRepository,
    private readonly usersMapper: UsersMapperContract,
  ) {}

  async execute(userId: string, payload: UpdateMyProfileInput) {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      throw UsersApplicationError.userNotFound()
    }

    const normalizedPayload = this.normalizePayload(payload)
    const { fullName, ...profilePayload } = normalizedPayload

    const hasProfileUpdates = Object.keys(profilePayload).length > 0

    const updatedProfile = hasProfileUpdates
      ? await this.usersRepository.updateByUserId({
          userId: user.id,
          payload: profilePayload as UserProfileUpdate,
        })
      : await this.usersRepository.ensureForUser({
          userId: user.id,
        })

    if (!updatedProfile) {
      throw UsersApplicationError.profileUpdateFailed()
    }

    let resolvedUser = user

    if (fullName && fullName !== user.fullName) {
      const updatedUser = await this.usersRepository.updateFullName({
        userId: user.id,
        fullName,
      })

      if (!updatedUser) {
        throw UsersApplicationError.userNameUpdateFailed()
      }

      resolvedUser = updatedUser
    }

    return {
      user: this.usersMapper.toUserView(resolvedUser),
      profile: this.usersMapper.toProfileView(updatedProfile),
    }
  }

  private normalizePayload(payload: UpdateMyProfileInput): UpdateMyProfileInput {
    return {
      ...payload,
      ...(payload.fullName !== undefined
        ? { fullName: payload.fullName.trim() }
        : {}),
      ...(payload.skills !== undefined
        ? { skills: this.cleanTags(payload.skills) }
        : {}),
      ...(payload.interests !== undefined
        ? { interests: this.cleanTags(payload.interests) }
        : {}),
    }
  }

  private cleanTags(tags: string[]): string[] {
    return [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))]
  }
}