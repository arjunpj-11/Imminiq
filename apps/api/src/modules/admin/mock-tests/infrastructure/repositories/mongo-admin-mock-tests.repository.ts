import mongoose from 'mongoose';
import { Notification } from '../../../../../infrastructure/database/models/notification.model';
import { MockTestAnswerModel } from '../../../../../infrastructure/database/models/mock-test-answer.model';
import { MockTestAttemptModel } from '../../../../../infrastructure/database/models/mock-test-attempt.model';
import { MockTestModel } from '../../../../../infrastructure/database/models/mock-test.model';
import { MockTestQuestionIssueModel } from '../../../../../infrastructure/database/models/mock-test-question-issue.model';
import { MockTestQuestionModel } from '../../../../../infrastructure/database/models/mock-test-question.model';
import { MockTestQuestionVersionModel } from '../../../../../infrastructure/database/models/mock-test-question-version.model';
import { QuestionBankModel } from '../../../../../infrastructure/database/models/question-bank.model';
import { User } from '../../../../../infrastructure/database/models/user.model';
import { ActivityLog } from '../../../../../infrastructure/database/models/activity-log.model';
import type { AdminActor, AdminListQuery } from '../../../../../shared/admin';
import { createAdminPage, escapeAdminSearch, recordAdminAction } from '../../../../../infrastructure/admin';
import type {
  AdminMockTestIssueUpdateInput,
  AdminMockTestLifecycleInput,
  AdminMockTestLifecycleResult,
} from '../../domain/entities/admin-mock-test.entity';
import type { IAdminMockTestsRepository } from '../../domain/repositories/admin-mock-tests.repository.interface';

type PopulatedUser = {
  _id?: unknown;
  fullName?: string;
  username?: string;
  email?: string;
};

const displayName = (user?: PopulatedUser | null) =>
  user?.fullName ?? user?.username ?? 'Unknown';

const legacyQuestionKey = (question: {
  type?: string;
  question?: string;
  correctAnswer?: string | null;
}) =>
  JSON.stringify([
    question.type ?? '',
    question.question?.trim() ?? '',
    question.correctAnswer?.trim() ?? '',
  ]);

export class MongoAdminMockTestsRepository implements IAdminMockTestsRepository {
  async list(query: AdminListQuery) {
    const filter: Record<string, unknown> = {};
    if (query.status && query.status !== 'all') {
      if (['active', 'suspended', 'deleted'].includes(query.status)) filter.moderationStatus = query.status;
    }
    if (query.search) {
      const search = new RegExp(escapeAdminSearch(query.search), 'i');
      filter.$or = [{ title: search }, { description: search }, { tags: search }];
    }

    const [rows, total, attempts, suspended, deleted, issueTotals, flagTotals] =
      await Promise.all([
        MockTestModel.find(filter)
          .sort({ createdAt: -1 })
          .skip((query.page - 1) * query.limit)
          .limit(query.limit)
          .populate('ownerId', 'fullName username email')
          .lean(),
        MockTestModel.countDocuments(filter),
        MockTestAttemptModel.countDocuments(),
        MockTestModel.countDocuments({ moderationStatus: 'suspended', deletedAt: null }),
        MockTestModel.countDocuments({ moderationStatus: 'deleted' }),
        MockTestQuestionIssueModel.aggregate<{
          _id: unknown;
          reportCount: number;
          openReportCount: number;
        }>([
          {
            $group: {
              _id: '$testId',
              reportCount: { $sum: 1 },
              openReportCount: {
                $sum: { $cond: [{ $in: ['$status', ['open', 'reviewing']] }, 1, 0] },
              },
            },
          },
        ]),
        MockTestAttemptModel.aggregate<{ _id: unknown; flagCount: number }>([
          { $unwind: '$flaggedQuestions' },
          { $group: { _id: '$testId', flagCount: { $sum: 1 } } },
        ]),
      ]);

    const issueByTest = new Map(
      issueTotals.map((item) => [String(item._id), item] as const)
    );
    const flagsByTest = new Map(flagTotals.map((item) => [String(item._id), item.flagCount]));
    const items = rows.map((row) => {
      const owner = row.ownerId as unknown as PopulatedUser;
      const issueCount = issueByTest.get(String(row._id));
      return {
        id: String(row._id),
        title: row.title,
        owner: displayName(owner),
        difficulty: row.difficulty,
        moderationStatus: (row.moderationStatus ?? 'active') as 'active' | 'suspended' | 'deleted',
        ...(row.moderationReason ? { moderationReason: row.moderationReason } : {}),
        questionCount: row.questionCount,
        attemptCount: row.attemptCount,
        averageScore: row.averageScore,
        isAIGenerated: row.isAIGenerated,
        createdAt: row.createdAt,
        deletedAt: row.deletedAt ?? null,
        reportCount: issueCount?.reportCount ?? 0,
        openReportCount: issueCount?.openReportCount ?? 0,
        flagCount: flagsByTest.get(String(row._id)) ?? 0,
      };
    });
    return createAdminPage(items, query, total, {
      attempts,
      suspended,
      deleted,
      openReports: issueTotals.reduce((sum, item) => sum + item.openReportCount, 0),
      flags: flagTotals.reduce((sum, item) => sum + item.flagCount, 0),
    });
  }

  async getDetail(id: string) {
    const [test, questions, attempts, activeAttemptCount, questionIssues, answerStats, flagStats, history] =
      await Promise.all([
        MockTestModel.findById(id).populate('ownerId', 'fullName username email').lean(),
        MockTestQuestionModel.find({ testId: id }).sort({ order: 1 }).lean(),
        MockTestAttemptModel.countDocuments({ testId: id }),
        MockTestAttemptModel.countDocuments({ testId: id, status: 'in_progress' }),
        MockTestQuestionIssueModel.aggregate<{
          _id: unknown;
          reportCount: number;
          openReportCount: number;
        }>([
          { $match: { testId: this.objectId(id) } },
          {
            $group: {
              _id: '$questionId',
              reportCount: { $sum: 1 },
              openReportCount: {
                $sum: { $cond: [{ $in: ['$status', ['open', 'reviewing']] }, 1, 0] },
              },
            },
          },
        ]),
        MockTestAnswerModel.aggregate<{
          _id: unknown;
          answerCount: number;
          correctCount: number;
        }>([
          {
            $lookup: {
              from: 'mocktestquestions',
              localField: 'questionId',
              foreignField: '_id',
              as: 'question',
            },
          },
          { $unwind: '$question' },
          { $match: { 'question.testId': this.objectId(id) } },
          {
            $group: {
              _id: '$questionId',
              answerCount: { $sum: 1 },
              correctCount: { $sum: { $cond: ['$isCorrect', 1, 0] } },
            },
          },
        ]),
        MockTestAttemptModel.aggregate<{ _id: unknown; flagCount: number }>([
          { $match: { testId: this.objectId(id) } },
          { $unwind: '$flaggedQuestions' },
          { $group: { _id: '$flaggedQuestions', flagCount: { $sum: 1 } } },
        ]),
        ActivityLog.find({
          module: 'admin.mock-tests',
          deletedAt: null,
          $or: [{ 'metadata.targetId': id }, { 'metadata.testId': id }],
        })
          .sort({ createdAt: -1 })
          .limit(20)
          .populate('userId', 'fullName username')
          .lean(),
      ]);
    if (!test) return null;

    const legacyQuestions = questions.filter((question) => question.bankId == null);
    const resolvedLegacyBankIds = new Map<string, number>();
    if (legacyQuestions.length) {
      const bankCandidates = await QuestionBankModel.find({
        question: { $in: [...new Set(legacyQuestions.map((question) => question.question))] },
      })
        .select('bankId type question correctAnswer')
        .lean();
      const candidatesByKey = new Map<string, number[]>();
      for (const candidate of bankCandidates) {
        const key = legacyQuestionKey(candidate);
        candidatesByKey.set(key, [...(candidatesByKey.get(key) ?? []), candidate.bankId]);
      }
      for (const question of legacyQuestions) {
        const candidates = candidatesByKey.get(legacyQuestionKey(question));
        if (candidates?.length === 1) {
          resolvedLegacyBankIds.set(String(question._id), candidates[0]);
        }
      }
      if (resolvedLegacyBankIds.size) {
        await MockTestQuestionModel.bulkWrite(
          [...resolvedLegacyBankIds].map(([questionId, bankId]) => ({
            updateOne: {
              filter: { _id: questionId, bankId: null },
              update: { $set: { bankId } },
            },
          }))
        );
      }
    }

    const questionBankIds = questions.flatMap((question) => {
      const bankId = question.bankId ?? resolvedLegacyBankIds.get(String(question._id));
      return bankId == null ? [] : [bankId];
    });
    const questionBankRows = questionBankIds.length
      ? await QuestionBankModel.find({ bankId: { $in: [...new Set(questionBankIds)] } })
          .select('bankId deletedAt')
          .lean()
      : [];
    const questionBankStatusById = new Map<number, 'active' | 'disabled'>(
      questionBankRows.map((row) => [row.bankId, row.deletedAt ? 'disabled' : 'active'])
    );

    const owner = test.ownerId as unknown as PopulatedUser;
    const issueByQuestion = new Map(
      questionIssues.map((item) => [String(item._id), item] as const)
    );
    const answerByQuestion = new Map(answerStats.map((item) => [String(item._id), item] as const));
    const flagsByQuestion = new Map(flagStats.map((item) => [String(item._id), item.flagCount]));
    const reportCount = questionIssues.reduce((sum, item) => sum + item.reportCount, 0);
    const openReportCount = questionIssues.reduce((sum, item) => sum + item.openReportCount, 0);

    return {
      id: String(test._id),
      title: test.title,
      description: test.description,
      owner: displayName(owner),
      ownerId: String(owner?._id ?? ''),
      ...(owner?.email ? { ownerEmail: owner.email } : {}),
      difficulty: test.difficulty,
      moderationStatus: (test.moderationStatus ?? 'active') as 'active' | 'suspended' | 'deleted',
      ...(test.moderationReason ? { moderationReason: test.moderationReason } : {}),
      questionCount: test.questionCount,
      attemptCount: attempts,
      activeAttemptCount,
      averageScore: test.averageScore,
      isAIGenerated: test.isAIGenerated,
      createdAt: test.createdAt,
      deletedAt: test.deletedAt ?? null,
      reportCount,
      openReportCount,
      flagCount: flagStats.reduce((sum, item) => sum + item.flagCount, 0),
      timeLimitMinutes: test.timeLimitMinutes,
      passingScore: test.passingScore,
      tags: test.tags,
      questions: questions.map((question) => {
        const issues = issueByQuestion.get(String(question._id));
        const answers = answerByQuestion.get(String(question._id));
        const answerCount = answers?.answerCount ?? 0;
        const bankId = question.bankId ?? resolvedLegacyBankIds.get(String(question._id));
        return {
          id: String(question._id),
          ...(bankId == null ? {} : { bankId }),
          ...(bankId != null && questionBankStatusById.has(bankId)
            ? { questionBankStatus: questionBankStatusById.get(bankId) }
            : {}),
          order: question.order,
          type: question.type,
          question: question.question,
          ...(question.options ? { options: question.options } : {}),
          ...(question.correctAnswer ? { correctAnswer: question.correctAnswer } : {}),
          ...(question.explanation ? { explanation: question.explanation } : {}),
          difficulty: question.difficulty,
          points: question.points,
          moderationStatus: (question.moderationStatus ?? 'active') as 'active' | 'disabled',
          ...(question.moderationReason
            ? { moderationReason: question.moderationReason }
            : {}),
          version: question.version ?? 1,
          reportCount: issues?.reportCount ?? 0,
          openReportCount: issues?.openReportCount ?? 0,
          flagCount: flagsByQuestion.get(String(question._id)) ?? 0,
          answerCount,
          correctRate: answerCount ? ((answers?.correctCount ?? 0) / answerCount) * 100 : 0,
          skipRate: attempts ? Math.max(0, ((attempts - answerCount) / attempts) * 100) : 0,
          ...(question.coding
            ? {
                coding: {
                  functionName: question.coding.functionName,
                  language: question.coding.language,
                  starterCode: question.coding.starterCode,
                  testCaseCount: question.coding.testCases?.length ?? 0,
                },
              }
            : {}),
        };
      }),
      moderationHistory: history.map((item) => {
        const actor = item.userId as unknown as { fullName?: string; username?: string };
        const metadata = item.metadata as Record<string, unknown>;
        return {
          id: String(item._id),
          action: item.action,
          actor: actor?.fullName ?? actor?.username ?? 'System',
          ...(typeof metadata.reason === 'string' ? { reason: metadata.reason } : {}),
          createdAt: item.createdAt,
        };
      }),
    };
  }

  async listQuestionIssues(query: AdminListQuery) {
    const filter: Record<string, unknown> = {};
    if (query.status && query.status !== 'all') filter.status = query.status;
    if (query.search) {
      filter.details = new RegExp(escapeAdminSearch(query.search), 'i');
    }

    const [issues, total, open, reviewing, resolved, dismissed] = await Promise.all([
      MockTestQuestionIssueModel.find(filter)
        .sort({ createdAt: 1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .populate('testId', 'title ownerId')
        .populate('questionId', 'question order type options correctAnswer explanation difficulty points coding')
        .populate('reporterId', 'fullName username email')
        .populate('assignedTo', 'fullName username')
        .lean(),
      MockTestQuestionIssueModel.countDocuments(filter),
      MockTestQuestionIssueModel.countDocuments({ status: 'open' }),
      MockTestQuestionIssueModel.countDocuments({ status: 'reviewing' }),
      MockTestQuestionIssueModel.countDocuments({ status: 'resolved' }),
      MockTestQuestionIssueModel.countDocuments({ status: 'dismissed' }),
    ]);

    const ownerIds = issues
      .map((issue) => (issue.testId as unknown as { ownerId?: unknown })?.ownerId)
      .filter(Boolean);
    const owners = await User.find({ _id: { $in: ownerIds } }).select('fullName username').lean();
    const ownerById = new Map(owners.map((owner) => [String(owner._id), displayName(owner)]));

    const items = issues.map((issue) => {
      const test = issue.testId as unknown as { _id?: unknown; title?: string; ownerId?: unknown };
      const question = issue.questionId as unknown as {
        _id?: unknown;
        question?: string;
        order?: number;
        type?: string;
        correctAnswer?: string;
        explanation?: string;
        options?: string[];
        difficulty?: string;
        points?: number;
        coding?: Record<string, unknown>;
      };
      const reporter = issue.reporterId as unknown as PopulatedUser;
      const assigned = issue.assignedTo as unknown as PopulatedUser | null;
      return {
        id: String(issue._id),
        testId: String(test?._id ?? ''),
        testTitle: test?.title ?? 'Deleted test',
        testOwner: ownerById.get(String(test?.ownerId ?? '')) ?? 'Unknown',
        questionId: String(question?._id ?? ''),
        questionOrder: question?.order ?? 0,
        question: question?.question ?? 'Deleted question',
        questionType: question?.type ?? 'unknown',
        ...(question?.correctAnswer ? { questionAnswer: question.correctAnswer } : {}),
        ...(question?.explanation ? { questionExplanation: question.explanation } : {}),
        ...(question?.options ? { questionOptions: question.options } : {}),
        ...(question?.difficulty ? { questionDifficulty: question.difficulty } : {}),
        ...(question?.points !== undefined ? { questionPoints: question.points } : {}),
        ...(question?.coding ? { questionCoding: question.coding } : {}),
        attemptId: String(issue.attemptId),
        reporterId: String(reporter?._id ?? ''),
        reporter: displayName(reporter),
        ...(reporter?.email ? { reporterEmail: reporter.email } : {}),
        reason: issue.reason,
        details: issue.details,
        status: issue.status as 'open' | 'reviewing' | 'resolved' | 'dismissed',
        resolutionAction: issue.resolutionAction,
        resolutionNote: issue.resolutionNote,
        ...(assigned ? { assignedTo: displayName(assigned) } : {}),
        createdAt: issue.createdAt,
        updatedAt: issue.updatedAt,
        ...(issue.resolvedAt ? { resolvedAt: issue.resolvedAt } : {}),
      };
    });
    return createAdminPage(items, query, total, { open, reviewing, resolved, dismissed });
  }

  async updateQuestionIssue(
    id: string,
    input: AdminMockTestIssueUpdateInput,
    actor: AdminActor
  ) {
    let issue = await MockTestQuestionIssueModel.findOneAndUpdate(
      {
        _id: id,
        $or: [
          { status: 'open' },
          { status: 'reviewing', assignedTo: actor.userId },
        ],
      },
      {
        $set: {
          status: input.status,
          assignedTo: input.status === 'reviewing' ? actor.userId : null,
          resolutionAction: input.resolutionAction ?? 'none',
          resolutionNote: input.resolutionNote,
          resolvedBy: input.status === 'reviewing' ? null : actor.userId,
          resolvedAt: input.status === 'reviewing' ? null : new Date(),
        },
      },
      { returnDocument: 'after' }
    )
      .populate('testId', 'title ownerId')
      .populate('questionId', 'question order type options correctAnswer explanation difficulty points coding')
      .populate('reporterId', 'fullName username email')
      .populate('assignedTo', 'fullName username')
      .lean();
    if (!issue) return null;

    const action = input.resolutionAction ?? 'none';
    if (input.status !== 'reviewing' && action !== 'none') {
      try {
        const testId = String(
          (issue.testId as unknown as { _id?: unknown })?._id ?? issue.testId
        );
        const questionId = String(
          (issue.questionId as unknown as { _id?: unknown })?._id ?? issue.questionId
        );
        if (action === 'question_corrected' || action === 'question_disabled') {
          await this.applyQuestionAction(questionId, testId, action, input, actor);
        } else {
          await this.updateLifecycle(
            testId,
            {
              action: action === 'test_deleted' ? 'delete' : 'suspend',
              reasonCode: 'incorrect_content',
              reason: input.resolutionNote,
              notifyOwner: true,
            },
            actor
          );
        }

        const refreshed = await MockTestQuestionIssueModel.findById(id)
          .populate('testId', 'title ownerId')
          .populate('questionId', 'question order type options correctAnswer explanation difficulty points coding')
          .populate('reporterId', 'fullName username email')
          .populate('assignedTo', 'fullName username')
          .lean();
        if (refreshed) issue = refreshed;
      } catch (error) {
        await MockTestQuestionIssueModel.updateOne(
          { _id: id, resolvedBy: actor.userId },
          {
            $set: {
              status: 'reviewing',
              assignedTo: actor.userId,
              resolutionAction: 'none',
              resolutionNote: 'Content action failed; the case remains under review.',
              resolvedBy: null,
              resolvedAt: null,
            },
          }
        );
        throw error;
      }
    }

    await Promise.all([
      Notification.create({
        userId: issue.reporterId,
        type: 'mock_test_question_report_updated',
        message:
          input.status === 'reviewing'
            ? 'Your mock-test question report is now being reviewed.'
            : `Your mock-test question report was ${input.status}. ${input.resolutionNote}`.slice(
                0,
                500
              ),
        deepLink: '/mock-tests',
        metadata: { issueId: id, status: input.status },
      }),
      recordAdminAction(actor, 'admin_mock_test_question_issue_updated', 'admin.mock-tests', {
        targetType: 'mock_test_question_issue',
        targetId: id,
        status: input.status,
        resolutionAction: action,
        resolutionNote: input.resolutionNote,
      }),
    ]);

    const test = issue.testId as unknown as { _id?: unknown; title?: string; ownerId?: unknown };
    const question = issue.questionId as unknown as {
      _id?: unknown;
      question?: string;
      order?: number;
      type?: string;
      correctAnswer?: string;
      explanation?: string;
      options?: string[];
      difficulty?: string;
      points?: number;
      coding?: Record<string, unknown>;
    };
    const reporter = issue.reporterId as unknown as PopulatedUser;
    const assigned = issue.assignedTo as unknown as PopulatedUser | null;
    const owner = test?.ownerId
      ? await User.findById(test.ownerId).select('fullName username email').lean()
      : null;
    return {
      id: String(issue._id),
      testId: String(test?._id ?? ''),
      testTitle: test?.title ?? 'Deleted test',
      testOwner: displayName(owner),
      ...(owner?.email ? { testOwnerEmail: owner.email } : {}),
      questionId: String(question?._id ?? ''),
      questionOrder: question?.order ?? 0,
      question: question?.question ?? 'Deleted question',
      questionType: question?.type ?? 'unknown',
      ...(question?.correctAnswer ? { questionAnswer: question.correctAnswer } : {}),
      ...(question?.explanation ? { questionExplanation: question.explanation } : {}),
      ...(question?.options ? { questionOptions: question.options } : {}),
      ...(question?.difficulty ? { questionDifficulty: question.difficulty } : {}),
      ...(question?.points !== undefined ? { questionPoints: question.points } : {}),
      ...(question?.coding ? { questionCoding: question.coding } : {}),
      attemptId: String(issue.attemptId),
      reporterId: String(reporter?._id ?? ''),
      reporter: displayName(reporter),
      ...(reporter?.email ? { reporterEmail: reporter.email } : {}),
      reason: issue.reason,
      details: issue.details,
      status: issue.status as 'open' | 'reviewing' | 'resolved' | 'dismissed',
      resolutionAction: issue.resolutionAction,
      resolutionNote: issue.resolutionNote,
      ...(assigned ? { assignedTo: displayName(assigned) } : {}),
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
      ...(issue.resolvedAt ? { resolvedAt: issue.resolvedAt } : {}),
    };
  }

  async updateLifecycle(id: string, input: AdminMockTestLifecycleInput, actor: AdminActor) {
    const session = await mongoose.startSession();
    let result: AdminMockTestLifecycleResult | null = null;
    try {
      await session.withTransaction(async () => {
        const test = await MockTestModel.findById(id)
          .session(session)
          .populate('ownerId', 'fullName username email')
          .lean();
        if (!test) return;

        const owner = test.ownerId as unknown as PopulatedUser;
        const now = new Date();
        const moderationStatus: AdminMockTestLifecycleResult['moderationStatus'] =
          input.action === 'restore'
            ? 'active'
            : input.action === 'suspend'
              ? 'suspended'
              : 'deleted';
        const activeAttempts = await MockTestAttemptModel.countDocuments({
          testId: id,
          status: 'in_progress',
        }).session(session);
        const update =
          input.action === 'restore'
            ? {
                moderationStatus,
                moderatedBy: actor.userId,
                suspendedAt: null,
                deletedAt: null,
              }
            : {
                moderationStatus,
                moderationReason: input.reason,
                moderationReasonCode: input.reasonCode,
                moderatedBy: actor.userId,
                suspendedAt: now,
                deletedAt: input.action === 'delete' ? now : null,
                isShareEnabled: false,
              };

        await MockTestModel.updateOne(
          { _id: id },
          input.action === 'restore'
            ? { $set: update, $unset: { moderationReason: 1, moderationReasonCode: 1 } }
            : { $set: update },
          { session }
        );

        if (input.action !== 'restore') {
          await Promise.all([
            MockTestAttemptModel.updateMany(
              { testId: id, status: 'in_progress' },
              { $set: { status: 'abandoned' } },
              { session }
            ),
            MockTestQuestionIssueModel.updateMany(
              { testId: id, status: { $in: ['open', 'reviewing'] } },
              {
                $set: {
                  status: 'resolved',
                  resolutionAction:
                    input.action === 'delete' ? 'test_deleted' : 'test_suspended',
                  resolutionNote: input.reason,
                  resolvedBy: actor.userId,
                  resolvedAt: now,
                  assignedTo: null,
                },
              },
              { session }
            ),
          ]);
        }

        if (owner?._id) {
          await Notification.create(
            [
              {
                userId: new mongoose.Types.ObjectId(String(owner._id)),
                type: 'mock_test_moderation_updated',
                message:
                  input.action === 'restore'
                    ? `Your mock test “${test.title}” was restored.`
                    : `Your mock test “${test.title}” was ${moderationStatus}. Reason: ${input.reason}`.slice(
                        0,
                        500
                      ),
                deepLink: '/mock-tests',
                metadata: { testId: id, moderationStatus, reasonCode: input.reasonCode },
              },
            ],
            { session }
          );
        }
        await recordAdminAction(
          actor,
          `admin_mock_test_${input.action}d`,
          'admin.mock-tests',
          {
            targetType: 'mock_test',
            targetId: id,
            targetTitle: test.title,
            ownerId: String(owner?._id ?? ''),
            reasonCode: input.reasonCode,
            reason: input.reason,
            affectedActiveAttempts: activeAttempts,
            previousStatus: test.moderationStatus ?? 'active',
            moderationStatus,
          },
          session
        );

        result = {
          id,
          title: test.title,
          ownerId: String(owner?._id ?? ''),
          owner: displayName(owner),
          ...(owner?.email ? { ownerEmail: owner.email } : {}),
          moderationStatus,
          reason: input.reason,
          affectedActiveAttempts: activeAttempts,
          updatedAt: now,
        };
      });
      return result;
    } finally {
      await session.endSession();
    }
  }

  async listQuestionVersions(questionId: string) {
    const rows = await MockTestQuestionVersionModel.find({ questionId })
      .sort({ version: -1 })
      .populate('changedBy', 'fullName username')
      .lean();
    return rows.map((row) => {
      const actor = row.changedBy as unknown as { fullName?: string; username?: string };
      return {
        id: String(row._id),
        questionId: String(row.questionId),
        testId: String(row.testId),
        version: row.version,
        snapshot: row.snapshot as Record<string, unknown>,
        changedBy: actor?.fullName ?? actor?.username ?? 'Administrator',
        reason: row.reason,
        createdAt: row.createdAt,
      };
    });
  }

  async restoreQuestionVersion(
    questionId: string,
    targetVersion: number,
    reason: string,
    actor: AdminActor
  ) {
    const session = await mongoose.startSession();
    try {
      let result: { questionId: string; version: number } | null = null;
      await session.withTransaction(async () => {
        const [target, current] = await Promise.all([
          MockTestQuestionVersionModel.findOne({ questionId, version: targetVersion })
            .session(session)
            .lean(),
          MockTestQuestionModel.findById(questionId).session(session).lean(),
        ]);
        if (!target || !current) return;
        const currentVersion = current.version ?? 1;
        await MockTestQuestionVersionModel.updateOne(
          { questionId: current._id, version: currentVersion },
          {
            $setOnInsert: {
              questionId: current._id,
              testId: current.testId,
              version: currentVersion,
              snapshot: current,
              changedBy: actor.userId,
              reason,
            },
          },
          { upsert: true, session }
        );
        const snapshot = target.snapshot as Record<string, unknown>;
        const restored = {
          type: snapshot.type,
          question: snapshot.question,
          options: snapshot.options,
          correctAnswer: snapshot.correctAnswer,
          explanation: snapshot.explanation,
          difficulty: snapshot.difficulty,
          order: snapshot.order,
          points: snapshot.points,
          coding: snapshot.coding,
          moderationStatus: 'active',
          moderationReason: reason,
          moderatedBy: actor.userId,
          disabledAt: null,
          version: currentVersion + 1,
        };
        await MockTestQuestionModel.updateOne(
          { _id: questionId },
          { $set: restored },
          { session, runValidators: true }
        );
        const activeQuestionCount = await MockTestQuestionModel.countDocuments({
          testId: current.testId,
          deletedAt: null,
          moderationStatus: { $in: ['active', null] },
        }).session(session);
        await MockTestModel.updateOne(
          { _id: current.testId },
          { $set: { questionCount: activeQuestionCount } },
          { session }
        );
        await recordAdminAction(
          actor,
          'admin_mock_test_question_version_restored',
          'admin.mock-tests',
          {
            targetType: 'mock_test_question',
            targetId: questionId,
            testId: String(current.testId),
            restoredFromVersion: targetVersion,
            version: currentVersion + 1,
            reason,
          },
          session
        );
        result = { questionId, version: currentVersion + 1 };
      });
      return result;
    } finally {
      await session.endSession();
    }
  }

  private objectId(id: string) {
    return new mongoose.Types.ObjectId(id);
  }

  private async applyQuestionAction(
    questionId: string,
    testId: string,
    action: 'question_corrected' | 'question_disabled',
    input: AdminMockTestIssueUpdateInput,
    actor: AdminActor
  ) {
    const question = await MockTestQuestionModel.findOne({
      _id: questionId,
      testId,
      deletedAt: null,
    }).lean();
    if (!question) throw new Error('The reported question no longer exists.');

    const version = question.version ?? 1;
    await MockTestQuestionVersionModel.updateOne(
      { questionId: question._id, version },
      {
        $setOnInsert: {
          questionId: question._id,
          testId: question.testId,
          version,
          snapshot: question,
          changedBy: actor.userId,
          reason: input.resolutionNote,
        },
      },
      { upsert: true }
    );

    const now = new Date();
    const update =
      action === 'question_corrected'
        ? {
            question: input.correctedQuestion,
            ...(input.correctedAnswer !== undefined
              ? { correctAnswer: input.correctedAnswer }
              : {}),
            ...(input.correctedExplanation !== undefined
              ? { explanation: input.correctedExplanation }
              : {}),
            ...(input.correctedOptions !== undefined ? { options: input.correctedOptions } : {}),
            ...(input.correctedDifficulty !== undefined
              ? { difficulty: input.correctedDifficulty }
              : {}),
            ...(input.correctedPoints !== undefined ? { points: input.correctedPoints } : {}),
            ...(input.correctedCoding !== undefined ? { coding: input.correctedCoding } : {}),
            moderationStatus: 'active',
            moderationReason: input.resolutionNote,
            moderatedBy: actor.userId,
            disabledAt: null,
            version: version + 1,
          }
        : {
            moderationStatus: 'disabled',
            moderationReason: input.resolutionNote,
            moderatedBy: actor.userId,
            disabledAt: now,
            version: version + 1,
          };

    await MockTestQuestionModel.updateOne({ _id: questionId }, { $set: update });
    const activeQuestionCount = await MockTestQuestionModel.countDocuments({
      testId,
      deletedAt: null,
      moderationStatus: { $in: ['active', null] },
    });
    await MockTestModel.updateOne({ _id: testId }, { $set: { questionCount: activeQuestionCount } });

    const test = await MockTestModel.findById(testId).select('ownerId title').lean();
    if (test?.ownerId) {
      await Notification.create({
        userId: test.ownerId,
        type: 'mock_test_question_moderated',
        message: `Question ${question.order} in “${test.title}” was ${
          action === 'question_corrected' ? 'corrected' : 'disabled'
        }. Reason: ${input.resolutionNote}`.slice(0, 500),
        deepLink: `/mock-tests/${testId}`,
        metadata: { testId, questionId, action, version: version + 1 },
      });
    }

    await recordAdminAction(actor, `admin_mock_test_${action}`, 'admin.mock-tests', {
      targetType: 'mock_test_question',
      targetId: questionId,
      testId,
      previousVersion: version,
      version: version + 1,
      reason: input.resolutionNote,
    });
  }
}

export const mongoAdminMockTestsRepository = new MongoAdminMockTestsRepository();
