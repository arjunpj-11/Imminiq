// apps/web/src/types/tracker.types.ts

export type TrackerStatus = 'active' | 'stalled' | 'completed' | 'archived';

export type TrackerStatusFilter = TrackerStatus | 'all';

export type TrackerVisibility = 'private' | 'public';

export type TrackerDomain =
  | 'engineering'
  | 'frontend'
  | 'backend'
  | 'algorithms'
  | 'architecture'
  | 'development'
  | 'design'
  | 'ai'
  | 'other';

export type TrackerDomainFilter = TrackerDomain | 'all';

export type TrackerLevel = 'beginner' | 'intermediate' | 'advanced';

export type TrackerSortBy = 'lastActive' | 'createdAt' | 'progress' | 'title';

export type LessonStatus = 'locked' | 'available' | 'in_progress' | 'completed';

export type LessonType = 'concept' | 'coding' | 'interview' | 'system_design' | 'theory';

export interface IApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ITracker {
  _id: string;
  title: string;
  description?: string;
  domain?: string;
  goal?: string;
  level?: TrackerLevel;
  status?: TrackerStatus;
  visibility?: TrackerVisibility;
  moderationStatus?: 'active' | 'suspended' | 'deleted';
  moderationReason?: string | null;
  progressPercent?: number;
  topicsCount?: number;
  subtopicsCount?: number;
  completedSubtopicsCount?: number;
  completedTopics?: number; // 👈 add
  totalTopics?: number; // 👈 add (same as topicsCount but from progress)
  lastActiveAt?: string | null;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  sourceTrackerId?: string | null;
  clonedFrom?: {
    trackerId: string;
    ownerId: string;
    name: string;
    username: string;
    avatarUrl?: string | null;
  } | null;
  clanRole?: 'owner' | 'co_owner' | 'member';
  clanNotificationsCount?: number;
}

export type TrackerTopicContributionStatus = 'pending' | 'approved' | 'rejected';

export interface ITrackerTopicContribution {
  id: string;
  sourceTrackerId: string;
  cloneTrackerId: string;
  cloneTopicId: string;
  requesterId: string;
  ownerId: string;
  requester: { name: string; username: string; avatarUrl?: string | null };
  title: string;
  description: string;
  subtopicsCount: number;
  subtopics: Array<{ title: string; description: string; depth: number; order: number }>;
  status: TrackerTopicContributionStatus;
  createdAt: string;
  reviewedAt?: string | null;
  mergedTopicId?: string | null;
  reviewNote?: string | null;
  /** @deprecated Legacy rejection-only field. */
  rejectionReason?: string | null;
}

export type TrackerClanRole = 'owner' | 'co_owner' | 'member' | 'outsider';

export interface ITrackerClanPerson {
  userId: string;
  name: string;
  username: string;
  avatarUrl?: string | null;
  role: Exclude<TrackerClanRole, 'outsider'>;
  joinedAt?: string;
}

export interface ITrackerClanJoinRequest {
  id: string;
  userId: string;
  name: string;
  username: string;
  avatarUrl?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface ITrackerClanRoleInvitation {
  id: string;
  userId: string;
  role: 'co_owner' | 'owner';
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  invitedBy: Omit<ITrackerClanPerson, 'role' | 'joinedAt'>;
}

export interface ITrackerCloneSyncResult {
  cloneTrackerId: string;
  addedTopics: number;
  updatedTopics: number;
  addedSubtopics: number;
  updatedSubtopics: number;
}

export interface ITrackerClanOverview {
  trackerId: string;
  trackerTitle: string;
  trackerDescription: string;
  topicsCount: number;
  subtopicsCount: number;
  visibility: 'private' | 'public';
  role: TrackerClanRole;
  canManage: boolean;
  canTransferOwnership: boolean;
  hasPendingJoinRequest: boolean;
  personalCloneTrackerId: string | null;
  members: ITrackerClanPerson[];
  joinRequests: ITrackerClanJoinRequest[];
  roleInvitations: ITrackerClanRoleInvitation[];
}

export interface ITrackerClanMessage {
  id: string;
  trackerId: string;
  text: string;
  createdAt: string;
  user: { userId: string; name: string; username: string; avatarUrl?: string | null };
}

export type TrackerClanChallengeStatus =
  | 'open'
  | 'pending'
  | 'active'
  | 'completed'
  | 'declined'
  | 'cancelled'
  | 'expired';

export interface ITrackerClanChallenge {
  id: string;
  trackerId: string;
  challengeType: 'open' | 'direct';
  status: TrackerClanChallengeStatus;
  durationMinutes: number;
  questionCount: number;
  maxScore: number;
  challenger: Omit<ITrackerClanPerson, 'role' | 'joinedAt'>;
  opponent: Omit<ITrackerClanPerson, 'role' | 'joinedAt'> | null;
  challengerScore: number | null;
  opponentScore: number | null;
  winnerId: string | null;
  createdAt: string;
  acceptBy: string;
  startsAt: string | null;
  endsAt: string | null;
  completedAt: string | null;
  canAccept: boolean;
  canDecline: boolean;
  canCancel: boolean;
  canSubmit: boolean;
  submitted: boolean;
  totalNodes: number;
  checkpointNodes: number[];
  viewerPosition: number;
  opponentPosition: number;
  viewerScore: number;
  opponentLiveScore: number;
  pushBackPowers: number;
  checkpointDecisionRequired: boolean;
  lastAnswerCorrect: boolean | null;
  questions: Array<{
    id: string;
    prompt: string;
    options: string[];
    topicTitle: string;
    points: number;
    isCheckpoint: boolean;
  }>;
}

export interface ITrackerSummary {
  totalTrackers: number;
  activeTrackers: number;
  completedTrackers: number;
  publishedTrackers: number;
  averageProgress: number;
}

export interface ITrackerListResponse {
  trackers: ITracker[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ITrackerListQuery {
  status?: TrackerStatusFilter;
  domain?: TrackerDomainFilter;
  sortBy?: TrackerSortBy;
  page?: number;
  limit?: number;
}

export interface ICreateTrackerPayload {
  title: string;
  description?: string;
  domain?: TrackerDomain;
  goal?: string;
  level?: TrackerLevel;
  visibility?: TrackerVisibility;
}

export interface IUpdateTrackerPayload extends Partial<ICreateTrackerPayload> {
  trackerId: string;
}

export interface ILearningVideo {
  videoId: string;
  title: string;
  url: string;
  channelTitle: string;
  thumbnailUrl: string;
  durationSeconds: number;
}

export interface IRoadmapSubtopic {
  _id: string;
  title: string;
  description?: string;
  order: number;
  depth: number;
  status: LessonStatus;
  isLocked: boolean;
  estimatedMinutes?: number;
  progressPercent?: number;
  completedAt?: string | null;
  learningVideo?: ILearningVideo | null;
  children?: IRoadmapSubtopic[];
}

export interface IRoadmapTopic {
  _id: string;
  sourceTopicId?: string | null;
  isCloneAddition?: boolean;
  title: string;
  description?: string;
  order: number;
  status: LessonStatus;
  progressPercent?: number;
  estimatedHours?: number;
  learningVideo?: ILearningVideo | null;
  subtopics: IRoadmapSubtopic[];
}

export interface ITrackerRoadmapResponse {
  tracker: ITracker;
  roadmap: IRoadmapTopic[];
}

export interface ICreateTopicPayload {
  trackerId: string;
  title: string;
  description?: string;
}

export interface ICreateSubtopicPayload {
  trackerId: string;
  topicId: string;
  title: string;
  description?: string;
  parentSubtopicId?: string | null;
  estimatedMinutes?: number;
}

export interface IUpdateSubtopicProgressPayload {
  trackerId: string;
  subtopicId: string;
  status: 'in_progress' | 'completed';
}

export interface ILessonListItem {
  _id: string;
  title: string;
  status: LessonStatus;
  isLocked: boolean;
  estimatedMinutes?: number;
}

export interface ITrackerLessonNode {
  _id: string;
  trackerId: string;
  topicId: string;
  parentSubtopicId: string | null;
  title: string;
  description: string;
  order: number;
  depth: number;
  status: LessonStatus;
  isLocked: boolean;
  progressPercent: number;
  topicTitle?: string;
}

export interface IGeneratedLesson {
  _id: string;
  trackerId: string;
  subtopicId: string;
  userId: string;
  title: string;
  summary: string;
  explanation: string;
  insight: string;
  lessonType: LessonType;
  requiresCompiler: boolean;
  compilerRuntime: 'javascript' | 'typescript' | 'python' | 'c++' | 'c' | 'java' | null;
  codeExample: {
    language: string;
    fileName: string;
    code: string;
  };
  practiceTask: {
    title: string;
    description: string;
    expectedOutput?: string;
    starterCode: string;
  };
  tags: string[];
  difficulty: TrackerLevel;
  estimatedMinutes: number;
}

export interface ILessonNavigationItem {
  _id: string;
  title: string;
}

export interface ITrackerLessonResponse {
  tracker: ITracker;
  lessonNode: ITrackerLessonNode;
  generatedLesson: IGeneratedLesson;
  previousLesson: ILessonNavigationItem | null;
  nextLesson: ILessonNavigationItem | null;
  lessonRoadmap: ILessonListItem[];
}

export type LessonChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type LessonChatPayload = {
  trackerId: string;
  subtopicId: string;
  messages: LessonChatMessage[];
};

export type LessonChatResponse = IApiResponse<{
  answer: string;
}>;

export type RunLessonCodePayload = {
  trackerId: string;
  subtopicId: string;
  sourceCode: string;
  languageId?: number;
  language?: string;
  stdin?: string;
};

export type RunLessonCodeResponse = IApiResponse<{
  stdout: string;
  stderr: string;
  compileOutput: string;
  message: string;
  status: {
    id: number;
    description: string;
  };
  time?: string | null;
  memory?: number | null;
}>;

export type AddMissingEvaluationTopicPayload = {
  trackerId: string;
  evaluationJobId: string;
  topicIndex: number;
};

export type AddedSubtopic = {
  _id: string;
  trackerId: string;
  topicId: string;
  parentSubtopicId: string | null;
  title: string;
  description: string;
  order: number;
  depth: number;
};

export type AddedTopic = {
  _id: string;
  trackerId: string;
  title: string;
  description: string;
  order: number;
};

export type AddMissingEvaluationTopicResponse = IApiResponse<{
  trackerId: string;
  evaluationJobId: string;
  missingTopicIndex: number;
  addedSubtopic?: AddedSubtopic;
  addedTopic?: AddedTopic;
  placedUnder: {
    type: 'topic' | 'subtopic' | 'tracker';
    _id: string;
    title: string;
  };
}>;

export type SubmitLessonCodePayload = {
  trackerId: string;
  subtopicId: string;
  sourceCode: string;
  languageId?: number;
  language?: string;
  stdin?: string;
};

export type SubmitLessonCodeResponse = IApiResponse<{
  isCorrect: boolean;
  expectedOutput: string;
  actualOutput: string;
  stdout: string;
  stderr: string;
  compileOutput: string;
  message: string;
  status: {
    id: number;
    description: string;
  };
  time: string | null;
  memory: number | null;
  feedback?: string;
  canCompareOptimized: boolean;
  canAskHints: boolean;
}>;

export type GetCodeHintPayload = {
  trackerId: string;
  subtopicId: string;
  sourceCode: string;
  actualOutput?: string;
  errorOutput?: string;
  hintCount: number;
};

export type GetCodeHintResponse = IApiResponse<{
  mode: 'hint' | 'issue';
  hintCount: number;
  title: string;
  explanation: string;
}>;

export type GetOptimizedSolutionPayload = {
  trackerId: string;
  subtopicId: string;
  sourceCode: string;
  language?: string;
};

export type GetOptimizedSolutionResponse = IApiResponse<{
  optimizedCode: string;
  explanation: string;
  improvements: string[];
}>;

export type VerifyLessonAnswerPayload = {
  trackerId: string;
  subtopicId: string;
  question: string;
  answer: string;
};

export type VerifyLessonAnswerResponse = IApiResponse<{
  verdict: 'correct' | 'partially_correct' | 'incorrect';
  score: number;
  feedback: string;
  correctedAnswer: string;
  keyPoints: string[];
}>;

export type LessonChatRole = 'user' | 'assistant';

export type LessonChatScope = 'lesson_doubt_chat' | 'question_solution_chat';

export type PersistedLessonChatMessage = {
  _id: string;
  trackerId: string;
  subtopicId: string;
  lessonId?: string | null;
  userId: string;
  scope: LessonChatScope;
  questionId?: string | null;
  role: LessonChatRole;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type LessonAnswerAttempt = {
  _id: string;
  trackerId: string;
  subtopicId: string;
  lessonId?: string | null;
  userId: string;
  questionId?: string | null;
  question: string;
  answer: string;
  feedback: VerifyLessonAnswerResponse['data'];
  isCorrect: boolean;
  score: number;
  attemptNumber: number;
  createdAt: string;
  updatedAt: string;
};

export type LessonCodeSubmissionAction = 'run' | 'submit';

export type LessonCodeSubmission = {
  _id: string;
  trackerId: string;
  subtopicId: string;
  lessonId?: string | null;
  userId: string;
  questionId?: string | null;
  action: LessonCodeSubmissionAction;
  language: string;
  languageId?: number | null;
  sourceCode: string;
  stdin?: string;
  stdout?: string;
  stderr?: string;
  compileOutput?: string;
  message?: string;
  status?: {
    id?: number;
    description?: string;
  } | null;
  time?: string | null;
  memory?: number | null;
  isCorrect: boolean;
  expectedOutput?: string;
  actualOutput?: string;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
};

export type LessonGeneratedQuestion = {
  _id: string;
  trackerId: string;
  subtopicId: string;
  lessonId?: string | null;
  userId: string;
  question: string;
  questionHash: string;
  source: 'base' | 'ai_generated';
  createdAt: string;
  updatedAt: string;
};

export type LessonQuestionSolution = {
  _id: string;
  trackerId: string;
  subtopicId: string;
  lessonId?: string | null;
  userId: string;
  question: string;
  questionHash: string;
  solution: string;
  createdAt: string;
  updatedAt: string;
};

export type LessonQuestionSolutionDoubt = {
  _id: string;
  trackerId: string;
  subtopicId: string;
  lessonId?: string | null;
  solutionId?: string | null;
  userId: string;
  question: string;
  questionHash: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type GenerateLessonQuestionsPayload = {
  trackerId: string;
  subtopicId: string;
  count?: number;
};

export type GenerateLessonQuestionsResponse = IApiResponse<LessonGeneratedQuestion[]>;

export type GenerateLessonQuestionSolutionPayload = {
  trackerId: string;
  subtopicId: string;
  question: string;
};

export type GenerateLessonQuestionSolutionResponse = IApiResponse<LessonQuestionSolution>;

export type AskLessonQuestionSolutionDoubtPayload = {
  trackerId: string;
  subtopicId: string;
  question: string;
  message: string;
};

export type AskLessonQuestionSolutionDoubtResponse = IApiResponse<{
  answer: string;
}>;

export type GenerateLessonVisualizationResponse = IApiResponse<{
  html: string;
  visualTitle: string;
  visualDescription: string;
}>;

export type GenerateLessonVisualizationPayload = {
  trackerId: string;
  subtopicId: string;
  regenerate?: boolean;
};

export type PublishTrackerPayload = {
  trackerId: string;
  name: string;
  description: string;
  domain: string;
  difficulty: string;
  tags: string[];
  allowClone: boolean;
};
