import { LessonAnswerAttempt } from '../../../../../../infrastructure/database/models/lesson-answer-attempt.model';
import { LessonChatMessage } from '../../../../../../infrastructure/database/models/lesson-chat-message.model';
import { LessonCodeSubmission } from '../../../../../../infrastructure/database/models/lesson-code-submission.model';
import { LessonGeneratedQuestion } from '../../../../../../infrastructure/database/models/lesson-generated-question.model';
import { LessonQuestionSolution } from '../../../../../../infrastructure/database/models/lesson-question-solution.model';
import { LessonQuestionSolutionDoubt } from '../../../../../../infrastructure/database/models/lesson-question-solution-doubt.model';
import { LessonVisualization } from '../../../../../../infrastructure/database/models/lesson-visualization.model';
import { Tracker } from '../../../../../../infrastructure/database/models/tracker.model';
import { TrackerLesson } from '../../../../../../infrastructure/database/models/tracker-lesson.model';
import { TrackerSubtopic } from '../../../../../../infrastructure/database/models/tracker-subtopic.model';
import type {
  LessonAnswerAttemptRecord,
  LessonChatMessageRecord,
  LessonCodeSubmissionRecord,
  LessonGeneratedQuestionRecord,
  LessonQuestionSolutionDoubtRecord,
  LessonQuestionSolutionRecord,
  LessonVisualizationRecord,
} from '../../../domain/repositories/tracker-lesson.repository.interface';
import type { ITrackerRepository } from '../../../domain/repositories/tracker.repository.interface';
import type { GeneratedTrackerLessonRecord } from '../../../domain/trackers.types';
import { MongoTrackerBaseRepository } from '../shared/mongo-tracker-base.repository';
import { MongoTrackerMapper } from '../shared/mongo-tracker.mapper';
import { MongoTrackerErrorMapper } from '../shared/mongo-tracker-error.mapper';
import type { MongoGeneratedLessonRecord, MongoQuery } from '../shared/mongo-tracker.types';

export class MongoTrackerLessonRepository extends MongoTrackerBaseRepository {
  constructor(protected readonly mapper = new MongoTrackerMapper()) {
    super();
  }
  async findLessonBySubtopicId({
    trackerId,
    subtopicId,
    userId: _userId,
  }: Parameters<ITrackerRepository['findLessonBySubtopicId']>[0]) {
    return this.execute('LESSON_READ_FAILED', 'Failed to read lesson by subtopic', async () => {
      const contentKey = await this.resolveLessonContentKey(trackerId, subtopicId);
      let lesson = await TrackerLesson.findOne({ contentKey, deletedAt: null });
      if (!lesson) {
        const [canonicalTrackerId, canonicalSubtopicId] = contentKey.split(':');
        lesson = await TrackerLesson.findOne({
          $or: [
            {
              trackerId: this.mapper.toObjectId(canonicalTrackerId ?? trackerId),
              subtopicId: this.mapper.toObjectId(canonicalSubtopicId ?? subtopicId),
            },
            {
              trackerId: this.mapper.toObjectId(trackerId),
              subtopicId: this.mapper.toObjectId(subtopicId),
            },
          ],
          deletedAt: null,
        }).sort({ createdAt: 1 });
        if (lesson && !lesson.contentKey) {
          try {
            lesson = await TrackerLesson.findOneAndUpdate(
              { _id: lesson._id, contentKey: null },
              { $set: { contentKey } },
              { returnDocument: 'after' }
            );
          } catch {
            lesson = await TrackerLesson.findOne({ contentKey, deletedAt: null });
          }
        }
      }

      return lesson ? this.mapper.toDomainRecord<GeneratedTrackerLessonRecord>(lesson) : null;
    });
  }

  async createLesson(data: Parameters<ITrackerRepository['createLesson']>[0]) {
    return this.execute(
      'LESSON_CREATE_FAILED',
      'Failed to create lesson',
      async () => {
        const contentKey = await this.resolveLessonContentKey(data.trackerId, data.subtopicId);
        const lesson = await TrackerLesson.findOneAndUpdate(
          { contentKey },
          {
            $setOnInsert: this.mapper.asMongoCreatePayload({
              trackerId: this.mapper.toObjectId(data.trackerId),
              subtopicId: this.mapper.toObjectId(data.subtopicId),
              userId: this.mapper.toObjectId(data.userId),
              contentKey,
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
              visualization: data.visualization,
              deletedAt: null,
            }),
          },
          { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );

        return this.mapper.toDomainRecord<GeneratedTrackerLessonRecord>(lesson);
      },
      MongoTrackerErrorMapper.mapDuplicateTrackerRecordError
    );
  }

  private async resolveLessonContentKey(trackerId: string, subtopicId: string) {
    const trackerObjectId = this.mapper.toObjectId(trackerId);
    const subtopicObjectId = this.mapper.toObjectId(subtopicId);
    const [tracker, subtopic] = await Promise.all([
      Tracker.findOne({ _id: trackerObjectId, deletedAt: null })
        .select('_id sourceTrackerId')
        .lean<{ _id: unknown; sourceTrackerId?: unknown | null }>(),
      TrackerSubtopic.findOne({
        _id: subtopicObjectId,
        trackerId: trackerObjectId,
        deletedAt: null,
      })
        .select('_id sourceSubtopicId')
        .lean<{ _id: unknown; sourceSubtopicId?: unknown | null }>(),
    ]);
    const canonicalTrackerId = tracker?.sourceTrackerId ?? tracker?._id ?? trackerObjectId;
    const canonicalSubtopicId = subtopic?.sourceSubtopicId ?? subtopic?._id ?? subtopicObjectId;
    return `${String(canonicalTrackerId)}:${String(canonicalSubtopicId)}`;
  }

  async getLessonChatMessages({
    trackerId,
    subtopicId,
    userId,
    scope = 'lesson_doubt_chat',
    questionId = null,
  }: Parameters<ITrackerRepository['getLessonChatMessages']>[0]) {
    return this.execute(
      'LESSON_CHAT_READ_FAILED',
      'Failed to read lesson chat messages',
      async () => {
        const messages = await LessonChatMessage.find(
          this.mapper.asMongoFilter({
            trackerId: this.mapper.toObjectId(trackerId),
            subtopicId: this.mapper.toObjectId(subtopicId),
            userId: this.mapper.toObjectId(userId),
            scope,
            questionId,
            deletedAt: null,
          })
        )
          .sort({ createdAt: 1 })
          .lean();

        return this.mapper.toDomainRecord<LessonChatMessageRecord[]>(messages);
      }
    );
  }

  async createLessonChatMessage({
    trackerId,
    subtopicId,
    userId,
    lessonId,
    scope = 'lesson_doubt_chat',
    questionId = null,
    role,
    content,
  }: Parameters<ITrackerRepository['createLessonChatMessage']>[0]) {
    return this.execute(
      'LESSON_CHAT_CREATE_FAILED',
      'Failed to create lesson chat message',
      async () => {
        const message = await LessonChatMessage.create(
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
          })
        );

        return this.mapper.toDomainRecord<LessonChatMessageRecord>(message);
      },
      MongoTrackerErrorMapper.mapDuplicateTrackerRecordError
    );
  }

  async clearLessonChatMessages({
    trackerId,
    subtopicId,
    userId,
  }: Parameters<ITrackerRepository['clearLessonChatMessages']>[0]) {
    return this.execute(
      'LESSON_CHAT_CLEAR_FAILED',
      'Failed to clear lesson chat messages',
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
          })
        )
    );
  }

  async getLessonAnswerAttempts({
    trackerId,
    subtopicId,
    userId,
    questionId = null,
  }: Parameters<ITrackerRepository['getLessonAnswerAttempts']>[0]) {
    return this.execute(
      'LESSON_ANSWER_ATTEMPT_READ_FAILED',
      'Failed to read lesson answer attempts',
      async () => {
        const attempts = await LessonAnswerAttempt.find(
          this.mapper.asMongoFilter({
            trackerId: this.mapper.toObjectId(trackerId),
            subtopicId: this.mapper.toObjectId(subtopicId),
            userId: this.mapper.toObjectId(userId),
            questionId,
            deletedAt: null,
          })
        )
          .sort({ createdAt: -1 })
          .lean();

        return this.mapper.toDomainRecord<LessonAnswerAttemptRecord[]>(attempts);
      }
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
  }: Parameters<ITrackerRepository['createLessonAnswerAttempt']>[0]) {
    return this.execute(
      'LESSON_ANSWER_ATTEMPT_CREATE_FAILED',
      'Failed to create lesson answer attempt',
      async () => {
        const previousAttempts = await LessonAnswerAttempt.countDocuments(
          this.mapper.asMongoFilter({
            trackerId: this.mapper.toObjectId(trackerId),
            subtopicId: this.mapper.toObjectId(subtopicId),
            userId: this.mapper.toObjectId(userId),
            questionId,
            deletedAt: null,
          })
        );

        const attempt = await LessonAnswerAttempt.create(
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
          })
        );

        return this.mapper.toDomainRecord<LessonAnswerAttemptRecord>(attempt);
      },
      MongoTrackerErrorMapper.mapDuplicateTrackerRecordError
    );
  }

  async getLessonCodeSubmissions({
    trackerId,
    subtopicId,
    userId,
    action,
  }: Parameters<ITrackerRepository['getLessonCodeSubmissions']>[0]) {
    return this.execute(
      'LESSON_CODE_SUBMISSION_READ_FAILED',
      'Failed to read lesson code submissions',
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

        const submissions = await LessonCodeSubmission.find(this.mapper.asMongoFilter(query))
          .sort({ createdAt: -1 })
          .limit(50)
          .lean();

        return this.mapper.toDomainRecord<LessonCodeSubmissionRecord[]>(submissions);
      }
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
  }: Parameters<ITrackerRepository['createLessonCodeSubmission']>[0]) {
    return this.execute(
      'LESSON_CODE_SUBMISSION_CREATE_FAILED',
      'Failed to create lesson code submission',
      async () => {
        const submission = await LessonCodeSubmission.create(
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
          })
        );

        return this.mapper.toDomainRecord<LessonCodeSubmissionRecord>(submission);
      },
      MongoTrackerErrorMapper.mapDuplicateTrackerRecordError
    );
  }

  async getLessonGeneratedQuestions({
    trackerId,
    subtopicId,
    userId,
  }: Parameters<ITrackerRepository['getLessonGeneratedQuestions']>[0]) {
    return this.execute(
      'LESSON_GENERATED_QUESTION_READ_FAILED',
      'Failed to read lesson generated questions',
      async () => {
        const questions = await LessonGeneratedQuestion.find(
          this.mapper.asMongoFilter({
            trackerId: this.mapper.toObjectId(trackerId),
            subtopicId: this.mapper.toObjectId(subtopicId),
            userId: this.mapper.toObjectId(userId),
            deletedAt: null,
          })
        )
          .sort({ createdAt: 1 })
          .lean();

        return this.mapper.toDomainRecord<LessonGeneratedQuestionRecord[]>(questions);
      }
    );
  }

  async createLessonGeneratedQuestions({
    trackerId,
    subtopicId,
    userId,
    lessonId,
    questions,
  }: Parameters<ITrackerRepository['createLessonGeneratedQuestions']>[0]) {
    return this.execute(
      'LESSON_GENERATED_QUESTION_CREATE_FAILED',
      'Failed to create lesson generated questions',
      async () => {
        try {
          const created = await LessonGeneratedQuestion.insertMany(
            questions.map((item) =>
              this.mapper.asMongoCreatePayload({
                trackerId: this.mapper.toObjectId(trackerId),
                subtopicId: this.mapper.toObjectId(subtopicId),
                userId: this.mapper.toObjectId(userId),
                lessonId: lessonId ? this.mapper.toObjectId(lessonId) : null,
                question: item.question,
                questionHash: item.questionHash,
                source: item.source || 'ai_generated',
                deletedAt: null,
              })
            ),
            {
              ordered: false,
            }
          );

          return this.mapper.toDomainRecord<LessonGeneratedQuestionRecord[]>(created);
        } catch {
          const existing = await LessonGeneratedQuestion.find(
            this.mapper.asMongoFilter({
              trackerId: this.mapper.toObjectId(trackerId),
              subtopicId: this.mapper.toObjectId(subtopicId),
              userId: this.mapper.toObjectId(userId),
              questionHash: {
                $in: questions.map((item) => item.questionHash),
              },
              deletedAt: null,
            })
          ).lean();

          return this.mapper.toDomainRecord<LessonGeneratedQuestionRecord[]>(existing);
        }
      }
    );
  }

  async findLessonQuestionSolution({
    trackerId,
    subtopicId,
    userId,
    questionHash,
  }: Parameters<ITrackerRepository['findLessonQuestionSolution']>[0]) {
    return this.execute(
      'LESSON_QUESTION_SOLUTION_READ_FAILED',
      'Failed to read lesson question solution',
      async () => {
        const solution = await LessonQuestionSolution.findOne(
          this.mapper.asMongoFilter({
            trackerId: this.mapper.toObjectId(trackerId),
            subtopicId: this.mapper.toObjectId(subtopicId),
            userId: this.mapper.toObjectId(userId),
            questionHash,
            deletedAt: null,
          })
        ).lean();

        return solution ? this.mapper.toDomainRecord<LessonQuestionSolutionRecord>(solution) : null;
      }
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
  }: Parameters<ITrackerRepository['createLessonQuestionSolution']>[0]) {
    return this.execute(
      'LESSON_QUESTION_SOLUTION_CREATE_FAILED',
      'Failed to create lesson question solution',
      async () => {
        const savedSolution = await LessonQuestionSolution.findOneAndUpdate(
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
            returnDocument: 'after',
          }
        ).lean();

        return this.mapper.toDomainRecord<LessonQuestionSolutionRecord>(savedSolution);
      },
      MongoTrackerErrorMapper.mapDuplicateTrackerRecordError
    );
  }

  async getLessonQuestionSolutionDoubts({
    trackerId,
    subtopicId,
    userId,
    questionHash,
  }: Parameters<ITrackerRepository['getLessonQuestionSolutionDoubts']>[0]) {
    return this.execute(
      'LESSON_QUESTION_SOLUTION_DOUBT_READ_FAILED',
      'Failed to read lesson question solution doubts',
      async () => {
        const doubts = await LessonQuestionSolutionDoubt.find(
          this.mapper.asMongoFilter({
            trackerId: this.mapper.toObjectId(trackerId),
            subtopicId: this.mapper.toObjectId(subtopicId),
            userId: this.mapper.toObjectId(userId),
            questionHash,
            deletedAt: null,
          })
        )
          .sort({ createdAt: 1 })
          .lean();

        return this.mapper.toDomainRecord<LessonQuestionSolutionDoubtRecord[]>(doubts);
      }
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
  }: Parameters<ITrackerRepository['createLessonQuestionSolutionDoubt']>[0]) {
    return this.execute(
      'LESSON_QUESTION_SOLUTION_DOUBT_CREATE_FAILED',
      'Failed to create lesson question solution doubt',
      async () => {
        const doubt = await LessonQuestionSolutionDoubt.create(
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
          })
        );

        return this.mapper.toDomainRecord<LessonQuestionSolutionDoubtRecord>(doubt);
      },
      MongoTrackerErrorMapper.mapDuplicateTrackerRecordError
    );
  }

  async clearLessonQuestionSolutionDoubts({
    trackerId,
    subtopicId,
    userId,
    questionHash,
  }: Parameters<ITrackerRepository['clearLessonQuestionSolutionDoubts']>[0]) {
    return this.execute(
      'LESSON_QUESTION_SOLUTION_DOUBT_CLEAR_FAILED',
      'Failed to clear lesson question solution doubts',
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
          })
        )
    );
  }

  async findGeneratedLessonBySubtopic({
    trackerId,
    subtopicId,
    userId,
  }: Parameters<ITrackerRepository['findGeneratedLessonBySubtopic']>[0]) {
    return this.execute(
      'LESSON_READ_FAILED',
      'Failed to read generated lesson by subtopic',
      async () => {
        const tracker = await Tracker.findOne(
          this.mapper.asMongoFilter({
            _id: this.mapper.toObjectId(trackerId),
            ownerId: this.mapper.toObjectId(userId),
            deletedAt: null,
          })
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
          })
        ).lean<MongoGeneratedLessonRecord>();

        return lesson?.generatedLesson ?? null;
      }
    );
  }

  async findLessonVisualization({
    trackerId,
    subtopicId,
  }: Parameters<ITrackerRepository['findLessonVisualization']>[0]) {
    return this.execute(
      'LESSON_VISUALIZATION_READ_FAILED',
      'Failed to read lesson visualization',
      async () => {
        const contentKey = await this.resolveLessonContentKey(trackerId, subtopicId);
        let doc = await LessonVisualization.findOne({ contentKey, deletedAt: null });

        if (!doc) {
          const [canonicalTrackerId, canonicalSubtopicId] = contentKey.split(':');
          doc = await LessonVisualization.findOne({
            $or: [
              {
                trackerId: this.mapper.toObjectId(canonicalTrackerId ?? trackerId),
                subtopicId: this.mapper.toObjectId(canonicalSubtopicId ?? subtopicId),
              },
              {
                trackerId: this.mapper.toObjectId(trackerId),
                subtopicId: this.mapper.toObjectId(subtopicId),
              },
            ],
            deletedAt: null,
          }).sort({ createdAt: 1 });

          if (doc && !doc.contentKey) {
            try {
              doc = await LessonVisualization.findOneAndUpdate(
                { _id: doc._id, contentKey: null },
                { $set: { contentKey } },
                { returnDocument: 'after' }
              );
            } catch {
              doc = await LessonVisualization.findOne({ contentKey, deletedAt: null });
            }
          }
        }

        return this.mapper.toLessonVisualizationView(doc);
      }
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
  }: Parameters<ITrackerRepository['saveLessonVisualization']>[0]) {
    return this.execute(
      'LESSON_VISUALIZATION_SAVE_FAILED',
      'Failed to save lesson visualization',
      async () => {
        const contentKey = await this.resolveLessonContentKey(trackerId, subtopicId);
        const [canonicalTrackerId, canonicalSubtopicId] = contentKey.split(':');
        const visualization = await LessonVisualization.findOneAndUpdate(
          { contentKey },
          this.mapper.asMongoUpdate({
            $set: {
              lessonId: lessonId ? this.mapper.toObjectId(lessonId) : null,
              html,
              visualTitle,
              visualDescription,
              deletedAt: null,
            },
            $setOnInsert: {
              trackerId: this.mapper.toObjectId(canonicalTrackerId ?? trackerId),
              subtopicId: this.mapper.toObjectId(canonicalSubtopicId ?? subtopicId),
              userId: this.mapper.toObjectId(userId),
              contentKey,
            },
          }),
          {
            upsert: true,
            returnDocument: 'after',
          }
        );

        return this.mapper.toDomainRecord<LessonVisualizationRecord>(visualization);
      },
      MongoTrackerErrorMapper.mapDuplicateTrackerRecordError
    );
  }
}

export const mongoTrackerLessonRepository = new MongoTrackerLessonRepository();
