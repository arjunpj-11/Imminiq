import type { UserProfileRepositoryContract } from '../../domain/repositories/user-profile.repository.interface'
import type { UserRepositoryContract } from '../../domain/repositories/user.repository.interface'
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
    const updatedProfile = await this.usersRepository.updateByUserId(
      user.id,
      normalizedPayload,
    )

    if (!updatedProfile) {
      throw UsersApplicationError.profileUpdateFailed()
    }

    let resolvedUser = user

    if (
      normalizedPayload.fullName &&
      normalizedPayload.fullName !== user.fullName
    ) {
      const updatedUser = await this.usersRepository.updateFullName(
        user.id,
        normalizedPayload.fullName,
      )

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

  private normalizePayload(
    payload: UpdateMyProfileInput,
  ): UpdateMyProfileInput {
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
