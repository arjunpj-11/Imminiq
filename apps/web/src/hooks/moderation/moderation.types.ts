export type ContentModerationAppeal = {
  id: string;
  targetType: 'tracker' | 'mock_test';
  targetId: string;
  reason: string;
  evidenceUrls: string[];
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  decisionNote?: string;
  createdAt: string;
};

export interface ISubmitContentModerationAppealPayload {
  targetType: ContentModerationAppeal['targetType'];
  targetId: string;
  reason: string;
  evidenceUrls: string[];
}
