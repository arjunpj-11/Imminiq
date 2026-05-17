import type {
  UserProfileRecordForUpload,
  UserRecordForUpload,
} from '../types/uploads.types'

export interface UsersProfileGateway {
  findUserById(
    userId: string
  ): Promise<UserRecordForUpload | null>

  ensureProfileForUser(
    userId: unknown,
    fullName: string
  ): Promise<UserProfileRecordForUpload>
}
