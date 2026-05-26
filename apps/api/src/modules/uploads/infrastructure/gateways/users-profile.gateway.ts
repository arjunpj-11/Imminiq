import { usersRepository } from '../../../users/users.repository'
import type { UsersProfileServiceContract } from '../../domain/services/users-profile.service.interface'
import type {
  UserProfileRecordForUpload,
  UserRecordForUpload,
} from '../../domain/types/uploads.types'

export const usersProfileGateway: UsersProfileServiceContract = {
  async findUserById(
    userId: string
  ): Promise<UserRecordForUpload | null> {
    const user = await usersRepository.findUserById(userId)
    return user as UserRecordForUpload | null
  },

  async ensureProfileForUser(
    userId: string,
    fullName: string
  ): Promise<UserProfileRecordForUpload> {
    const profile = await usersRepository.ensureProfileForUser(
      userId,
      fullName
    )

    return profile as UserProfileRecordForUpload
  },
}
