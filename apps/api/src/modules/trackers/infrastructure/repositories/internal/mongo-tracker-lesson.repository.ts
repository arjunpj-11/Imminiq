import { LessonAnswerAttempt } from "../../../../../infrastructure/database/models/lesson-answer-attempt.model";
import { LessonChatMessage } from "../../../../../infrastructure/database/models/lesson-chat-message.model";
import { LessonCodeSubmission } from "../../../../../infrastructure/database/models/lesson-code-submission.model";
import { LessonGeneratedQuestion } from "../../../../../infrastructure/database/models/lesson-generated-question.model";
import { LessonQuestionSolution } from "../../../../../infrastructure/database/models/lesson-question-solution.model";
import { LessonQuestionSolutionDoubt } from "../../../../../infrastructure/database/models/lesson-question-solution-doubt.model";
import { LessonVisualization } from "../../../../../infrastructure/database/models/lesson-visualization.model";
import { Tracker } from "../../../../../infrastructure/database/models/tracker.model";
import { TrackerLesson } from "../../../../../infrastructure/database/models/tracker-lesson.model";
import type { TrackerRepositoryContract } from "../../../domain/repositories/tracker.repository.interface";
import type { GeneratedTrackerLessonRecord } from "../../../domain/types/trackers.types";
import { MongoTrackerBaseRepository } from "../shared/mongo-tracker-base.repository";
import { MongoTrackerMapper } from "../shared/mongo-tracker.mapper";
import { MongoTrackerErrorMapper } from "../shared/mongo-tracker-error.mapper";
import type {
  MongoGeneratedLessonRecord,
  MongoQuery,
} from "../shared/mongo-tracker.types";

export class MongoTrackerLessonRepository extends MongoTrackerBaseRepository {
  constructor(protected readonly mapper = new MongoTrackerMapper()) {
    super();
  }
  async findLessonBySubtopicId({
    trackerId,
    subtopicId,
    userId,
  }: Parameters<TrackerRepositoryContract["findLessonBySubtopicId"]>[0]) {
    return this.execute(
      "LESSON_READ_FAILED",
      "Failed to read lesson by subtopic",
      async () => {
        const lesson = await TrackerLesson.findOne(
          this.mapper.asMongoFilter({
            trackerId: this.mapper.toObjectId(trackerId),
            subtopicId: this.mapper.toObjectId(subtopicId),
            userId: this.mapper.toObjectId(userId),
            deletedAt: null,
          }),
        );

        return lesson as GeneratedTrackerLessonRecord | null;
      },
    );
  }

  async createLesson(
    data: Parameters<TrackerRepositoryContract["createLesson"]>[0],
  ) {
    return this.execute(
      "LESSON_CREATE_FAILED",
      "Failed to create lesson",
      async () => {
        const lesson = await TrackerLesson.create(
          this.mapper.asMongoCreatePayload({
            trackerId: this.mapper.toObjectId(data.trackerId),
            subtopicId: this.mapper.toObjectId(data.subtopicId),
            userId: this.mapper.toObjectId(data.userId),
            title: data.title,
            summary: data.summary,
            explanation: data.explanation,
            insight: data.insight,
            lessonType: data.lessonType,
            compilerRuntime: data.compilerRuntime ?? null,
            codeExample: data.codeExample,
            practiceTask: data.practiceTask,
            tags: data.tags,
            difficulty: data.difficulty,
            estimatedMinutes: data.estimatedMinutes,
            deletedAt: null,
          }),
        );

        return lesson as GeneratedTrackerLessonRecord;
      },
      MongoTrackerErrorMapper.mapDuplicateTrackerRecordError,
    );
  }

  async getLessonChatMessages({
    trackerId,
    subtopicId,
    userId,
    scope = "lesson_doubt_chat",
    questionId = null,
  }: Parameters<TrackerRepositoryContract["getLessonChatMessages"]>[0]) {
    return this.execute(
      "LESSON_CHAT_READ_FAILED",
      "Failed to read lesson chat messages",
      async () =>
        LessonChatMessage.find(
          this.mapper.asMongoFilter({
            trackerId: this.mapper.toObjectId(trackerId),
            subtopicId: this.mapper.toObjectId(subtopicId),
            userId: this.mapper.toObjectId(userId),
            scope,
            questionId,
            deletedAt: null,
          }),
        )
          .sort({ createdAt: 1 })
          .lean(),
    );
  }

  async createLessonChatMessage({
    trackerId,
    subtopicId,
    userId,
    lessonId,
    scope = "lesson_doubt_chat",
    questionId = null,
    role,
    content,
  }: Parameters<TrackerRepositoryContract["createLessonChatMessage"]>[0]) {
    return this.execute(
      "LESSON_CHAT_CREATE_FAILED",
      "Failed to create lesson chat message",
      async () =>
        LessonChatMessage.create(
          this.mapper.asMongoCreatePayload({
            trackerId: this.mapper.toObjectId(trackerId),
            subtopicId: this.mapper.toObjectId(subtopicId),
            userId: this.mapper.toObjectId(userId),
            lessonId: lessonId ? this.mapper.toObjectId(lessonId) : null,
            scope,
            questionId,
            role,
            content,
            deletedAt: null,
          }),
        ),
      MongoTrackerErrorMapper.mapDuplicateTrackerRecordError,
    );
  }

  async clearLessonChatMessages({
    trackerId,
    subtopicId,
    userId,
  }: Parameters<TrackerRepositoryContract["clearLessonChatMessages"]>[0]) {
    return this.execute(
      "LESSON_CHAT_CLEAR_FAILED",
      "Failed to clear lesson chat messages",
      async () =>
        LessonChatMessage.updateMany(
          this.mapper.asMongoFilter({
            trackerId: this.mapper.toObjectId(trackerId),
            subtopicId: this.mapper.toObjectId(subtopicId),
            userId: this.mapper.toObjectId(userId),
            deletedAt: null,
          }),
          this.mapper.asMongoUpdate({
            $set: {
              deletedAt: new Date(),
            },
          }),
        ),
    );
  }

  async getLessonAnswerAttempts({
    trackerId,
    subtopicId,
    userId,
    questionId = null,
  }: Parameters<TrackerRepositoryContract["getLessonAnswerAttempts"]>[0]) {
    return this.execute(
      "LESSON_ANSWER_ATTEMPT_READ_FAILED",
      "Failed to read lesson answer attempts",
      async () =>
        LessonAnswerAttempt.find(
          this.mapper.asMongoFilter({
            trackerId: this.mapper.toObjectId(trackerId),
            subtopicId: this.mapper.toObjectId(subtopicId),
            userId: this.mapper.toObjectId(userId),
            questionId,
            deletedAt: null,
          }),
        )
          .sort({ createdAt: -1 })
          .lean(),
    );
  }

  async createLessonAnswerAttempt({
    trackerId,
    subtopicId,
    userId,
    lessonId,
    questionId = null,
    question,
    answer,
    feedback,
    isCorrect,
    score,
  }: Parameters<TrackerRepositoryContract["createLessonAnswerAttempt"]>[0]) {
    return this.execute(
      "LESSON_ANSWER_ATTEMPT_CREATE_FAILED",
      "Failed to create lesson answer attempt",
      async () => {
        const previousAttempts = await LessonAnswerAttempt.countDocuments(
          this.mapper.asMongoFilter({
            trackerId: this.mapper.toObjectId(trackerId),
            subtopicId: this.mapper.toObjectId(subtopicId),
            userId: this.mapper.toObjectId(userId),
            questionId,
            deletedAt: null,
          }),
        );

        return LessonAnswerAttempt.create(
          this.mapper.asMongoCreatePayload({
            trackerId: this.mapper.toObjectId(trackerId),
            subtopicId: this.mapper.toObjectId(subtopicId),
            userId: this.mapper.toObjectId(userId),
            lessonId: lessonId ? this.mapper.toObjectId(lessonId) : null,
            questionId,
            question,
            answer,
            feedback,
            isCorrect,
            score,
            attemptNumber: previousAttempts + 1,
            deletedAt: null,
          }),
        );
      },
      MongoTrackerErrorMapper.mapDuplicateTrackerRecordError,
    );
  }

  async getLessonCodeSubmissions({
    trackerId,
    subtopicId,
    userId,
    action,
  }: Parameters<TrackerRepositoryContract["getLessonCodeSubmissions"]>[0]) {
    return this.execute(
      "LESSON_CODE_SUBMISSION_READ_FAILED",
      "Failed to read lesson code submissions",
      async () => {
        const query: MongoQuery = {
          trackerId: this.mapper.toObjectId(trackerId),
          subtopicId: this.mapper.toObjectId(subtopicId),
          userId: this.mapper.toObjectId(userId),
          deletedAt: null,
        };

        if (action) {
          query.action = action;
        }

        return LessonCodeSubmission.find(this.mapper.asMongoFilter(query))
          .sort({ createdAt: -1 })
          .limit(50)
          .lean();
      },
    );
  }

  async createLessonCodeSubmission({
    trackerId,
    subtopicId,
    userId,
    lessonId,
    questionId = null,
    action,
    language,
    languageId,
    sourceCode,
    stdin,
    stdout,
    stderr,
    compileOutput,
    message,
    status,
    time,
    memory,
    isCorrect,
    expectedOutput,
    actualOutput,
    feedback,
  }: Parameters<TrackerRepositoryContract["createLessonCodeSubmission"]>[0]) {
    return this.execute(
      "LESSON_CODE_SUBMISSION_CREATE_FAILED",
      "Failed to create lesson code submission",
      async () =>
        LessonCodeSubmission.create(
          this.mapper.asMongoCreatePayload({
            trackerId: this.mapper.toObjectId(trackerId),
            subtopicId: this.mapper.toObjectId(subtopicId),
            userId: this.mapper.toObjectId(userId),
            lessonId: lessonId ? this.mapper.toObjectId(lessonId) : null,
            questionId,
            action,
            language,
            languageId,
            sourceCode,
            stdin,
            stdout,
            stderr,
            compileOutput,
            message,
            status,
            time,
            memory,
            isCorrect,
            expectedOutput,
            actualOutput,
            feedback,
            deletedAt: null,
          }),
        ),
      MongoTrackerErrorMapper.mapDuplicateTrackerRecordError,
    );
  }

  async getLessonGeneratedQuestions({
    trackerId,
    subtopicId,
    userId,
  }: Parameters<TrackerRepositoryContract["getLessonGeneratedQuestions"]>[0]) {
    return this.execute(
      "LESSON_GENERATED_QUESTION_READ_FAILED",
      "Failed to read lesson generated questions",
      async () =>
        LessonGeneratedQuestion.find(
          this.mapper.asMongoFilter({
            trackerId: this.mapper.toObjectId(trackerId),
            subtopicId: this.mapper.toObjectId(subtopicId),
            userId: this.mapper.toObjectId(userId),
            deletedAt: null,
          }),
        )
          .sort({ createdAt: 1 })
          .lean(),
    );
  }

  async createLessonGeneratedQuestions({
    trackerId,
    subtopicId,
    userId,
    lessonId,
    questions,
  }: Parameters<
    TrackerRepositoryContract["createLessonGeneratedQuestions"]
  >[0]) {
    return this.execute(
      "LESSON_GENERATED_QUESTION_CREATE_FAILED",
      "Failed to create lesson generated questions",
      async () => {
        try {
          return await LessonGeneratedQuestion.insertMany(
            questions.map((item) =>
              this.mapper.asMongoCreatePayload({
                trackerId: this.mapper.toObjectId(trackerId),
                subtopicId: this.mapper.toObjectId(subtopicId),
                userId: this.mapper.toObjectId(userId),
                lessonId: lessonId ? this.mapper.toObjectId(lessonId) : null,
                question: item.question,
                questionHash: item.questionHash,
                source: item.source || "ai_generated",
                deletedAt: null,
              }),
            ),
            {
              ordered: false,
            },
          );
        } catch {
          return LessonGeneratedQuestion.find(
            this.mapper.asMongoFilter({
              trackerId: this.mapper.toObjectId(trackerId),
              subtopicId: this.mapper.toObjectId(subtopicId),
              userId: this.mapper.toObjectId(userId),
              questionHash: {
                $in: questions.map((item) => item.questionHash),
              },
              deletedAt: null,
            }),
          ).lean();
        }
      },
    );
  }

  async findLessonQuestionSolution({
    trackerId,
    subtopicId,
    userId,
    questionHash,
  }: Parameters<TrackerRepositoryContract["findLessonQuestionSolution"]>[0]) {
    return this.execute(
      "LESSON_QUESTION_SOLUTION_READ_FAILED",
      "Failed to read lesson question solution",
      async () =>
        LessonQuestionSolution.findOne(
          this.mapper.asMongoFilter({
            trackerId: this.mapper.toObjectId(trackerId),
            subtopicId: this.mapper.toObjectId(subtopicId),
            userId: this.mapper.toObjectId(userId),
            questionHash,
            deletedAt: null,
          }),
        ).lean(),
    );
  }

  async createLessonQuestionSolution({
    trackerId,
    subtopicId,
    userId,
    lessonId,
    question,
    questionHash,
    solution,
  }: Parameters<TrackerRepositoryContract["createLessonQuestionSolution"]>[0]) {
    return this.execute(
      "LESSON_QUESTION_SOLUTION_CREATE_FAILED",
      "Failed to create lesson question solution",
      async () =>
        LessonQuestionSolution.findOneAndUpdate(
          this.mapper.asMongoFilter({
            trackerId: this.mapper.toObjectId(trackerId),
            subtopicId: this.mapper.toObjectId(subtopicId),
            userId: this.mapper.toObjectId(userId),
            questionHash,
            deletedAt: null,
          }),
          this.mapper.asMongoUpdate({
            $setOnInsert: {
              trackerId: this.mapper.toObjectId(trackerId),
              subtopicId: this.mapper.toObjectId(subtopicId),
              userId: this.mapper.toObjectId(userId),
              lessonId: lessonId ? this.mapper.toObjectId(lessonId) : null,
              question,
              questionHash,
              solution,
              deletedAt: null,
            },
          }),
          {
            upsert: true,
            returnDocument: "after",
          },
        ).lean(),
      MongoTrackerErrorMapper.mapDuplicateTrackerRecordError,
    );
  }

  async getLessonQuestionSolutionDoubts({
    trackerId,
    subtopicId,
    userId,
    questionHash,
  }: Parameters<
    TrackerRepositoryContract["getLessonQuestionSolutionDoubts"]
  >[0]) {
    return this.execute(
      "LESSON_QUESTION_SOLUTION_DOUBT_READ_FAILED",
      "Failed to read lesson question solution doubts",
      async () =>
        LessonQuestionSolutionDoubt.find(
          this.mapper.asMongoFilter({
            trackerId: this.mapper.toObjectId(trackerId),
            subtopicId: this.mapper.toObjectId(subtopicId),
            userId: this.mapper.toObjectId(userId),
            questionHash,
            deletedAt: null,
          }),
        )
          .sort({ createdAt: 1 })
          .lean(),
    );
  }

  async createLessonQuestionSolutionDoubt({
    trackerId,
    subtopicId,
    userId,
    lessonId,
    solutionId,
    question,
    questionHash,
    role,
    content,
  }: Parameters<
    TrackerRepositoryContract["createLessonQuestionSolutionDoubt"]
  >[0]) {
    return this.execute(
      "LESSON_QUESTION_SOLUTION_DOUBT_CREATE_FAILED",
      "Failed to create lesson question solution doubt",
      async () =>
        LessonQuestionSolutionDoubt.create(
          this.mapper.asMongoCreatePayload({
            trackerId: this.mapper.toObjectId(trackerId),
            subtopicId: this.mapper.toObjectId(subtopicId),
            userId: this.mapper.toObjectId(userId),
            lessonId: lessonId ? this.mapper.toObjectId(lessonId) : null,
            solutionId: solutionId ? this.mapper.toObjectId(solutionId) : null,
            question,
            questionHash,
            role,
            content,
            deletedAt: null,
          }),
        ),
      MongoTrackerErrorMapper.mapDuplicateTrackerRecordError,
    );
  }

  async clearLessonQuestionSolutionDoubts({
    trackerId,
    subtopicId,
    userId,
    questionHash,
  }: Parameters<
    TrackerRepositoryContract["clearLessonQuestionSolutionDoubts"]
  >[0]) {
    return this.execute(
      "LESSON_QUESTION_SOLUTION_DOUBT_CLEAR_FAILED",
      "Failed to clear lesson question solution doubts",
      async () =>
        LessonQuestionSolutionDoubt.updateMany(
          this.mapper.asMongoFilter({
            trackerId: this.mapper.toObjectId(trackerId),
            subtopicId: this.mapper.toObjectId(subtopicId),
            userId: this.mapper.toObjectId(userId),
            questionHash,
            deletedAt: null,
          }),
          this.mapper.asMongoUpdate({
            $set: {
              deletedAt: new Date(),
            },
          }),
        ),
    );
  }

  async findGeneratedLessonBySubtopic({
    trackerId,
    subtopicId,
    userId,
  }: Parameters<
    TrackerRepositoryContract["findGeneratedLessonBySubtopic"]
  >[0]) {
    return this.execute(
      "LESSON_READ_FAILED",
      "Failed to read generated lesson by subtopic",
      async () => {
        const tracker = await Tracker.findOne(
          this.mapper.asMongoFilter({
            _id: this.mapper.toObjectId(trackerId),
            ownerId: this.mapper.toObjectId(userId),
            deletedAt: null,
          }),
        ).lean();

        if (!tracker) {
          return null;
        }

        const lesson = await TrackerLesson.findOne(
          this.mapper.asMongoFilter({
            trackerId: this.mapper.toObjectId(trackerId),
            subtopicId: this.mapper.toObjectId(subtopicId),
            userId: this.mapper.toObjectId(userId),
            deletedAt: null,
          }),
        ).lean<MongoGeneratedLessonRecord>();

        return lesson?.generatedLesson ?? null;
      },
    );
  }

  async findLessonVisualization({
    trackerId,
    subtopicId,
    userId,
  }: Parameters<TrackerRepositoryContract["findLessonVisualization"]>[0]) {
    return this.execute(
      "LESSON_VISUALIZATION_READ_FAILED",
      "Failed to read lesson visualization",
      async () => {
        const doc = await LessonVisualization.findOne(
          this.mapper.asMongoFilter({
            trackerId: this.mapper.toObjectId(trackerId),
            subtopicId: this.mapper.toObjectId(subtopicId),
            userId: this.mapper.toObjectId(userId),
            deletedAt: null,
          }),
        ).lean();

        return this.mapper.toLessonVisualizationView(doc);
      },
    );
  }

  async saveLessonVisualization({
    trackerId,
    subtopicId,
    userId,
    lessonId,
    html,
    visualTitle,
    visualDescription,
  }: Parameters<TrackerRepositoryContract["saveLessonVisualization"]>[0]) {
    return this.execute(
      "LESSON_VISUALIZATION_SAVE_FAILED",
      "Failed to save lesson visualization",
      async () =>
        LessonVisualization.findOneAndUpdate(
          this.mapper.asMongoFilter({
            trackerId: this.mapper.toObjectId(trackerId),
            subtopicId: this.mapper.toObjectId(subtopicId),
            userId: this.mapper.toObjectId(userId),
          }),
          this.mapper.asMongoUpdate({
            $set: {
              lessonId: lessonId ? this.mapper.toObjectId(lessonId) : null,
              html,
              visualTitle,
              visualDescription,
              deletedAt: null,
            },
            $setOnInsert: {
              trackerId: this.mapper.toObjectId(trackerId),
              subtopicId: this.mapper.toObjectId(subtopicId),
              userId: this.mapper.toObjectId(userId),
            },
          }),
          {
            upsert: true,
            returnDocument: "after",
          },
        ),
      MongoTrackerErrorMapper.mapDuplicateTrackerRecordError,
    );
  }
}

export const mongoTrackerLessonRepository = new MongoTrackerLessonRepository();
