import type { SecurityRepository } from '../../domain/repositories/security.repository.interface'
import type { TwoFactorStatusResponse } from '../../domain/types/security.types'

export class GetTwoFactorStatusUseCase {
  constructor(
    private readonly securityRepository: SecurityRepository
  ) {}

  async execute(
    userId: string
  ): Promise<TwoFactorStatusResponse> {
    const twoFactor = await this.securityRepository.findTwoFactorByUserId(
      userId
    )

    if (!twoFactor) {
      return {
        enabled: false,
        status: 'not_configured',
      }
    }

    return {
      enabled: twoFactor.status === 'active',
      status: twoFactor.status as TwoFactorStatusResponse['status'],
    }
  }
}
