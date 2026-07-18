export const TRACKER_API_PATHS = {
  root: '/trackers',
  summary: '/trackers/summary',
  domains: '/trackers/domains',
  detail: (trackerId: string) => `/trackers/${trackerId}`,
  roadmap: (trackerId: string) => `/trackers/${trackerId}/roadmap`,
  clan: (trackerId: string) => `/trackers/${trackerId}/clan`,
  clanJoin: (trackerId: string) => `/trackers/${trackerId}/clan/join`,
  clanJoinRequest: (trackerId: string, requestId: string) =>
    `/trackers/${trackerId}/clan/join-requests/${requestId}`,
  clanMember: (trackerId: string, memberId: string) =>
    `/trackers/${trackerId}/clan/members/${memberId}`,
  clanLeave: (trackerId: string) => `/trackers/${trackerId}/clan/leave`,
  clanTransfer: (trackerId: string) => `/trackers/${trackerId}/clan/transfer-ownership`,
  clanMessages: (trackerId: string) => `/trackers/${trackerId}/clan/messages`,
  clanChallenges: (trackerId: string) => `/trackers/${trackerId}/clan/challenges`,
  clanChallengeAccept: (trackerId: string, challengeId: string) =>
    `/trackers/${trackerId}/clan/challenges/${challengeId}/accept`,
  clanChallengeDecline: (trackerId: string, challengeId: string) =>
    `/trackers/${trackerId}/clan/challenges/${challengeId}/decline`,
  clanChallengeCancel: (trackerId: string, challengeId: string) =>
    `/trackers/${trackerId}/clan/challenges/${challengeId}/cancel`,
  clanChallengeSubmit: (trackerId: string, challengeId: string) =>
    `/trackers/${trackerId}/clan/challenges/${challengeId}/submit`,
  archive: (trackerId: string) => `/trackers/${trackerId}/archive`,
  restore: (trackerId: string) => `/trackers/${trackerId}/restore`,
  publish: (trackerId: string) => `/trackers/${trackerId}/publish`,
  unpublish: (trackerId: string) => `/trackers/${trackerId}/unpublish`,
  topics: (trackerId: string) => `/trackers/${trackerId}/topics`,
  topic: (trackerId: string, topicId: string) => `/trackers/${trackerId}/topics/${topicId}`,
  subtopic: (trackerId: string, subtopicId: string) =>
    `/trackers/${trackerId}/subtopics/${subtopicId}`,
  subtopics: (trackerId: string, topicId: string) =>
    `/trackers/${trackerId}/topics/${topicId}/subtopics`,
  createTopicContribution: (trackerId: string, topicId: string) =>
    `/trackers/${trackerId}/topics/${topicId}/contributions`,
  topicContributions: (trackerId: string) => `/trackers/${trackerId}/topic-contributions`,
  reviewTopicContribution: (trackerId: string, contributionId: string) =>
    `/trackers/${trackerId}/topic-contributions/${contributionId}`,
  subtopicProgress: (trackerId: string, subtopicId: string) =>
    `/trackers/${trackerId}/subtopics/${subtopicId}/progress`,
  verifyTopics: (trackerId: string) => `/trackers/${trackerId}/topics/verify`,
  verifySubtopics: (trackerId: string, topicId: string) =>
    `/trackers/${trackerId}/topics/${topicId}/subtopics/verify`,
  addMissingEvaluationTopic: (trackerId: string, evaluationJobId: string, topicIndex: number) =>
    `/trackers/${trackerId}/evaluation-jobs/${evaluationJobId}/missing-topics/${topicIndex}/add`,
  lesson: (trackerId: string, subtopicId: string) => `/trackers/${trackerId}/lessons/${subtopicId}`,
  lessonChat: (trackerId: string, subtopicId: string) =>
    `/trackers/${trackerId}/lessons/${subtopicId}/chat`,
  lessonAnswerAttempts: (trackerId: string, subtopicId: string) =>
    `/trackers/${trackerId}/lessons/${subtopicId}/answer/attempts`,
  verifyLessonAnswer: (trackerId: string, subtopicId: string) =>
    `/trackers/${trackerId}/lessons/${subtopicId}/answer/verify`,
  lessonCodeSubmissions: (trackerId: string, subtopicId: string) =>
    `/trackers/${trackerId}/lessons/${subtopicId}/code/submissions`,
  runLessonCode: (trackerId: string, subtopicId: string) =>
    `/trackers/${trackerId}/lessons/${subtopicId}/code/run`,
  submitLessonCode: (trackerId: string, subtopicId: string) =>
    `/trackers/${trackerId}/lessons/${subtopicId}/code/submit`,
  lessonCodeHint: (trackerId: string, subtopicId: string) =>
    `/trackers/${trackerId}/lessons/${subtopicId}/code/hint`,
  optimizedLessonSolution: (trackerId: string, subtopicId: string) =>
    `/trackers/${trackerId}/lessons/${subtopicId}/code/optimized-solution`,
  lessonQuestions: (trackerId: string, subtopicId: string) =>
    `/trackers/${trackerId}/lessons/${subtopicId}/questions`,
  generateLessonQuestions: (trackerId: string, subtopicId: string) =>
    `/trackers/${trackerId}/lessons/${subtopicId}/questions/generate`,
  lessonQuestionSolution: (trackerId: string, subtopicId: string) =>
    `/trackers/${trackerId}/lessons/${subtopicId}/question-solution`,
  generateLessonQuestionSolution: (trackerId: string, subtopicId: string) =>
    `/trackers/${trackerId}/lessons/${subtopicId}/question-solution/generate`,
  lessonQuestionSolutionDoubts: (trackerId: string, subtopicId: string) =>
    `/trackers/${trackerId}/lessons/${subtopicId}/question-solution/doubts`,
  lessonVisualization: (trackerId: string, subtopicId: string) =>
    `/trackers/${trackerId}/lessons/${subtopicId}/visualize`,
  communityVerification: (trackerId: string) => `/community/trackers/${trackerId}/verification`,
} as const;
