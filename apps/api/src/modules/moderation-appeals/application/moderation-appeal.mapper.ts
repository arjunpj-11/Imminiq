import type { ModerationAppealEntity } from '../domain/entities/moderation-appeal.entity'
import type {
  IGetActiveModerationAppealStatusResultDTO,
  IModerationAppealStatusDTO,
  ISubmitModerationAppealResultDTO,
} from './moderation-appeal.dto'

export interface IModerationAppealMapper {
  toSubmitResult(
    appeal: ModerationAppealEntity,
  ): ISubmitModerationAppealResultDTO

  toStatusDto(appeal: ModerationAppealEntity): IModerationAppealStatusDTO

  toActiveStatusResult(
    appeal: ModerationAppealEntity | null,
  ): IGetActiveModerationAppealStatusResultDTO
}

export class ModerationAppealMapper implements IModerationAppealMapper {
  toSubmitResult(
    appeal: ModerationAppealEntity,
  ): ISubmitModerationAppealResultDTO {
    return {
      caseId: appeal.caseId,
      status: appeal.status,
      submittedAt: appeal.createdAt,
    }
  }

  toStatusDto(appeal: ModerationAppealEntity): IModerationAppealStatusDTO {
    return {
      caseId: appeal.caseId,
      status: appeal.status,
      submittedAt: appeal.createdAt,
    }
  }

  toActiveStatusResult(
    appeal: ModerationAppealEntity | null,
  ): IGetActiveModerationAppealStatusResultDTO {
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
