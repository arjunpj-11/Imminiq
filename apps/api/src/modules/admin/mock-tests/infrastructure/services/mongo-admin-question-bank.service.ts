import { QuestionBankModel } from '../../../../../infrastructure/database/models/question-bank.model';
import { MockTestModel } from '../../../../../infrastructure/database/models/mock-test.model';
import { MockTestQuestionModel } from '../../../../../infrastructure/database/models/mock-test-question.model';
import { MockTestAnswerModel } from '../../../../../infrastructure/database/models/mock-test-answer.model';
import { MockTestAttemptModel } from '../../../../../infrastructure/database/models/mock-test-attempt.model';
import {
  createAdminPage,
  escapeAdminSearch,
  recordAdminAction,
} from '../../../../../infrastructure/admin';
import { ServiceError } from '../../../../../shared/errors/service.error';
import type {
  AdminQuestionBankMutationInput,
  AdminQuestionBankQuery,
  IAdminQuestionBankService,
} from '../../application/admin-question-bank.service';

export class MongoAdminQuestionBankService implements IAdminQuestionBankService {
  async list(query: AdminQuestionBankQuery) {
    const filter: Record<string, unknown> = { deletedAt: null };
    if (query.search) {
      const search = new RegExp(escapeAdminSearch(query.search), 'i');
      const bankId = /^#?\d+$/.test(query.search.trim())
        ? Number(query.search.trim().replace(/^#/, ''))
        : null;
      filter.$or = [
        { question: search },
        { topic: search },
        ...(bankId == null ? [] : [{ bankId }]),
      ];
    }
    if (query.topic) filter.topic = new RegExp(`^${escapeAdminSearch(query.topic)}$`, 'i');
    if (query.type && query.type !== 'all') filter.type = query.type;
    if (query.difficulty && query.difficulty !== 'all') filter.difficulty = query.difficulty;

    const [questions, total, activeQuestions, topics, usage] = await Promise.all([
      QuestionBankModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .lean(),
      QuestionBankModel.countDocuments(filter),
      QuestionBankModel.countDocuments({ deletedAt: null }),
      QuestionBankModel.distinct('topic', { deletedAt: null }),
      MockTestQuestionModel.aggregate<{ _id: number; count: number }>([
        { $match: { bankId: { $ne: null }, deletedAt: null } },
        { $group: { _id: '$bankId', count: { $sum: 1 } } },
      ]),
    ]);
    const usageByBankId = new Map(usage.map((row) => [row._id, row.count]));
    return createAdminPage(
      questions.map((question) => ({
        id: String(question._id),
        bankId: question.bankId,
        topic: question.topic,
        type: question.type,
        question: question.question,
        difficulty: question.difficulty ?? 'medium',
        points: question.points ?? 1,
        usageCount: usageByBankId.get(question.bankId) ?? 0,
        createdAt: question.createdAt,
      })),
      query,
      total,
      { activeQuestions, topicCount: topics.length }
    );
  }

  async get(bankId: number) {
    const question = await QuestionBankModel.findOne({ bankId, deletedAt: null }).lean();
    if (!question) {
      throw new ServiceError(
        'missing-resource',
        'QUESTION_NOT_FOUND',
        'Question bank item not found'
      );
    }

    const linkedQuestions = await MockTestQuestionModel.find({
      $or: [
        { bankId },
        {
          bankId: null,
          type: question.type,
          question: question.question,
          correctAnswer: question.correctAnswer,
        },
      ],
    })
      .select('_id testId')
      .lean<Array<{ _id: unknown; testId: unknown }>>();
    const questionIds = linkedQuestions.map((item) => item._id);
    const testIds = new Set(linkedQuestions.map((item) => String(item.testId)));
    const [answerStats, flagCount] = questionIds.length
      ? await Promise.all([
          MockTestAnswerModel.aggregate<{
            _id: null;
            attemptCount: number;
            correctCount: number;
            incorrectCount: number;
            pendingEvaluationCount: number;
            learnerIds: unknown[];
          }>([
            { $match: { questionId: { $in: questionIds } } },
            {
              $lookup: {
                from: 'mocktestattempts',
                localField: 'attemptId',
                foreignField: '_id',
                as: 'attempt',
              },
            },
            { $unwind: { path: '$attempt', preserveNullAndEmptyArrays: true } },
            {
              $group: {
                _id: null,
                attemptCount: { $sum: 1 },
                correctCount: { $sum: { $cond: [{ $eq: ['$isCorrect', true] }, 1, 0] } },
                incorrectCount: { $sum: { $cond: [{ $eq: ['$isCorrect', false] }, 1, 0] } },
                pendingEvaluationCount: {
                  $sum: { $cond: [{ $eq: [{ $type: '$isCorrect' }, 'missing'] }, 1, 0] },
                },
                learnerIds: { $addToSet: '$attempt.userId' },
              },
            },
          ]),
          MockTestAttemptModel.countDocuments({ flaggedQuestions: { $in: questionIds } }),
        ])
      : ([[], 0] as const);
    const stats = answerStats[0];

    return {
      id: String(question._id),
      bankId: question.bankId,
      topic: question.topic,
      type: question.type,
      question: question.question,
      ...(question.options?.length ? { options: question.options } : {}),
      ...(question.correctAnswer ? { correctAnswer: question.correctAnswer } : {}),
      ...(question.explanation ? { explanation: question.explanation } : {}),
      ...(question.coding ? { coding: question.coding as unknown as Record<string, unknown> } : {}),
      difficulty: question.difficulty ?? 'medium',
      points: question.points ?? 1,
      usageCount: testIds.size,
      attemptCount: stats?.attemptCount ?? 0,
      uniqueLearnerCount: stats?.learnerIds.filter(Boolean).length ?? 0,
      correctCount: stats?.correctCount ?? 0,
      incorrectCount: stats?.incorrectCount ?? 0,
      pendingEvaluationCount: stats?.pendingEvaluationCount ?? 0,
      flagCount,
      createdAt: question.createdAt,
    };
  }

  async remove({ bankId, reason, actor }: AdminQuestionBankMutationInput) {
    const question = await QuestionBankModel.findOne({ bankId, deletedAt: null }).lean();
    if (!question) {
      throw new ServiceError(
        'missing-resource',
        'QUESTION_NOT_FOUND',
        'Question bank item not found'
      );
    }

    const linkedQuestions = await MockTestQuestionModel.find({
      deletedAt: null,
      $or: [
        { bankId },
        {
          bankId: null,
          type: question.type,
          question: question.question,
          correctAnswer: question.correctAnswer,
        },
      ],
    })
      .select('_id testId')
      .lean<Array<{ _id: unknown; testId: unknown }>>();
    const testIds = [...new Set(linkedQuestions.map((item) => String(item.testId)))];
    const now = new Date();

    await QuestionBankModel.updateOne(
      { bankId, deletedAt: null },
      { $set: { deletedAt: now, deletedBy: actor.userId, deletionReason: reason } }
    );
    if (linkedQuestions.length) {
      await MockTestQuestionModel.updateMany(
        { _id: { $in: linkedQuestions.map((item) => item._id) } },
        {
          $set: {
            bankId,
            deletedAt: now,
            moderationStatus: 'disabled',
            moderationReason: `Removed from question bank: ${reason}`,
            moderatedBy: actor.userId,
            disabledAt: now,
          },
        }
      );
    }

    await Promise.all(
      testIds.map(async (testId) => {
        const questionCount = await MockTestQuestionModel.countDocuments({
          testId,
          deletedAt: null,
          moderationStatus: { $in: ['active', null] },
        });
        await MockTestModel.updateOne(
          { _id: testId },
          {
            $set: {
              questionCount,
              ...(questionCount === 0
                ? {
                    moderationStatus: 'suspended',
                    moderationReason: 'All questions were removed during question-bank moderation.',
                    suspendedAt: now,
                  }
                : {}),
            },
          }
        );
      })
    );

    await recordAdminAction(actor, 'question_bank.deleted', 'admin.mock-tests', {
      bankId,
      reason,
      removedFromTests: linkedQuestions.length,
      affectedTests: testIds.length,
    });
    return { bankId, removedFromTests: linkedQuestions.length, affectedTests: testIds.length };
  }

  async restore({ bankId, reason, actor }: AdminQuestionBankMutationInput) {
    const question = await QuestionBankModel.findOne({ bankId, deletedAt: { $ne: null } }).lean();
    if (!question) {
      throw new ServiceError(
        'missing-resource',
        'QUESTION_NOT_FOUND',
        'Disabled question bank item not found'
      );
    }

    const linkedQuestions = await MockTestQuestionModel.find({ bankId })
      .select('_id testId')
      .lean<Array<{ _id: unknown; testId: unknown }>>();
    const testIds = [...new Set(linkedQuestions.map((item) => String(item.testId)))];

    await QuestionBankModel.updateOne(
      { bankId, deletedAt: { $ne: null } },
      {
        $set: { deletedAt: null, deletedBy: null },
        $unset: { deletionReason: '' },
      }
    );
    if (linkedQuestions.length) {
      await MockTestQuestionModel.updateMany(
        { _id: { $in: linkedQuestions.map((item) => item._id) } },
        {
          $set: { deletedAt: null, moderationStatus: 'active' },
          $unset: {
            moderationReason: '',
            moderatedBy: '',
            disabledAt: '',
          },
        }
      );
    }

    await Promise.all(
      testIds.map(async (testId) => {
        const [questionCount, test] = await Promise.all([
          MockTestQuestionModel.countDocuments({
            testId,
            deletedAt: null,
            moderationStatus: { $in: ['active', null] },
          }),
          MockTestModel.findById(testId).select('moderationStatus moderationReason').lean(),
        ]);
        const wasAutomaticallySuspended =
          test?.moderationStatus === 'suspended' &&
          test.moderationReason === 'All questions were removed during question-bank moderation.';
        await MockTestModel.updateOne(
          { _id: testId },
          {
            $set: {
              questionCount,
              ...(wasAutomaticallySuspended ? { moderationStatus: 'active' } : {}),
            },
            ...(wasAutomaticallySuspended
              ? { $unset: { moderationReason: '', suspendedAt: '' } }
              : {}),
          }
        );
      })
    );

    await recordAdminAction(actor, 'question_bank.restored', 'admin.mock-tests', {
      bankId,
      reason,
      restoredInTests: linkedQuestions.length,
      affectedTests: testIds.length,
    });
    return { bankId, restoredInTests: linkedQuestions.length, affectedTests: testIds.length };
  }
}

export const mongoAdminQuestionBankService = new MongoAdminQuestionBankService();
