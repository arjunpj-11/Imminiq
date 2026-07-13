export const TRACKER_ROUTE_PATHS = {
  ROOT: '/',
  SUMMARY: '/summary',

  TRACKER_BY_ID: '/:trackerId',
  ARCHIVE_TRACKER: '/:trackerId/archive',
  RESTORE_TRACKER: '/:trackerId/restore',
  PUBLISH_TRACKER: '/:trackerId/publish',
  UNPUBLISH_TRACKER: '/:trackerId/unpublish',
  ROADMAP: '/:trackerId/roadmap',

  TOPICS: '/:trackerId/topics',
  SUBTOPICS: '/:trackerId/topics/:topicId/subtopics',
  SUBTOPIC_PROGRESS: '/:trackerId/subtopics/:subtopicId/progress',
  VERIFY_TOPIC: '/:trackerId/topics/verify',
  VERIFY_SUBTOPIC: '/:trackerId/topics/:topicId/subtopics/verify',
  ADD_MISSING_EVALUATION_TOPIC:
    '/:trackerId/evaluation-jobs/:evaluationJobId/missing-topics/:topicIndex/add',

  LESSON: '/:trackerId/lessons/:subtopicId',
  LESSON_CHAT: '/:trackerId/lessons/:subtopicId/chat',
  LESSON_QUESTIONS: '/:trackerId/lessons/:subtopicId/questions',
  GENERATE_LESSON_QUESTIONS: '/:trackerId/lessons/:subtopicId/questions/generate',
  LESSON_QUESTION_SOLUTION: '/:trackerId/lessons/:subtopicId/question-solution',
  GENERATE_LESSON_QUESTION_SOLUTION: '/:trackerId/lessons/:subtopicId/question-solution/generate',
  LESSON_QUESTION_SOLUTION_DOUBTS: '/:trackerId/lessons/:subtopicId/question-solution/doubts',
  LESSON_VISUALIZATION: '/:trackerId/lessons/:subtopicId/visualize',

  LESSON_ANSWER_ATTEMPTS: '/:trackerId/lessons/:subtopicId/answer/attempts',
  VERIFY_LESSON_ANSWER: '/:trackerId/lessons/:subtopicId/answer/verify',

  LESSON_CODE_SUBMISSIONS: '/:trackerId/lessons/:subtopicId/code/submissions',
  RUN_LESSON_CODE: '/:trackerId/lessons/:subtopicId/code/run',
  SUBMIT_LESSON_CODE: '/:trackerId/lessons/:subtopicId/code/submit',
  CODE_HINT: '/:trackerId/lessons/:subtopicId/code/hint',
  OPTIMIZED_SOLUTION: '/:trackerId/lessons/:subtopicId/code/optimized-solution',
} as const;

export type TrackerRoutePath = (typeof TRACKER_ROUTE_PATHS)[keyof typeof TRACKER_ROUTE_PATHS];
