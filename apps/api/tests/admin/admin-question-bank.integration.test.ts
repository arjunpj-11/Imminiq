import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { QuestionBankModel } from '../../src/infrastructure/database/models/question-bank.model';
import { MockTestModel } from '../../src/infrastructure/database/models/mock-test.model';
import { MockTestQuestionModel } from '../../src/infrastructure/database/models/mock-test-question.model';
import { MockTestAttemptModel } from '../../src/infrastructure/database/models/mock-test-attempt.model';
import { MockTestAnswerModel } from '../../src/infrastructure/database/models/mock-test-answer.model';
import { User } from '../../src/infrastructure/database/models/user.model';
import { MongoAdminQuestionBankService } from '../../src/modules/admin/mock-tests/infrastructure/services/mongo-admin-question-bank.service';
import { MongoAdminMockTestsRepository } from '../../src/modules/admin/mock-tests/infrastructure/repositories/mongo-admin-mock-tests.repository';

describe('admin question bank', () => {
  let mongo: MongoMemoryServer;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  it('soft deletes a bank question, removes active test copies, and preserves attempt history', async () => {
    const owner = await User.create({
      fullName: 'Question Owner',
      username: 'question-owner',
      passwordHash: null,
      emailVerified: true,
    });
    const bankQuestion = await QuestionBankModel.create({
      bankId: 701,
      topic: 'TypeScript',
      type: 'mcq',
      question: 'Which keyword narrows an unknown value?',
      options: ['typeof', 'yield'],
      correctAnswer: 'typeof',
      difficulty: 'easy',
      points: 1,
    });
    const test = await MockTestModel.create({
      ownerId: owner._id,
      title: 'TypeScript Basics',
      difficulty: 'easy',
      questionCount: 1,
    });
    const testQuestion = await MockTestQuestionModel.create({
      testId: test._id,
      type: bankQuestion.type,
      question: bankQuestion.question,
      options: bankQuestion.options,
      correctAnswer: bankQuestion.correctAnswer,
      difficulty: bankQuestion.difficulty,
      order: 1,
      points: 1,
    });
    const attempt = await MockTestAttemptModel.create({
      testId: test._id,
      userId: owner._id,
      status: 'completed',
      totalQuestions: 1,
      answeredQuestions: 1,
      flaggedQuestions: [testQuestion._id],
      questionSnapshot: [{ _id: String(testQuestion._id), question: testQuestion.question }],
    });
    await MockTestAnswerModel.create({
      attemptId: attempt._id,
      questionId: testQuestion._id,
      answer: 'typeof',
      isCorrect: true,
    });
    const service = new MongoAdminQuestionBankService();
    const actor = {
      userId: owner.id,
      role: 'superadmin' as const,
      ipAddress: '127.0.0.1',
      userAgent: 'vitest',
    };
    const detail = await new MongoAdminMockTestsRepository().getDetail(String(test._id));

    expect(detail?.questions[0]).toMatchObject({ bankId: 701 });
    await expect(MockTestQuestionModel.findById(testQuestion._id).lean()).resolves.toMatchObject({
      bankId: 701,
    });
    await expect(service.list({ search: '#701', page: 1, limit: 20 })).resolves.toMatchObject({
      items: [{ bankId: 701 }],
      pagination: { total: 1 },
    });
    await expect(service.get(701)).resolves.toMatchObject({
      bankId: 701,
      options: ['typeof', 'yield'],
      correctAnswer: 'typeof',
      usageCount: 1,
      attemptCount: 1,
      uniqueLearnerCount: 1,
      correctCount: 1,
      incorrectCount: 0,
      flagCount: 1,
    });

    await expect(
      service.remove({
        bankId: 701,
        reason: 'The stored answer is not reliable.',
        actor,
      })
    ).resolves.toEqual({ bankId: 701, removedFromTests: 1, affectedTests: 1 });

    expect((await QuestionBankModel.findOne({ bankId: 701 }).lean())?.deletedAt).toBeTruthy();
    expect((await MockTestQuestionModel.findById(testQuestion._id).lean())?.deletedAt).toBeTruthy();
    await expect(MockTestModel.findById(test._id).lean()).resolves.toMatchObject({
      questionCount: 0,
      moderationStatus: 'suspended',
    });
    await expect(MockTestAttemptModel.exists({ _id: attempt._id })).resolves.toBeTruthy();
    await expect(service.list({ page: 1, limit: 20 })).resolves.toMatchObject({
      items: [],
      pagination: { total: 0 },
    });

    const disabledDetail = await new MongoAdminMockTestsRepository().getDetail(String(test._id));
    expect(disabledDetail?.questions[0]).toMatchObject({
      bankId: 701,
      questionBankStatus: 'disabled',
      moderationStatus: 'disabled',
    });

    await expect(
      service.restore({
        bankId: 701,
        reason: 'The question and answer have been verified.',
        actor,
      })
    ).resolves.toEqual({ bankId: 701, restoredInTests: 1, affectedTests: 1 });
    expect((await QuestionBankModel.findOne({ bankId: 701 }).lean())?.deletedAt).toBeNull();
    await expect(MockTestQuestionModel.findById(testQuestion._id).lean()).resolves.toMatchObject({
      bankId: 701,
      deletedAt: null,
      moderationStatus: 'active',
    });
    await expect(MockTestModel.findById(test._id).lean()).resolves.toMatchObject({
      questionCount: 1,
      moderationStatus: 'active',
    });
  });
});
