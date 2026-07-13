import type { AdminUsersUseCases } from './application/admin-users-use-cases.contract'
import { AdminUsersMapper } from './application/admin-users.mapper'
import { GetAdminUserDetailUseCase } from './application/use-cases/get-admin-user-detail.usecase'
import { ListAdminUsersUseCase } from './application/use-cases/list-admin-users.usecase'
import { SetAdminUserStatusUseCase } from './application/use-cases/set-admin-user-status.usecase'
import { mongoAdminUsersRepository } from './infrastructure/repositories/mongo-admin-users.repository'

export type AdminUsersComposition = { useCases: AdminUsersUseCases }
export const createAdminUsersComposition = (): AdminUsersComposition => {
  const mapper = new AdminUsersMapper()
  return { useCases: {
    list: new ListAdminUsersUseCase(mongoAdminUsersRepository, mapper),
    getDetail: new GetAdminUserDetailUseCase(mongoAdminUsersRepository, mapper),
    setStatus: new SetAdminUserStatusUseCase(mongoAdminUsersRepository),
  } }
}
