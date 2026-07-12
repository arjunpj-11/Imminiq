import type { IOnboardingResponseQueryRepository } from '../../domain/repositories/onboarding-response-query.repository.interface'
import type { IOnboardingStatusResultDTO } from '../dtos/onboarding.dto'
import type { IOnboardingMapper } from '../mappers/onboarding.mapper'

export interface IGetOnboardingStatusUseCase {
  execute(userId: string): Promise<IOnboardingStatusResultDTO>
}

export class GetOnboardingStatusUseCase implements IGetOnboardingStatusUseCase {
  constructor(
    private readonly _onboardingRepository: IOnboardingResponseQueryRepository,
    private readonly _onboardingMapper: IOnboardingMapper,
  ) {}

  async execute(userId: string): Promise<IOnboardingStatusResultDTO> {
    const response = await this._onboardingRepository.getStatus(userId)

    return this._onboardingMapper.toStatusDto(response)
  }
}
