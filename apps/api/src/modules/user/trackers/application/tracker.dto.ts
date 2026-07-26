import type {
  AddMissingEvaluationTopicResult,
  CreatedTrackerSubtopicRecord,
  CreatedTrackerTopicRecord,
  GeneratedTrackerLessonRecord,
  RoadmapTopicNode,
  RunLessonCodeInput,
  SubtopicWithProgressRecord,
  TrackerListFilter,
  TrackerListResult,
  TrackerProgressRecord,
  TrackerRecord,
  TrackerSummaryRecord,
  TrackerSummaryResult,
} from '../domain/trackers.types';
import type { GeneratedLessonData } from '../domain/lesson-practice.types';
import type {
  LessonAnswerAttemptRecord,
  LessonChatMessageRecord,
  LessonCodeSubmissionRecord,
  LessonGeneratedQuestionRecord,
  LessonQuestionSolutionDoubtRecord,
  LessonQuestionSolutionRecord,
  LessonVisualizationRecord,
} from '../domain/repositories/tracker-lesson.repository.interface';
import type {
  CodeExecutionResult,
  CodeSubmissionResult,
} from '../domain/services/code-execution.interface';
import type {
  AnswerVerificationResult,
  LessonCodeHintAIResult,
  OptimizedCodeSolution,
  TrackerValidationResult,
} from '../domain/services/tracker-ai.interface';

export type TrackerListQueryDTO = TrackerListFilter;
export type TrackerDTO = TrackerRecord;
export type TrackerSummaryDTO = TrackerSummaryRecord | TrackerSummaryResult;
export type TrackerListDTO = TrackerListResult;
export type TrackerDetailsDTO = TrackerRecord;
export type TrackerRoadmapDTO = RoadmapTopicNode[];
export type TrackerRoadmapResultDTO = {
  tracker: TrackerRecord;
  roadmap: RoadmapTopicNode[];
};
export type TrackerTopicDTO = CreatedTrackerTopicRecord;
export type TrackerSubtopicDTO = CreatedTrackerSubtopicRecord;
export type GeneratedTrackerLessonDTO = GeneratedTrackerLessonRecord | GeneratedLessonData;
export interface TrackerLessonViewDTO {
  tracker: TrackerRecord;
  lessonNode: {
    _id: string;
    trackerId: string;
    topicId: string;
    parentSubtopicId: string | null;
    title: string;
    description: string;
    order: number;
    depth: number;
    status: SubtopicWithProgressRecord['status'];
    isLocked: boolean;
    progressPercent: number;
    topicTitle: string;
  };
  generatedLesson: GeneratedTrackerLessonDTO;
  previousLesson: { _id: string; title: string } | null;
  nextLesson: { _id: string; title: string } | null;
  lessonRoadmap: Array<{
    _id: string;
    title: string;
    status: SubtopicWithProgressRecord['status'];
    isLocked: boolean;
  }>;
}
export type LessonChatHistoryDTO = LessonChatMessageRecord[];
export type LessonAnswerAttemptsDTO = LessonAnswerAttemptRecord[];
export type LessonCodeSubmissionsDTO = LessonCodeSubmissionRecord[];
export type LessonGeneratedQuestionsDTO = LessonGeneratedQuestionRecord[];
export type LessonQuestionSolutionDTO = LessonQuestionSolutionRecord | null;
export type LessonQuestionSolutionDoubtsDTO = LessonQuestionSolutionDoubtRecord[];
export type LessonQuestionSolutionDoubtAnswerDTO = { answer: string };
export type LessonAnswerVerificationDTO = AnswerVerificationResult;
export type LessonCodeExecutionDTO = CodeExecutionResult;
export type LessonCodeSubmissionDTO = CodeSubmissionResult;
export type LessonCodeHintDTO = LessonCodeHintAIResult & { hintCount: number };
export type LessonOptimizedSolutionDTO = OptimizedCodeSolution;
export type LessonVisualizationDTO = LessonVisualizationRecord;
export type TrackerAIValidationDTO = TrackerValidationResult;
export type AddMissingEvaluationTopicDTO = AddMissingEvaluationTopicResult;
export type RunLessonCodeDTO = RunLessonCodeInput;

export type ImportTrackerOutlineNodeDTO = {
  title: string;
  description?: string;
  subtopics: ImportTrackerOutlineNodeDTO[];
};

export type ImportTrackerOutlineInputDTO =
  | {
      trackerId: string;
      userId: string;
      kind: 'topics';
      topics: ImportTrackerOutlineNodeDTO[];
    }
  | {
      trackerId: string;
      userId: string;
      kind: 'subtopics';
      topicId: string;
      parentSubtopicId?: string | null;
      subtopics: ImportTrackerOutlineNodeDTO[];
    };

export type ImportTrackerOutlineResultDTO = {
  topicsAdded: number;
  subtopicsAdded: number;
};

export interface TrackerAccessPayloadDTO {
  trackerId: string;
  userId: string;
}

export interface ReportTrackerPayloadDTO extends TrackerAccessPayloadDTO {
  reason: string;
  details?: string;
}

export interface ReportTrackerResultDTO {
  id: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrackerLessonAccessPayloadDTO extends TrackerAccessPayloadDTO {
  subtopicId: string;
}

export interface LessonQuestionPayloadDTO extends TrackerLessonAccessPayloadDTO {
  question: string;
}

export interface AskLessonQuestionSolutionDoubtPayloadDTO extends LessonQuestionPayloadDTO {
  message: string;
}

export interface LessonTutorMessageDTO {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatWithLessonTutorPayloadDTO extends TrackerLessonAccessPayloadDTO {
  messages: LessonTutorMessageDTO[];
}

export interface CreateTopicContributionPayloadDTO extends TrackerAccessPayloadDTO {
  topicId: string;
}

export interface GenerateLessonQuestionsPayloadDTO extends TrackerLessonAccessPayloadDTO {
  count?: number;
}

export interface GenerateLessonVisualizationPayloadDTO extends TrackerLessonAccessPayloadDTO {
  regenerate?: boolean;
}

export interface GetLessonCodeSubmissionsPayloadDTO extends TrackerLessonAccessPayloadDTO {
  action?: 'run' | 'submit';
}

export interface RunLessonCodePayloadDTO extends TrackerLessonAccessPayloadDTO {
  sourceCode: string;
  languageId: number;
  language?: string;
  stdin?: string;
}

export type SubmitLessonCodePayloadDTO = RunLessonCodePayloadDTO;

export interface GetCodeHintPayloadDTO extends TrackerLessonAccessPayloadDTO {
  sourceCode: string;
  actualOutput?: string;
  errorOutput?: string;
  hintCount: number;
}

export interface GetOptimizedSolutionPayloadDTO extends TrackerLessonAccessPayloadDTO {
  sourceCode: string;
  language?: string;
}

export interface VerifyLessonAnswerPayloadDTO extends LessonQuestionPayloadDTO {
  answer: string;
}

export interface ExistingTrackerTopicDTO {
  id: string;
  title: string;
  description: string;
}

export interface VerifyTrackerTopicPayloadDTO extends TrackerAccessPayloadDTO {
  trackerTitle: string;
  topicTitle: string;
  topicDescription: string;
  existingTopics: ExistingTrackerTopicDTO[];
}

export interface ExistingTrackerSubtopicDTO {
  id: string;
  title: string;
  description: string;
  difficulty: string;
}

export interface VerifyTrackerSubtopicPayloadDTO extends TrackerAccessPayloadDTO {
  topicId: string;
  trackerTitle: string;
  topicTitle: string;
  topicDescription: string;
  subtopicTitle: string;
  subtopicDescription: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  existingSubtopics: ExistingTrackerSubtopicDTO[];
}

export interface ReviewTopicContributionPayloadDTO extends TrackerAccessPayloadDTO {
  contributionId: string;
  action: 'approve' | 'reject';
  reviewNote?: string;
}

export interface ReviewClanJoinPayloadDTO extends TrackerAccessPayloadDTO {
  requestId: string;
  action: 'approve' | 'reject';
}

export interface UpdateClanMemberRolePayloadDTO extends TrackerAccessPayloadDTO {
  memberId: string;
  role: 'co_owner' | 'member';
}

export interface RemoveClanMemberPayloadDTO extends TrackerAccessPayloadDTO {
  memberId: string;
}

export interface TransferClanOwnershipPayloadDTO extends TrackerAccessPayloadDTO {
  newOwnerId: string;
}

export interface RespondToClanRoleInvitationPayloadDTO extends TrackerAccessPayloadDTO {
  invitationId: string;
  action: 'accept' | 'decline';
}

export interface UpdateClanTopicPayloadDTO extends TrackerAccessPayloadDTO {
  topicId: string;
  title: string;
  description: string;
}

export interface DeleteClanTopicPayloadDTO extends TrackerAccessPayloadDTO {
  topicId: string;
}

export interface DeleteClanSubtopicPayloadDTO extends TrackerAccessPayloadDTO {
  subtopicId: string;
}

export interface ListClanMessagesPayloadDTO extends TrackerAccessPayloadDTO {
  limit?: number;
  before?: string;
}

export interface TrackerClanChallengeAccessPayloadDTO extends TrackerAccessPayloadDTO {
  challengeId: string;
}

export interface CreateTrackerClanChallengePayloadDTO extends TrackerAccessPayloadDTO {
  opponentId?: string;
  durationMinutes: number;
  questionCount: number;
}

export interface TrackerClanChallengeAnswerDTO {
  questionId: string;
  answer: string;
}

export interface SubmitTrackerClanChallengePayloadDTO extends TrackerClanChallengeAccessPayloadDTO {
  answers: TrackerClanChallengeAnswerDTO[];
}

export interface ChooseTrackerClanCheckpointPayloadDTO extends TrackerClanChallengeAccessPayloadDTO {
  decision: 'attempt' | 'skip';
}

export interface AnswerTrackerClanNodePayloadDTO extends TrackerClanChallengeAccessPayloadDTO {
  questionId: string;
  answer: string;
}

export interface ExtendTrackerClanChallengePayloadDTO extends TrackerClanChallengeAccessPayloadDTO {
  questionCount: 10 | 20;
}

export type UpdateSubtopicProgressResultDTO = {
  subtopic: SubtopicWithProgressRecord;
  progress: TrackerProgressRecord | null;
};

export type LessonTutorChatResponseDTO = {
  answer: string;
};

export type ClearLessonHistoryResultDTO = {
  success?: boolean;
  cleared?: boolean;
  deletedCount?: number;
};
