import type * as Application from './index';
export type TrackerUseCases = {
  getTrackerSummary: Application.IGetTrackerSummaryUseCase;
  listTrackers: Application.IListTrackersUseCase;
  listTrackerDomains: Application.IListTrackerDomainsUseCase;
  createTracker: Application.ICreateTrackerUseCase;
  getTrackerDetails: Application.IGetTrackerDetailsUseCase;
  updateTracker: Application.IUpdateTrackerUseCase;
  deleteTracker: Application.IDeleteTrackerUseCase;
  archiveTracker: Application.IArchiveTrackerUseCase;
  restoreTracker: Application.IRestoreTrackerUseCase;
  publishTracker: Application.IPublishTrackerUseCase;
  unpublishTracker: Application.IUnpublishTrackerUseCase;
  getTrackerRoadmap: Application.IGetTrackerRoadmapUseCase;
  createTrackerTopic: Application.ICreateTrackerTopicUseCase;
  createTrackerSubtopic: Application.ICreateTrackerSubtopicUseCase;
  importTrackerOutline: Application.IImportTrackerOutlineUseCase;
  createTopicContribution: Application.ICreateTopicContributionUseCase;
  listTopicContributions: Application.IListTopicContributionsUseCase;
  reviewTopicContribution: Application.IReviewTopicContributionUseCase;
  updateSubtopicProgress: Application.IUpdateSubtopicProgressUseCase;
  addMissingEvaluationTopic: Application.IAddMissingEvaluationTopicUseCase;
  getTrackerLesson: Application.IGetTrackerLessonUseCase;
  chatWithLessonTutor: Application.IChatWithLessonTutorUseCase;
  generateLessonQuestions: Application.IGenerateLessonQuestionsUseCase;
  generateLessonQuestionSolution: Application.IGenerateLessonQuestionSolutionUseCase;
  askLessonQuestionSolutionDoubt: Application.IAskLessonQuestionSolutionDoubtUseCase;
  generateLessonVisualization: Application.IGenerateLessonVisualizationUseCase;
  getCodeHint: Application.IGetCodeHintUseCase;
  getOptimizedSolution: Application.IGetOptimizedSolutionUseCase;
  verifyLessonAnswer: Application.IVerifyLessonAnswerUseCase;
  verifyTrackerTopic: Application.IVerifyTrackerTopicUseCase;
  verifyTrackerSubtopic: Application.IVerifyTrackerSubtopicUseCase;
  runLessonCode: Application.IRunLessonCodeUseCase;
  submitLessonCode: Application.ISubmitLessonCodeUseCase;
  getLessonChatHistory: Application.IGetLessonChatHistoryUseCase;
  getLessonAnswerAttempts: Application.IGetLessonAnswerAttemptsUseCase;
  getLessonCodeSubmissions: Application.IGetLessonCodeSubmissionsUseCase;
  getLessonGeneratedQuestions: Application.IGetLessonGeneratedQuestionsUseCase;
  getLessonQuestionSolution: Application.IGetLessonQuestionSolutionUseCase;
  getLessonQuestionSolutionDoubts: Application.IGetLessonQuestionSolutionDoubtsUseCase;
  clearLessonChatHistory: Application.IClearLessonChatHistoryUseCase;
  clearLessonQuestionSolutionDoubts: Application.IClearLessonQuestionSolutionDoubtsUseCase;
  reportTracker: Application.IReportTrackerUseCase;
  trackerClan: Application.ITrackerClanServiceContract;
  trackerClanChallenges: Application.ITrackerClanChallengeServiceContract;
};

export type TrackerManagementUseCases = Pick<
  TrackerUseCases,
  | 'getTrackerSummary'
  | 'listTrackers'
  | 'listTrackerDomains'
  | 'createTracker'
  | 'getTrackerDetails'
  | 'updateTracker'
  | 'deleteTracker'
  | 'archiveTracker'
  | 'restoreTracker'
  | 'publishTracker'
  | 'unpublishTracker'
  | 'getTrackerRoadmap'
  | 'createTrackerTopic'
  | 'createTrackerSubtopic'
  | 'importTrackerOutline'
  | 'createTopicContribution'
  | 'listTopicContributions'
  | 'reviewTopicContribution'
  | 'updateSubtopicProgress'
  | 'verifyTrackerTopic'
  | 'verifyTrackerSubtopic'
  | 'addMissingEvaluationTopic'
  | 'trackerClan'
  | 'trackerClanChallenges'
>;

export type TrackerLessonUseCases = Pick<
  TrackerUseCases,
  | 'getTrackerLesson'
  | 'chatWithLessonTutor'
  | 'generateLessonQuestions'
  | 'generateLessonQuestionSolution'
  | 'generateLessonVisualization'
  | 'getLessonChatHistory'
  | 'getLessonGeneratedQuestions'
  | 'getLessonQuestionSolution'
  | 'getLessonQuestionSolutionDoubts'
  | 'askLessonQuestionSolutionDoubt'
  | 'clearLessonChatHistory'
  | 'clearLessonQuestionSolutionDoubts'
>;

export type TrackerPracticeUseCases = Pick<
  TrackerUseCases,
  | 'getLessonAnswerAttempts'
  | 'verifyLessonAnswer'
  | 'getLessonCodeSubmissions'
  | 'runLessonCode'
  | 'submitLessonCode'
  | 'getCodeHint'
  | 'getOptimizedSolution'
>;
