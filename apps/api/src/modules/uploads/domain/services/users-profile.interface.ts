import type { UserProfileUploadEntity } from '../entities/user-profile-upload.entity'
import type { UserUploadEntity } from '../entities/user-upload.entity'

export interface IUsersProfileContext {
  user: UserUploadEntity
  profile: UserProfileUploadEntity
}

export interface IUsersProfileReader {
  getMe(userId: string): Promise<IUsersProfileContext>
}
