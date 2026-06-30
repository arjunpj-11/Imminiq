import { AuthApplicationError } from '../errors/auth-application.error'
import type { AuthUserRepositoryContract } from '../../domain/repositories/auth-user.repository.interface'
import type { AuthUser } from '../dtos/auth.dto'
import type { AuthUserMapperContract } from '../mappers/auth-user.mapper'
import type { AuthAccountPolicyContract } from '../policies/auth-account-policy.policy'

export class GetCurrentUserUseCase {
  constructor(
    private readonly _authRepository: AuthUserRepositoryContract,
    private readonly _authAccountPolicy: AuthAccountPolicyContract,
    private readonly _authUserMapper: AuthUserMapperContract
  ) {}

  async execute(userId: string): Promise<AuthUser> {
    const user = await this._authRepository.findById(userId)

    if (!user) {
      throw AuthApplicationError.notFound('User not found')
    }

    this._authAccountPolicy.ensureUserCanAuthenticate(user)

    return this._authUserMapper.toAuthUser(user)
  }
}
