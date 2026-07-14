export interface AdminMockTestDTO {
  id: string;
  title: string;
  owner: string;
  difficulty: string;
  visibility: string;
  questionCount: number;
  attemptCount: number;
  averageScore: number;
  isAIGenerated: boolean;
  createdAt: Date;
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
}
