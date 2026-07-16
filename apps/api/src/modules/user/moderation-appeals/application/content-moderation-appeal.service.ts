export type ContentAppealTargetType = 'tracker' | 'mock_test';
export interface IContentModerationAppealService {
  list(userId: string): Promise<object[]>;
  submit(input: { userId: string; targetType: ContentAppealTargetType; targetId: string; reason: string; evidenceUrls: string[] }): Promise<object>;
}
