export type AdminMockTest = {
  id: string;
  title: string;
  owner: string;
  difficulty: string;
  visibility: string;
  moderationStatus: 'active' | 'suspended' | 'deleted';
  moderationReason?: string;
  questionCount: number;
  attemptCount: number;
  averageScore: number;
  isAIGenerated: boolean;
  createdAt: Date;
  deletedAt?: Date | null;
  reportCount: number;
  openReportCount: number;
  flagCount: number;
};
export type AdminMockTestVisibilityResult = { id: string; visibility: string };
export type AdminMockTestQuestion = {
  id: string;
  order: number;
  type: string;
  question: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  difficulty: string;
  points: number;
  moderationStatus: 'active' | 'disabled';
  moderationReason?: string;
  version: number;
  reportCount: number;
  openReportCount: number;
  flagCount: number;
  answerCount: number;
  correctRate: number;
  skipRate: number;
  coding?: {
    functionName?: string;
    language?: string;
    starterCode?: string;
    testCaseCount: number;
  };
};
export type AdminMockTestDetail = AdminMockTest & {
  description: string;
  timeLimitMinutes: number;
  passingScore: number;
  tags: string[];
  questions: AdminMockTestQuestion[];
  ownerId: string;
  ownerEmail?: string;
  activeAttemptCount: number;
  moderationHistory: Array<{
    id: string;
    action: string;
    actor: string;
    reason?: string;
    createdAt: Date;
  }>;
};

export type AdminMockTestQuestionIssue = {
  id: string;
  testId: string;
  testTitle: string;
  testOwner: string;
  testOwnerEmail?: string;
  questionId: string;
  questionOrder: number;
  question: string;
  questionType: string;
  questionAnswer?: string;
  questionExplanation?: string;
  questionOptions?: string[];
  questionDifficulty?: string;
  questionPoints?: number;
  questionCoding?: Record<string, unknown>;
  attemptId: string;
  reporterId: string;
  reporter: string;
  reporterEmail?: string;
  reason: string;
  details: string;
  status: 'open' | 'reviewing' | 'resolved' | 'dismissed';
  resolutionAction: string;
  resolutionNote: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
};

export type AdminMockTestLifecycleInput = {
  action: 'suspend' | 'delete' | 'restore';
  reasonCode: string;
  reason: string;
  notifyOwner: boolean;
};

export type AdminMockTestLifecycleResult = {
  id: string;
  title: string;
  ownerId: string;
  owner: string;
  ownerEmail?: string;
  moderationStatus: 'active' | 'suspended' | 'deleted';
  reason: string;
  affectedActiveAttempts: number;
  updatedAt: Date;
};

export type AdminMockTestIssueUpdateInput = {
  status: 'reviewing' | 'resolved' | 'dismissed';
  resolutionAction?:
    | 'none'
    | 'question_corrected'
    | 'question_disabled'
    | 'test_suspended'
    | 'test_deleted';
  resolutionNote: string;
  correctedQuestion?: string;
  correctedAnswer?: string;
  correctedExplanation?: string;
  correctedOptions?: string[];
  correctedDifficulty?: 'easy' | 'medium' | 'hard';
  correctedPoints?: number;
  correctedCoding?: Record<string, unknown>;
};

export type AdminMockTestQuestionVersion = {
  id: string;
  questionId: string;
  testId: string;
  version: number;
  snapshot: Record<string, unknown>;
  changedBy: string;
  reason: string;
  createdAt: Date;
};
