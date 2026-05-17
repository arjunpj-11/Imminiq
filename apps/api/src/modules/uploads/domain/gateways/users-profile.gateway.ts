import type { Types } from 'mongoose'
import type {
  UserProfileRecordForUpload,
  UserRecordForUpload,
} from '../types/uploads.types'

export interface UsersProfileGateway {
  findUserById(
    userId: string
  ): Promise<UserRecordForUpload | null>

  ensureProfileForUser(
    userId: string | Types.ObjectId,
    fullName: string
  ): Promise<UserProfileRecordForUpload>
}
