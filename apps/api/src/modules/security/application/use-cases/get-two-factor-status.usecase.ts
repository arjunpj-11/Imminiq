import type { SecurityTwoFactorRepositoryContract } from '../../domain/repositories/security-two-factor.repository.interface'
import type { TwoFactorStatusResponseDto } from '../dtos/security.dto'

export class GetTwoFactorStatusUseCase {
  constructor(
    private readonly _twoFactorRepository: SecurityTwoFactorRepositoryContract,
  ) {}

  async execute(userId: string): Promise<TwoFactorStatusResponseDto> {
    const twoFactor =
      await this._twoFactorRepository.findTwoFactorByUserId(userId)

    if (!twoFactor) {
      return { enabled: false, status: 'not_configured' }
    }

    return {
      enabled: twoFactor.status === 'active',
      status: twoFactor.status,
    }
  }
}
