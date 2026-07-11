import type { UserEntity } from '../entities/user.entity'

export type UpdateUserFullNameInput = {
  userId: string
  fullName: string
}

export interface IUserRepository {
  findById(userId: string): Promise<UserEntity | null>

  findByUsername(username: string): Promise<UserEntity | null>

  updateFullName(
    input: UpdateUserFullNameInput
  ): Promise<UserEntity | null>
}