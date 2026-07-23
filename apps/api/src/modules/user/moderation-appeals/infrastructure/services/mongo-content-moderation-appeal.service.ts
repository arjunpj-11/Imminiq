import { ContentModerationAppeal } from '../../../../../infrastructure/database/models/content-moderation-appeal.model';
import { MockTestAttemptModel } from '../../../../../infrastructure/database/models/mock-test-attempt.model';
import { MockTestModel } from '../../../../../infrastructure/database/models/mock-test.model';
import { Tracker } from '../../../../../infrastructure/database/models/tracker.model';
import { ServiceError } from '../../../../../shared/errors/service.error';
import type {
  IContentModerationAppealService,
  SubmitContentModerationAppealInput,
} from '../../application/content-moderation-appeal.service';

export class ContentModerationAppealService implements IContentModerationAppealService {
  async list(userId: string) {
    const rows = await ContentModerationAppeal.find({ ownerId: userId, deletedAt: null })
      .sort({ createdAt: -1 })
      .lean();
    return rows.map((row) => ({
      id: String(row._id),
      targetType: row.targetType,
      targetId: String(row.targetId),
      reason: row.reason,
      evidenceUrls: row.evidenceUrls,
      status: row.status,
      decisionNote: row.decisionNote,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      decidedAt: row.decidedAt,
    }));
  }

  async submit(input: SubmitContentModerationAppealInput) {
    const target =
      input.targetType === 'tracker'
        ? await Tracker.findById(input.targetId).select('ownerId moderationStatus title').lean()
        : await MockTestModel.findById(input.targetId)
            .select('ownerId moderationStatus title')
            .lean();
    const isOwner = Boolean(target && String(target.ownerId) === input.userId);
    const hasMockTestAttempt =
      input.targetType === 'mock_test' && target
        ? Boolean(
            await MockTestAttemptModel.exists({
              testId: input.targetId,
              userId: input.userId,
            })
          )
        : false;
    if (!target || (input.targetType === 'tracker' ? !isOwner : !isOwner && !hasMockTestAttempt)) {
      throw new ServiceError(
        'forbidden',
        'CONTENT_APPEAL_FORBIDDEN',
        input.targetType === 'tracker'
          ? 'Tracker not found or not owned by this account'
          : 'Mock test not found or this account was not affected by its moderation'
      );
    }
    if (!['suspended', 'deleted'].includes(target.moderationStatus ?? 'active')) {
      throw new ServiceError(
        'invalid-input',
        'CONTENT_APPEAL_NOT_ELIGIBLE',
        'Only moderated content can be appealed'
      );
    }
    const existing = await ContentModerationAppeal.findOne({
      targetType: input.targetType,
      targetId: input.targetId,
      ownerId: input.userId,
      status: { $in: ['pending', 'under_review'] },
      deletedAt: null,
    }).lean();
    if (existing) {
      throw new ServiceError(
        'conflict',
        'CONTENT_APPEAL_EXISTS',
        'An active appeal already exists for this content'
      );
    }
    const row = await ContentModerationAppeal.create({
      targetType: input.targetType,
      targetId: input.targetId,
      ownerId: input.userId,
      reason: input.reason,
      evidenceUrls: input.evidenceUrls,
    });
    return {
      id: String(row._id),
      targetType: row.targetType,
      targetId: String(row.targetId),
      status: row.status,
      createdAt: row.createdAt,
    };
  }
}
