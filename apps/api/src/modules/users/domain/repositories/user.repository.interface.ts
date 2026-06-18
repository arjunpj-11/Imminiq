import type { UserEntity } from '../entities/user.entity'

export interface UserRepositoryContract {
  findById(userId: string): Promise<UserEntity | null>
  findByUsername(username: string): Promise<UserEntity | null>
  updateFullName(userId: string, fullName: string): Promise<UserEntity | null>
}
