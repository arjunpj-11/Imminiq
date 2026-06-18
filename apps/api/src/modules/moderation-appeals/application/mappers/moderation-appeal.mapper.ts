import type { ModerationAppealEntity } from '../../domain/entities/moderation-appeal.entity'
import type {
  GetActiveModerationAppealStatusResultDto,
  ModerationAppealStatusDto,
  SubmitModerationAppealResultDto,
} from '../dtos/moderation-appeal.dto'

export interface ModerationAppealMapperContract {
  toSubmitResult(
    appeal: ModerationAppealEntity,
  ): SubmitModerationAppealResultDto

  toStatusDto(appeal: ModerationAppealEntity): ModerationAppealStatusDto

  toActiveStatusResult(
    appeal: ModerationAppealEntity | null,
  ): GetActiveModerationAppealStatusResultDto
}

export class ModerationAppealMapper implements ModerationAppealMapperContract {
  toSubmitResult(
    appeal: ModerationAppealEntity,
  ): SubmitModerationAppealResultDto {
    return {
      caseId: appeal.caseId,
      status: appeal.status,
      submittedAt: appeal.createdAt,
    }
  }

  toStatusDto(appeal: ModerationAppealEntity): ModerationAppealStatusDto {
    return {
      caseId: appeal.caseId,
      status: appeal.status,
      submittedAt: appeal.createdAt,
      appealReason: appeal.appealReason,
    }
  }

  toActiveStatusResult(
    appeal: ModerationAppealEntity | null,
  ): GetActiveModerationAppealStatusResultDto {
    if (!appeal) {
      return {
        exists: false,
        appeal: null,
      }
    }

    return {
      exists: true,
      appeal: this.toStatusDto(appeal),
    }
  }
}
