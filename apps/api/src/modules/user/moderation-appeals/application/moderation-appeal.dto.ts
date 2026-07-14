import type { ModerationAppealStatus } from '../domain/value-objects/moderation-appeal-status.vo';

export interface SubmitModerationAppealPayloadDTO {
  userId: string;
  identifier: string;
  appealReason: string;
}

export interface GetModerationAppealStatusPayloadDTO {
  userId: string;
  identifier: string;
}

export interface ModerationAppealStatusDTO {
  caseId: string;
  status: ModerationAppealStatus;
  submittedAt: Date;
}

export interface SubmitModerationAppealResultDTO {
  caseId: string;
  status: ModerationAppealStatus;
  submittedAt: Date;
}

export interface GetActiveModerationAppealStatusResultDTO {
  exists: boolean;
  appeal: ModerationAppealStatusDTO | null;
}
