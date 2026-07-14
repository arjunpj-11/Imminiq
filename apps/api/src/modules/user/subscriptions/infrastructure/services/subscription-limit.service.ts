import { PlanLimitUsage } from '../../../../../infrastructure/database/models/plan-limit-usage.model';
import { SubscriptionPlan as SubscriptionPlanModel } from '../../../../../infrastructure/database/models/subscription-plan.model';
import { Subscription } from '../../../../../infrastructure/database/models/subscription.model';
import { TrackerLesson } from '../../../../../infrastructure/database/models/tracker-lesson.model';
import { Tracker } from '../../../../../infrastructure/database/models/tracker.model';
import type {
  ISubscriptionLimitEnforcer,
  PlanLimitContext,
  PlanLimitKind,
} from '../../application/subscription-limit.contract';
import {
  getDefaultPlanLimits,
  type SubscriptionPlanId,
  type SubscriptionPlanLimits,
} from '../../domain/entities/subscription.entity';
import { SubscriptionLimitExceededError } from '../../domain/subscription-limit.error';

const limitFields = {
  tracker_generation: 'trackerGenerationsPerMonth',
  lesson_generation: 'lessonGenerationsPerDay',
  mock_test_generation: 'mockTestGenerationsPerMonth',
  ai_tutor_request: 'aiTutorRequestsPerDay',
} as const;

const labels = {
  tracker_capacity: 'tracker capacity',
  tracker_generation: 'monthly tracker generation',
  lesson_generation: 'daily lesson generation',
  mock_test_generation: 'monthly mock-test generation',
  ai_tutor_request: 'daily AI tutor request',
} as const;

const periodStart = (kind: Exclude<PlanLimitKind, 'tracker_capacity'>, now: Date) => {
  if (kind === 'tracker_generation' || kind === 'mock_test_generation') {
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  }
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};

export class SubscriptionLimitService implements ISubscriptionLimitEnforcer {
  private async findCurrentPlanLimits(
    planId: SubscriptionPlanId
  ): Promise<SubscriptionPlanLimits | null> {
    const row = await SubscriptionPlanModel.findOne({
      $or: [{ planId }, { code: planId }],
    })
      .sort({ updatedAt: -1, _id: -1 })
      .select('limits')
      .lean();
    return row?.limits ? ({ ...row.limits } as SubscriptionPlanLimits) : null;
  }

  private async resolveLimits(userId: string): Promise<SubscriptionPlanLimits> {
    const active = await Subscription.findOne({
      userId,
      status: { $in: ['active', 'canceled'] },
      endsAt: { $gt: new Date() },
    })
      .sort({ endsAt: -1 })
      .select('planId limits')
      .lean();
    if (active) {
      const planId = active.planId as SubscriptionPlanId;
      return { ...(active.limits ?? getDefaultPlanLimits(planId)) } as SubscriptionPlanLimits;
    }
    return (await this.findCurrentPlanLimits('free')) ?? getDefaultPlanLimits('free');
  }

  private exceeded(kind: PlanLimitKind, limit: number) {
    throw new SubscriptionLimitExceededError(
      `Your ${labels[kind]} limit of ${limit} has been reached. Upgrade your plan or wait for the limit to reset.`
    );
  }

  private async consumeCounter(
    userId: string,
    kind: Exclude<PlanLimitKind, 'tracker_capacity'>,
    limit: number
  ) {
    if (limit === 0) return;
    const start = periodStart(kind, new Date());
    const query = { userId, key: kind, periodStart: start };
    const incremented = await PlanLimitUsage.findOneAndUpdate(
      { ...query, count: { $lt: limit } },
      { $inc: { count: 1 } },
      { returnDocument: "after" }
    );
    if (incremented) return;
    const existing = await PlanLimitUsage.findOne(query).select('_id count').lean();
    if (existing) this.exceeded(kind, limit);
    try {
      await PlanLimitUsage.create({ ...query, count: 1 });
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        const retried = await PlanLimitUsage.findOneAndUpdate(
          { ...query, count: { $lt: limit } },
          { $inc: { count: 1 } },
          { returnDocument: "after" }
        );
        if (!retried) this.exceeded(kind, limit);
        return;
      }
      throw error;
    }
  }

  async enforce(
    userId: string,
    kind: PlanLimitKind,
    context: PlanLimitContext = {}
  ): Promise<void> {
    const limits = await this.resolveLimits(userId);
    if (kind === 'tracker_capacity' || kind === 'tracker_generation') {
      if (kind === 'tracker_capacity' && context.trackerId) {
        const alreadyOwned = await Tracker.exists({ _id: context.trackerId, ownerId: userId });
        if (alreadyOwned) return;
      }
      if (limits.maxTrackers !== 0) {
        const trackers = await Tracker.countDocuments({ ownerId: userId, deletedAt: null });
        if (trackers >= limits.maxTrackers) this.exceeded('tracker_capacity', limits.maxTrackers);
      }
      if (kind === 'tracker_capacity') return;
    }
    if (kind === 'lesson_generation' && context.trackerId && context.subtopicId) {
      const existing = await TrackerLesson.exists({
        userId,
        trackerId: context.trackerId,
        subtopicId: context.subtopicId,
        deletedAt: null,
      });
      if (existing) return;
    }
    const field = limitFields[kind as Exclude<PlanLimitKind, 'tracker_capacity'>];
    await this.consumeCounter(
      userId,
      kind as Exclude<PlanLimitKind, 'tracker_capacity'>,
      limits[field]
    );
  }
}
