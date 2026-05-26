import type {
  UserProfileRecordForUpload,
  UserRecordForUpload,
} from '../types/uploads.types'

export interface UsersProfileServiceContract {
  findUserById(
    userId: string
  ): Promise<UserRecordForUpload | null>

  ensureProfileForUser(
    userId: string,
    fullName: string
  ): Promise<UserProfileRecordForUpload>
}
