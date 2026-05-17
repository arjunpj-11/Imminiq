import type { Types } from 'mongoose'
import { usersRepository } from '../../../users/users.repository'
import type { UsersProfileGateway } from '../../domain/gateways/users-profile.gateway'
import type {
  UserProfileRecordForUpload,
  UserRecordForUpload,
} from '../../domain/types/uploads.types'

export const usersProfileGateway: UsersProfileGateway = {
  async findUserById(
    userId: string
  ): Promise<UserRecordForUpload | null> {
    const user = await usersRepository.findUserById(userId)
    return user as UserRecordForUpload | null
  },

  async ensureProfileForUser(
    userId: string | Types.ObjectId,
    fullName: string
  ): Promise<UserProfileRecordForUpload> {
    const profile = await usersRepository.ensureProfileForUser(
      userId,
      fullName
    )

    return profile as UserProfileRecordForUpload
  },
}
