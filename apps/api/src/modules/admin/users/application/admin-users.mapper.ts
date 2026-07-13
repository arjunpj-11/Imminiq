import type { AdminUserDetailEntity, AdminUserEntity } from '../domain/entities/admin-user.entity'
import type { AdminUsersListResult } from '../domain/repositories/admin-users.repository.interface'
import type { IAdminUserDTO, IAdminUserDetailDTO, IAdminUsersListDTO } from './admin-users.dto'

export interface IAdminUsersMapper {
  toUserDTO(user: AdminUserEntity): IAdminUserDTO
  toListDTO(result: AdminUsersListResult): IAdminUsersListDTO
  toDetailDTO(detail: AdminUserDetailEntity): IAdminUserDetailDTO
}

export class AdminUsersMapper implements IAdminUsersMapper {
  toUserDTO(user: AdminUserEntity): IAdminUserDTO {
    const { id, ...rest } = user
    return { _id: id, ...rest }
  }
  toListDTO(result: AdminUsersListResult): IAdminUsersListDTO {
    return { ...result, users: result.users.map((user) => this.toUserDTO(user)) }
  }
  toDetailDTO(detail: AdminUserDetailEntity): IAdminUserDetailDTO {
    return { ...detail, user: this.toUserDTO(detail.user) }
  }
}
