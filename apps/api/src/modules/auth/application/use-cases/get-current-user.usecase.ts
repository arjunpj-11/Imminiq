import { AuthApplicationError } from '../errors/auth-application.error'
import type { AuthUserRepositoryContract } from '../../domain/repositories/auth-user.repository.interface'
import type { AuthUser } from '../dtos/auth.dto'
import type { AuthUserMapperContract } from '../mappers/auth-user.mapper'
import type { AuthAccountPolicyContract } from '../policies/auth-account-policy.policy'

export class GetCurrentUserUseCase {
  constructor(
    private readonly authRepository: AuthUserRepositoryContract,
    private readonly authAccountPolicy: AuthAccountPolicyContract,
    private readonly authUserMapper: AuthUserMapperContract
  ) {}

  async execute(userId: string): Promise<AuthUser> {
    const user = await this.authRepository.findById(userId)

    if (!user) {
      throw AuthApplicationError.notFound('User not found')
    }

    this.authAccountPolicy.ensureUserCanAuthenticate(user)

    return this.authUserMapper.toAuthUser(user)
  }
}
