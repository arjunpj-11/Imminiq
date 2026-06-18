import { ModerationAppealMapper } from './application/mappers/moderation-appeal.mapper'
import { ModerationAppealSubmissionPolicyService } from './application/policies/moderation-appeal-submission-policy.policy'
import { ModerationAppealCaseIdService } from './application/services/moderation-appeal-case-id.service'
import { GetActiveModerationAppealStatusUseCase } from './application/use-cases/get-active-moderation-appeal-status.usecase'
import { SubmitModerationAppealUseCase } from './application/use-cases/submit-moderation-appeal.usecase'
import { mongoModerationAppealRepository } from './infrastructure/repositories/mongo-moderation-appeal.repository'
import { cryptoModerationAppealCaseIdGeneratorService } from './infrastructure/services/crypto-moderation-appeal-case-id-generator.service'
import type {
  GetActiveModerationAppealStatusResultDto,
  GetModerationAppealStatusPayload,
  SubmitModerationAppealPayload,
  SubmitModerationAppealResultDto,
} from './application/dtos/moderation-appeal.dto'
import type { ModerationAppealMapperContract } from './application/mappers/moderation-appeal.mapper'
import type { ModerationAppealSubmissionPolicyContract } from './application/policies/moderation-appeal-submission-policy.policy'
import type { ModerationAppealCaseIdServiceContract } from './application/services/moderation-appeal-case-id.service'
import type { ModerationAppealRepositoryContract } from './domain/repositories/moderation-appeal.repository.interface'
import type { ModerationAppealCaseIdGeneratorContract } from './domain/services/case-id-generator.service.interface'

export class ModerationAppealService {
  private readonly submitModerationAppealUseCase: SubmitModerationAppealUseCase
  private readonly getActiveModerationAppealStatusUseCase: GetActiveModerationAppealStatusUseCase

  constructor(
    private readonly moderationAppealRepository: ModerationAppealRepositoryContract,
    private readonly moderationAppealMapper: ModerationAppealMapperContract,
    private readonly moderationAppealSubmissionPolicy: ModerationAppealSubmissionPolicyContract,
    private readonly moderationAppealCaseIdService: ModerationAppealCaseIdServiceContract,
  ) {
    this.submitModerationAppealUseCase = new SubmitModerationAppealUseCase(
      this.moderationAppealRepository,
      this.moderationAppealCaseIdService,
      this.moderationAppealSubmissionPolicy,
      this.moderationAppealMapper,
    )

    this.getActiveModerationAppealStatusUseCase =
      new GetActiveModerationAppealStatusUseCase(
        this.moderationAppealRepository,
        this.moderationAppealMapper,
      )
  }

  submitAppeal(
    payload: SubmitModerationAppealPayload,
  ): Promise<SubmitModerationAppealResultDto> {
    return this.submitModerationAppealUseCase.execute(payload)
  }

  getActiveAppealStatus(
    payload: GetModerationAppealStatusPayload,
  ): Promise<GetActiveModerationAppealStatusResultDto> {
    return this.getActiveModerationAppealStatusUseCase.execute(payload)
  }
}

// ─── Instantiate all singletons ──────────────────────────────

const moderationAppealRepository: ModerationAppealRepositoryContract =
  mongoModerationAppealRepository

const moderationAppealCaseIdGenerator: ModerationAppealCaseIdGeneratorContract =
  cryptoModerationAppealCaseIdGeneratorService

const moderationAppealMapper: ModerationAppealMapperContract =
  new ModerationAppealMapper()

const moderationAppealSubmissionPolicy: ModerationAppealSubmissionPolicyContract =
  new ModerationAppealSubmissionPolicyService()

const moderationAppealCaseIdService: ModerationAppealCaseIdServiceContract =
  new ModerationAppealCaseIdService(
    moderationAppealRepository,
    moderationAppealCaseIdGenerator,
  )

// ─── Service singleton ────────────────────────────────────────

export const moderationAppealService = new ModerationAppealService(
  moderationAppealRepository,
  moderationAppealMapper,
  moderationAppealSubmissionPolicy,
  moderationAppealCaseIdService,
)
