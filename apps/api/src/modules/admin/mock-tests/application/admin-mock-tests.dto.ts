export interface IAdminMockTestDTO {
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

export interface IAdminMockTestQuestionDTO {
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

export interface IAdminMockTestDetailDTO extends IAdminMockTestDTO {
  description: string;
  timeLimitMinutes: number;
  passingScore: number;
  tags: string[];
  questions: IAdminMockTestQuestionDTO[];
}
