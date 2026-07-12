import type { ISecurityTwoFactorRepository } from '../../domain/repositories/security-two-factor.repository.interface'
import type { ITwoFactorStatusResponseDTO } from '../dtos/security.dto'

export interface IGetTwoFactorStatusUseCase {
  execute(userId: string): Promise<ITwoFactorStatusResponseDTO>
}

export class GetTwoFactorStatusUseCase implements IGetTwoFactorStatusUseCase {
  constructor(
    private readonly _twoFactorRepository: ISecurityTwoFactorRepository,
  ) {}

  async execute(userId: string): Promise<ITwoFactorStatusResponseDTO> {
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
