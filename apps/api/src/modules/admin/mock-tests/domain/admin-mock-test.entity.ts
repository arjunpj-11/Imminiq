export type AdminMockTest = { id: string; title: string; owner: string; difficulty: string; visibility: string; questionCount: number; attemptCount: number; averageScore: number; isAIGenerated: boolean; createdAt: Date }
export type AdminMockTestVisibilityResult = { id: string; visibility: string }
export type AdminMockTestQuestion = { id: string; order: number; type: string; question: string; options?: string[]; correctAnswer?: string; explanation?: string; difficulty: string; points: number; coding?: { functionName?: string; language?: string; starterCode?: string; testCaseCount: number } }
export type AdminMockTestDetail = AdminMockTest & { description: string; timeLimitMinutes: number; passingScore: number; tags: string[]; questions: AdminMockTestQuestion[] }
