import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mongoAdminSubscriptionsRepository } from '../../src/modules/admin/subscriptions/infrastructure/mongo-admin-subscriptions.repository';
import { SUBSCRIPTION_PLANS } from '../../src/modules/user/subscriptions/domain/subscription.entity';
import { mongoSubscriptionRepository } from '../../src/modules/user/subscriptions/infrastructure/mongo-subscription.repository';
import { SubscriptionPlan as SubscriptionPlanModel } from '../../src/infrastructure/database/models/subscription-plan.model';

describe('subscription page data repositories', () => {
  let mongo: MongoMemoryServer;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
    await SubscriptionPlanModel.init();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  it('loads all user plan cards from an empty database', async () => {
    const plans = await Promise.all(
      SUBSCRIPTION_PLANS.map(async (plan) => ({
        ...plan,
        limits: await mongoSubscriptionRepository.getPlanLimits(plan.id),
      }))
    );

    expect(plans.map((plan) => plan.id)).toEqual(['free', 'pro', 'premium']);
    expect(plans.every((plan) => plan.limits.maxTrackers >= 0)).toBe(true);
    expect(await SubscriptionPlanModel.countDocuments()).toBe(0);
  });

  it('loads the admin premium overview without existing purchases', async () => {
    const overview = await mongoAdminSubscriptionsRepository.getOverview({
      page: 1,
      limit: 20,
      status: 'all',
    });

    expect(overview.plans.map((plan) => plan.planId)).toEqual(['free', 'pro', 'premium']);
    expect(overview.metrics).toEqual({
      totalRevenue: 0,
      subscriptionsBought: 0,
      activePremiumSubscriptions: 0,
      monthlyRecurringRevenue: 0,
    });
  });

  it('updates plans when the database still has the legacy unique code index', async () => {
    const now = new Date();
    const legacyLimits = {
      maxTrackers: 5,
      trackerGenerationsPerMonth: 3,
      lessonGenerationsPerDay: 5,
      mockTestGenerationsPerMonth: 3,
      aiTutorRequestsPerDay: 20,
    };
    await SubscriptionPlanModel.collection.insertMany([
      {
        planId: 'legacy-null-code',
        code: null,
        limits: legacyLimits,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: 'free',
        limits: legacyLimits,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    const actor = {
      userId: new mongoose.Types.ObjectId().toString(),
      role: 'admin' as const,
      ipAddress: '127.0.0.1',
      userAgent: 'vitest',
    };
    const freeLimits = { ...legacyLimits, maxTrackers: 12 };
    const premiumLimits = { ...legacyLimits, maxTrackers: 100 };

    await expect(
      mongoAdminSubscriptionsRepository.updatePlanLimits('free', freeLimits, actor)
    ).resolves.toMatchObject({ planId: 'free', limits: freeLimits });
    await expect(
      mongoAdminSubscriptionsRepository.updatePlanLimits('premium', premiumLimits, actor)
    ).resolves.toMatchObject({ planId: 'premium', limits: premiumLimits });

    expect(await SubscriptionPlanModel.findOne({ code: 'free' }).lean()).toMatchObject({
      planId: 'free',
      limits: freeLimits,
    });
    expect(await SubscriptionPlanModel.findOne({ code: 'premium' }).lean()).toMatchObject({
      planId: 'premium',
      limits: premiumLimits,
    });
  });
});
