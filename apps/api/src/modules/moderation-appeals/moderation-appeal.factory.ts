import {
  ModerationAppealMapper,
  type ModerationAppealMapperContract,
} from './application/mappers/moderation-appeal.mapper'
import {
  ModerationAppealSubmissionPolicyService,
  type ModerationAppealSubmissionPolicyContract,
} from './application/policies/moderation-appeal-submission-policy.policy'
import {
  ModerationAppealCaseIdService,
  type ModerationAppealCaseIdServiceContract,
} from './application/services/moderation-appeal-case-id.service'
import { GetActiveModerationAppealStatusUseCase } from './application/use-cases/get-active-moderation-appeal-status.usecase'
import { SubmitModerationAppealUseCase } from './application/use-cases/submit-moderation-appeal.usecase'
import { mongoModerationAppealRepository } from './infrastructure/repositories/mongo-moderation-appeal.repository'
import { cryptoModerationAppealCaseIdGeneratorService } from './infrastructure/services/crypto-moderation-appeal-case-id-generator.service'

export type ModerationAppealUseCases = {
  submitModerationAppeal: SubmitModerationAppealUseCase
  getActiveModerationAppealStatus: GetActiveModerationAppealStatusUseCase
}

export type ModerationAppealServiceHelpers = {
  moderationAppealMapper: ModerationAppealMapperContract
  moderationAppealSubmissionPolicy: ModerationAppealSubmissionPolicyContract
  moderationAppealCaseIdService: ModerationAppealCaseIdServiceContract
}

export type ModerationAppealComposition = {
  useCases: ModerationAppealUseCases
  helpers: ModerationAppealServiceHelpers
}

export const createModerationAppealComposition =
  (): ModerationAppealComposition => {
    const moderationAppealRepository = mongoModerationAppealRepository

    const moderationAppealMapper = new ModerationAppealMapper()

    const moderationAppealSubmissionPolicy =
      new ModerationAppealSubmissionPolicyService()

    const moderationAppealCaseIdGenerator =
      cryptoModerationAppealCaseIdGeneratorService

    const moderationAppealCaseIdService =
      new ModerationAppealCaseIdService(
        moderationAppealRepository,
        moderationAppealCaseIdGenerator
      )

    return {
      useCases: {
        submitModerationAppeal: new SubmitModerationAppealUseCase(
          moderationAppealRepository,
          moderationAppealCaseIdService,
          moderationAppealSubmissionPolicy,
          moderationAppealMapper
        ),

        getActiveModerationAppealStatus:
          new GetActiveModerationAppealStatusUseCase(
            moderationAppealRepository,
            moderationAppealMapper
          ),
      },

      helpers: {
        moderationAppealMapper,
        moderationAppealSubmissionPolicy,
        moderationAppealCaseIdService,
      },
    }
  }