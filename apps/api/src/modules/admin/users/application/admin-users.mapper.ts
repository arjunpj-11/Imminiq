import type { AdminUserDetailEntity, AdminUserEntity } from '../domain/entities/admin-user.entity';
import type { AdminUsersListResult } from '../domain/repositories/admin-users.repository.interface';
import type { AdminUserDTO, AdminUserDetailDTO, AdminUsersListDTO } from './admin-users.dto';

export interface IAdminUsersMapper {
  toUserDTO(user: AdminUserEntity): AdminUserDTO;
  toListDTO(result: AdminUsersListResult): AdminUsersListDTO;
  toDetailDTO(detail: AdminUserDetailEntity): AdminUserDetailDTO;
}

export class AdminUsersMapper implements IAdminUsersMapper {
  toUserDTO(user: AdminUserEntity): AdminUserDTO {
    const { id, ...rest } = user;
    return { _id: id, ...rest };
  }
  toListDTO(result: AdminUsersListResult): AdminUsersListDTO {
    return { ...result, users: result.users.map((user) => this.toUserDTO(user)) };
  }
  toDetailDTO(detail: AdminUserDetailEntity): AdminUserDetailDTO {
    return { ...detail, user: this.toUserDTO(detail.user) };
  }
}
