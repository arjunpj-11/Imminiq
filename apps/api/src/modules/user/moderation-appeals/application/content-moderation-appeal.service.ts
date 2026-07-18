export type ContentAppealTargetType = 'tracker' | 'mock_test';
export type SubmitContentModerationAppealInput = {
  userId: string;
  targetType: ContentAppealTargetType;
  targetId: string;
  reason: string;
  evidenceUrls: string[];
};
export type ContentModerationAppealDTO = {
  id: string;
  targetType: ContentAppealTargetType;
  targetId: string;
  reason: string;
  evidenceUrls: string[];
  status: string;
  decisionNote?: string | null;
  createdAt: Date;
  updatedAt: Date;
  decidedAt?: Date | null;
};
export type SubmitContentModerationAppealResultDTO = Pick<
  ContentModerationAppealDTO,
  'id' | 'targetType' | 'targetId' | 'status' | 'createdAt'
>;

export interface IContentModerationAppealService {
  list(userId: string): Promise<ContentModerationAppealDTO[]>;
  submit(
    input: SubmitContentModerationAppealInput
  ): Promise<SubmitContentModerationAppealResultDTO>;
}
