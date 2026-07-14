import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { mongoAdminSubscriptionsRepository } from '../../src/modules/admin/subscriptions/infrastructure/repositories/mongo-admin-subscriptions.repository';
import {
  getDefaultSubscriptionPlan,
  SUBSCRIPTION_PLANS,
} from '../../src/modules/user/subscriptions/domain/entities/subscription.entity';
import { mongoSubscriptionRepository } from '../../src/modules/user/subscriptions/infrastructure/repositories/mongo-subscription.repository';
import { SubscriptionLimitService } from '../../src/modules/user/subscriptions/infrastructure/services/subscription-limit.service';
import { SubscriptionPlan as SubscriptionPlanModel } from '../../src/infrastructure/database/models/subscription-plan.model';
import { Subscription } from '../../src/infrastructure/database/models/subscription.model';
import { Tracker } from '../../src/infrastructure/database/models/tracker.model';

const toAdminInput = (plan: ReturnType<typeof getDefaultSubscriptionPlan>) => ({
  name: plan.name,
  description: plan.description,
  monthlyAmount: plan.monthlyAmount,
  annualAmount: plan.annualAmount,
  currency: plan.currency,
  features: plan.features,
  highlighted: plan.highlighted,
  limits: plan.limits,
});

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
    const plans = await mongoSubscriptionRepository.getPlans();

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
    const freePlan = { ...SUBSCRIPTION_PLANS[0], limits: freeLimits };
    const premiumPlan = { ...SUBSCRIPTION_PLANS[2], limits: premiumLimits };

    await expect(
      mongoAdminSubscriptionsRepository.updatePlan('free', {
        name: freePlan.name,
        description: freePlan.description,
        monthlyAmount: freePlan.monthlyAmount,
        annualAmount: freePlan.annualAmount,
        currency: freePlan.currency,
        features: freePlan.features,
        highlighted: freePlan.highlighted,
        limits: freePlan.limits,
      }, [], actor)
    ).resolves.toMatchObject({ planId: 'free', limits: freeLimits });
    await expect(
      mongoAdminSubscriptionsRepository.updatePlan('premium', {
        name: premiumPlan.name,
        description: premiumPlan.description,
        monthlyAmount: premiumPlan.monthlyAmount,
        annualAmount: premiumPlan.annualAmount,
        currency: premiumPlan.currency,
        features: premiumPlan.features,
        highlighted: premiumPlan.highlighted,
        limits: premiumPlan.limits,
      }, [], actor)
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

  it('applies current free limits and only selected paid-plan upgrades', async () => {
    const actor = {
      userId: new mongoose.Types.ObjectId().toString(),
      role: 'admin' as const,
      ipAddress: '127.0.0.1',
      userAgent: 'vitest',
    };
    const service = new SubscriptionLimitService();
    const trackerCount = vi.spyOn(Tracker, 'countDocuments').mockResolvedValue(3);

    const freePlan = getDefaultSubscriptionPlan('free');
    freePlan.limits.maxTrackers = 5;
    await mongoAdminSubscriptionsRepository.updatePlan('free', toAdminInput(freePlan), [], actor);
    await expect(
      service.enforce(new mongoose.Types.ObjectId().toString(), 'tracker_capacity')
    ).resolves.toBeUndefined();

    freePlan.limits.maxTrackers = 3;
    await mongoAdminSubscriptionsRepository.updatePlan('free', toAdminInput(freePlan), [], actor);
    await expect(
      service.enforce(new mongoose.Types.ObjectId().toString(), 'tracker_capacity')
    ).rejects.toThrow('limit of 3');

    const paidUserId = new mongoose.Types.ObjectId();
    const premiumPlan = getDefaultSubscriptionPlan('premium');
    premiumPlan.limits.maxTrackers = 100;
    await mongoAdminSubscriptionsRepository.updatePlan(
      'premium',
      toAdminInput(premiumPlan),
      [],
      actor
    );
    await Subscription.create({
      userId: paidUserId,
      planId: 'premium',
      planName: premiumPlan.name,
      billingCycle: 'monthly',
      amount: premiumPlan.monthlyAmount,
      currency: 'INR',
      status: 'active',
      limits: { ...premiumPlan.limits, maxTrackers: 3 },
      razorpayOrderId: `order_${paidUserId.toString()}`,
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 86_400_000),
    });

    premiumPlan.limits.maxTrackers = 5;
    await mongoAdminSubscriptionsRepository.updatePlan(
      'premium',
      toAdminInput(premiumPlan),
      ['maxTrackers'],
      actor
    );
    expect(
      await Subscription.findOne({ userId: paidUserId }).select('limits.maxTrackers').lean()
    ).toMatchObject({ limits: { maxTrackers: 5 } });
    await expect(mongoSubscriptionRepository.findCurrent(paidUserId.toString())).resolves.toMatchObject({
      planId: 'premium',
      limits: { maxTrackers: 5 },
    });

    trackerCount.mockResolvedValue(4);
    await expect(
      service.enforce(paidUserId.toString(), 'tracker_capacity')
    ).resolves.toBeUndefined();

    premiumPlan.limits.maxTrackers = 2;
    premiumPlan.limits.trackerGenerationsPerMonth += 10;
    await mongoAdminSubscriptionsRepository.updatePlan(
      'premium',
      toAdminInput(premiumPlan),
      ['maxTrackers'],
      actor
    );
    await expect(mongoSubscriptionRepository.findCurrent(paidUserId.toString())).resolves.toMatchObject({
      limits: {
        maxTrackers: 5,
        trackerGenerationsPerMonth: getDefaultSubscriptionPlan('premium').limits.trackerGenerationsPerMonth,
      },
    });
    await expect(mongoSubscriptionRepository.getPlan('premium')).resolves.toMatchObject({
      limits: {
        maxTrackers: 2,
        trackerGenerationsPerMonth: premiumPlan.limits.trackerGenerationsPerMonth,
      },
    });
    trackerCount.mockRestore();
  });
});
