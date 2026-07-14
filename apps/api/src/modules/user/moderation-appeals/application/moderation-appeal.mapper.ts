import type { ModerationAppealEntity } from '../domain/entities/moderation-appeal.entity';
import type {
  GetActiveModerationAppealStatusResultDTO,
  ModerationAppealStatusDTO,
  SubmitModerationAppealResultDTO,
} from './moderation-appeal.dto';

export interface IModerationAppealMapper {
  toSubmitResult(appeal: ModerationAppealEntity): SubmitModerationAppealResultDTO;

  toStatusDto(appeal: ModerationAppealEntity): ModerationAppealStatusDTO;

  toActiveStatusResult(
    appeal: ModerationAppealEntity | null
  ): GetActiveModerationAppealStatusResultDTO;
}

export class ModerationAppealMapper implements IModerationAppealMapper {
  toSubmitResult(appeal: ModerationAppealEntity): SubmitModerationAppealResultDTO {
    return {
      caseId: appeal.caseId,
      status: appeal.status,
      submittedAt: appeal.createdAt,
    };
  }

  toStatusDto(appeal: ModerationAppealEntity): ModerationAppealStatusDTO {
    return {
      caseId: appeal.caseId,
      status: appeal.status,
      submittedAt: appeal.createdAt,
    };
  }

  toActiveStatusResult(
    appeal: ModerationAppealEntity | null
  ): GetActiveModerationAppealStatusResultDTO {
    if (!appeal) {
      return {
        exists: false,
        appeal: null,
      };
    }

    return {
      exists: true,
      appeal: this.toStatusDto(appeal),
    };
  }
}
