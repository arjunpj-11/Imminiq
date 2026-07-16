export interface AdminMockTestDTO {
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
}

export interface AdminMockTestQuestionDTO {
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
  answerCount: number;
  correctRate: number;
  skipRate: number;
  coding?: {
    functionName?: string;
    language?: string;
    starterCode?: string;
    testCaseCount: number;
  };
}

export interface AdminMockTestDetailDTO extends AdminMockTestDTO {
  description: string;
  timeLimitMinutes: number;
  passingScore: number;
  tags: string[];
  questions: AdminMockTestQuestionDTO[];
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
}

export interface AdminMockTestQuestionIssueDTO {
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
}

export interface AdminMockTestLifecycleResultDTO {
  id: string;
  title: string;
  moderationStatus: 'active' | 'suspended' | 'deleted';
  reason: string;
  affectedActiveAttempts: number;
  notificationQueued: boolean;
  updatedAt: Date;
}
