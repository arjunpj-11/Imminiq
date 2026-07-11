import type { UserProfileUploadEntity } from '../entities/user-profile-upload.entity'
import type { UserUploadEntity } from '../entities/user-upload.entity'

export interface UsersProfileContext {
  user: UserUploadEntity
  profile: UserProfileUploadEntity
}

export interface UsersProfileReaderContract {
  getMe(userId: string): Promise<UsersProfileContext>
}
