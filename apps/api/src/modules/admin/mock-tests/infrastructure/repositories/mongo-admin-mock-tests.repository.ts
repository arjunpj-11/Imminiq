import mongoose from 'mongoose';
import { Notification } from '../../../../../infrastructure/database/models/notification.model';
import { MockTestAnswerModel } from '../../../../../infrastructure/database/models/mock-test-answer.model';
import { MockTestAttemptModel } from '../../../../../infrastructure/database/models/mock-test-attempt.model';
import { MockTestModel } from '../../../../../infrastructure/database/models/mock-test.model';
import { MockTestQuestionIssueModel } from '../../../../../infrastructure/database/models/mock-test-question-issue.model';
import { MockTestQuestionModel } from '../../../../../infrastructure/database/models/mock-test-question.model';
import { User } from '../../../../../infrastructure/database/models/user.model';
import type { AdminActor, AdminListQuery } from '../../../shared/domain';
import { createAdminPage, escapeAdminSearch, recordAdminAction } from '../../../shared/infrastructure';
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

export class MongoAdminMockTestsRepository implements IAdminMockTestsRepository {
  async list(query: AdminListQuery) {
    const filter: Record<string, unknown> = {};
    if (query.status && query.status !== 'all') {
      if (['public', 'private'].includes(query.status)) filter.visibility = query.status;
      if (['active', 'suspended', 'deleted'].includes(query.status)) {
        filter.moderationStatus = query.status;
      }
    }
    if (query.search) {
      const search = new RegExp(escapeAdminSearch(query.search), 'i');
      filter.$or = [{ title: search }, { description: search }, { tags: search }];
    }

    const [rows, total, publicCount, privateCount, attempts, suspended, deleted, issueTotals] =
      await Promise.all([
        MockTestModel.find(filter)
          .sort({ createdAt: -1 })
          .skip((query.page - 1) * query.limit)
          .limit(query.limit)
          .populate('ownerId', 'fullName username email')
          .lean(),
        MockTestModel.countDocuments(filter),
        MockTestModel.countDocuments({ visibility: 'public', deletedAt: null }),
        MockTestModel.countDocuments({ visibility: 'private', deletedAt: null }),
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
      ]);

    const issueByTest = new Map(
      issueTotals.map((item) => [String(item._id), item] as const)
    );
    const items = rows.map((row) => {
      const owner = row.ownerId as unknown as PopulatedUser;
      const issueCount = issueByTest.get(String(row._id));
      return {
        id: String(row._id),
        title: row.title,
        owner: displayName(owner),
        difficulty: row.difficulty,
        visibility: row.visibility,
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
      };
    });
    return createAdminPage(items, query, total, {
      public: publicCount,
      private: privateCount,
      attempts,
      suspended,
      deleted,
      openReports: issueTotals.reduce((sum, item) => sum + item.openReportCount, 0),
    });
  }

  async getDetail(id: string) {
    const [test, questions, attempts, activeAttemptCount, questionIssues, answerStats] =
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
      ]);
    if (!test) return null;

    const owner = test.ownerId as unknown as PopulatedUser;
    const issueByQuestion = new Map(
      questionIssues.map((item) => [String(item._id), item] as const)
    );
    const answerByQuestion = new Map(answerStats.map((item) => [String(item._id), item] as const));
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
      visibility: test.visibility,
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
      timeLimitMinutes: test.timeLimitMinutes,
      passingScore: test.passingScore,
      tags: test.tags,
      questions: questions.map((question) => {
        const issues = issueByQuestion.get(String(question._id));
        const answers = answerByQuestion.get(String(question._id));
        const answerCount = answers?.answerCount ?? 0;
        return {
          id: String(question._id),
          order: question.order,
          type: question.type,
          question: question.question,
          ...(question.options ? { options: question.options } : {}),
          ...(question.correctAnswer ? { correctAnswer: question.correctAnswer } : {}),
          ...(question.explanation ? { explanation: question.explanation } : {}),
          difficulty: question.difficulty,
          points: question.points,
          reportCount: issues?.reportCount ?? 0,
          openReportCount: issues?.openReportCount ?? 0,
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
        .populate('questionId', 'question order type')
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
    const issue = await MockTestQuestionIssueModel.findByIdAndUpdate(
      id,
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
      .populate('questionId', 'question order type')
      .populate('reporterId', 'fullName username email')
      .populate('assignedTo', 'fullName username')
      .lean();
    if (!issue) return null;

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
        resolutionAction: input.resolutionAction ?? 'none',
        resolutionNote: input.resolutionNote,
      }),
    ]);

    const test = issue.testId as unknown as { _id?: unknown; title?: string; ownerId?: unknown };
    const question = issue.questionId as unknown as {
      _id?: unknown;
      question?: string;
      order?: number;
      type?: string;
    };
    const reporter = issue.reporterId as unknown as PopulatedUser;
    const assigned = issue.assignedTo as unknown as PopulatedUser | null;
    const owner = test?.ownerId
      ? await User.findById(test.ownerId).select('fullName username').lean()
      : null;
    return {
      id: String(issue._id),
      testId: String(test?._id ?? ''),
      testTitle: test?.title ?? 'Deleted test',
      testOwner: displayName(owner),
      questionId: String(question?._id ?? ''),
      questionOrder: question?.order ?? 0,
      question: question?.question ?? 'Deleted question',
      questionType: question?.type ?? 'unknown',
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
    const test = await MockTestModel.findById(id)
      .populate('ownerId', 'fullName username email')
      .lean();
    if (!test) return null;

    const owner = test.ownerId as unknown as PopulatedUser;
    const now = new Date();
    const moderationStatus: AdminMockTestLifecycleResult['moderationStatus'] =
      input.action === 'restore' ? 'active' : input.action === 'suspend' ? 'suspended' : 'deleted';
    const activeAttempts = await MockTestAttemptModel.countDocuments({
      testId: id,
      status: 'in_progress',
    });
    const update =
      input.action === 'restore'
        ? {
            moderationStatus,
            moderationReason: undefined,
            moderationReasonCode: undefined,
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
            ...(input.action === 'delete' ? { visibility: 'private' } : {}),
          };

    await MockTestModel.updateOne(
      { _id: id },
      input.action === 'restore'
        ? { $set: update, $unset: { moderationReason: 1, moderationReasonCode: 1 } }
        : { $set: update }
    );

    if (input.action !== 'restore') {
      await Promise.all([
        MockTestAttemptModel.updateMany(
          { testId: id, status: 'in_progress' },
          { $set: { status: 'abandoned' } }
        ),
        MockTestQuestionIssueModel.updateMany(
          { testId: id, status: { $in: ['open', 'reviewing'] } },
          {
            $set: {
              status: 'resolved',
              resolutionAction: input.action === 'delete' ? 'test_deleted' : 'test_suspended',
              resolutionNote: input.reason,
              resolvedBy: actor.userId,
              resolvedAt: now,
              assignedTo: null,
            },
          }
        ),
      ]);
    }

    await Promise.all([
      Notification.create({
        userId: new mongoose.Types.ObjectId(String(owner?._id)),
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
      }),
      recordAdminAction(actor, `admin_mock_test_${input.action}d`, 'admin.mock-tests', {
        targetType: 'mock_test',
        targetId: id,
        targetTitle: test.title,
        ownerId: String(owner?._id ?? ''),
        reasonCode: input.reasonCode,
        reason: input.reason,
        affectedActiveAttempts: activeAttempts,
        previousStatus: test.moderationStatus ?? 'active',
        moderationStatus,
      }),
    ]);

    return {
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
  }

  private objectId(id: string) {
    return new mongoose.Types.ObjectId(id);
  }
}

export const mongoAdminMockTestsRepository = new MongoAdminMockTestsRepository();
