import {
  ModerationAppealMapper,
  type IModerationAppealMapper,
} from './application/mappers/moderation-appeal.mapper'
import {
  ModerationAppealSubmissionPolicy,
  type IModerationAppealSubmissionPolicy,
} from './application/policies/moderation-appeal-submission-policy.policy'
import {
  ModerationAppealCaseIdAllocator,
  type IModerationAppealCaseIdAllocator,
} from './application/services/moderation-appeal-case-id.service'
import { GetActiveModerationAppealStatusUseCase } from './application/use-cases/get-active-moderation-appeal-status.usecase'
import { SubmitModerationAppealUseCase } from './application/use-cases/submit-moderation-appeal.usecase'
import { mongoModerationAppealRepository } from './infrastructure/repositories/mongo-moderation-appeal.repository'
import { cryptoModerationAppealCaseIdGenerator } from './infrastructure/services/crypto-moderation-appeal-case-id-generator.service'

export type ModerationAppealUseCases = {
  submitModerationAppeal: SubmitModerationAppealUseCase
  getActiveModerationAppealStatus: GetActiveModerationAppealStatusUseCase
}

export type ModerationAppealServiceHelpers = {
  moderationAppealMapper: IModerationAppealMapper
  moderationAppealSubmissionPolicy: IModerationAppealSubmissionPolicy
  caseIdAllocator: IModerationAppealCaseIdAllocator
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
      new ModerationAppealSubmissionPolicy()

    const moderationAppealCaseIdGenerator =
      cryptoModerationAppealCaseIdGenerator

    const caseIdAllocator =
      new ModerationAppealCaseIdAllocator(
        moderationAppealRepository,
        moderationAppealCaseIdGenerator
      )

    return {
      useCases: {
        submitModerationAppeal: new SubmitModerationAppealUseCase(
          moderationAppealRepository,
          caseIdAllocator,
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
        caseIdAllocator,
      },
    }
  }
