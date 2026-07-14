import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CreateSubscriptionOrderUseCase } from '../../src/modules/user/subscriptions/application/use-cases/create-subscription-order.usecase';
import { ListSubscriptionPlansUseCase } from '../../src/modules/user/subscriptions/application/use-cases/list-subscription-plans.usecase';
import { VerifySubscriptionPaymentUseCase } from '../../src/modules/user/subscriptions/application/use-cases/verify-subscription-payment.usecase';
import type {
  PendingSubscriptionInput,
  SubscriptionPlanLimits,
  UserSubscription,
} from '../../src/modules/user/subscriptions/domain/entities/subscription.entity';
import type { ISubscriptionRepository } from '../../src/modules/user/subscriptions/domain/repositories/subscription.repository.interface';
import type { ISubscriptionPaymentGateway } from '../../src/modules/user/subscriptions/domain/services/subscription-payment-gateway.interface';
import { adminPlanLimitsSchema } from '../../src/modules/admin/subscriptions/presentation/admin-subscriptions.schema';
import { generateMockTestSchema } from '../../src/modules/user/mock-tests/presentation/mock-tests.schema';

const limits: SubscriptionPlanLimits = {
  maxTrackers: 25,
  trackerGenerationsPerMonth: 15,
  lessonGenerationsPerDay: 40,
  mockTestGenerationsPerMonth: 30,
  aiTutorRequestsPerDay: 150,
};

const subscription: UserSubscription & { userId: string } = {
  id: 'subscription-1',
  userId: 'user-12345678',
  planId: 'pro',
  planName: 'Pro',
  billingCycle: 'monthly',
  amount: 49_900,
  currency: 'INR',
  status: 'pending',
  startsAt: null,
  endsAt: null,
  createdAt: new Date('2026-07-14T00:00:00.000Z'),
  limits,
};

describe('subscription use cases', () => {
  let repository: ISubscriptionRepository;
  let gateway: ISubscriptionPaymentGateway;
  let listPlans: ListSubscriptionPlansUseCase;
  let createOrder: CreateSubscriptionOrderUseCase;
  let verifyPayment: VerifySubscriptionPaymentUseCase;

  beforeEach(() => {
    repository = {
      getPlanLimits: vi.fn(async () => ({ ...limits })),
      createPending: vi.fn(async (input: PendingSubscriptionInput) => ({
        ...subscription,
        planId: input.planId,
        planName: input.planName,
        billingCycle: input.billingCycle,
        amount: input.amount,
      })),
      findByOrderId: vi.fn(async () => subscription),
      findCurrent: vi.fn(async () => null),
      activate: vi.fn(async (_order, _payment, _signature, startsAt, endsAt) => ({
        ...subscription,
        status: 'active',
        startsAt,
        endsAt,
      })),
      expireEnded: vi.fn(async () => undefined),
    };
    gateway = {
      createOrder: vi.fn(async (amount) => ({ id: 'order_test_1', amount, currency: 'INR' })),
      verifySignature: vi.fn(() => true),
      getPublicKey: vi.fn(() => 'rzp_test_public'),
    };
    listPlans = new ListSubscriptionPlansUseCase(repository);
    createOrder = new CreateSubscriptionOrderUseCase(repository, gateway);
    verifyPayment = new VerifySubscriptionPaymentUseCase(repository, gateway);
  });

  it('publishes free, pro and premium plans without exposing mutable feature arrays', async () => {
    const first = await listPlans.execute();
    first[0].features.push('changed');
    const second = await listPlans.execute();

    expect(second.map((plan) => plan.id)).toEqual(['free', 'pro', 'premium']);
    expect(second[0].features).not.toContain('changed');
  });

  it('creates the Razorpay order for the server-owned annual price', async () => {
    const order = await createOrder.execute('user-12345678', 'pro', 'annual');

    expect(gateway.createOrder).toHaveBeenCalledWith(499_900, expect.stringMatching(/^sub_/));
    expect(repository.createPending).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-12345678',
        planId: 'pro',
        billingCycle: 'annual',
        amount: 499_900,
        razorpayOrderId: 'order_test_1',
        limits,
      })
    );
    expect(order).toEqual({
      keyId: 'rzp_test_public',
      orderId: 'order_test_1',
      amount: 499_900,
      currency: 'INR',
      planName: 'Pro',
    });
  });

  it('rejects an invalid payment signature without activating premium', async () => {
    vi.mocked(gateway.verifySignature).mockReturnValue(false);

    await expect(
      verifyPayment.execute({
        userId: subscription.userId,
        razorpayOrderId: 'order_test_1',
        razorpayPaymentId: 'pay_test_1',
        razorpaySignature: 'invalid',
      })
    ).rejects.toMatchObject({ statusCode: 400, code: 'PAYMENT_SIGNATURE_INVALID' });
    expect(repository.activate).not.toHaveBeenCalled();
  });

  it('activates a verified monthly subscription for one billing month', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-14T10:00:00.000Z'));

    const active = await verifyPayment.execute({
      userId: subscription.userId,
      razorpayOrderId: 'order_test_1',
      razorpayPaymentId: 'pay_test_1',
      razorpaySignature: 'valid',
    });

    expect(active.status).toBe('active');
    expect(active.startsAt?.toISOString()).toBe('2026-07-14T10:00:00.000Z');
    expect(active.endsAt?.toISOString()).toBe('2026-08-14T10:00:00.000Z');
    expect(repository.activate).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });

  it('allows admins to use zero as an unlimited request allowance', () => {
    expect(
      adminPlanLimitsSchema.parse({
        maxTrackers: 0,
        trackerGenerationsPerMonth: 0,
        lessonGenerationsPerDay: 0,
        mockTestGenerationsPerMonth: 0,
        aiTutorRequestsPerDay: 0,
      })
    ).toEqual({
      maxTrackers: 0,
      trackerGenerationsPerMonth: 0,
      lessonGenerationsPerDay: 0,
      mockTestGenerationsPerMonth: 0,
      aiTutorRequestsPerDay: 0,
    });
  });

  it('rejects negative plan allowances', () => {
    expect(() =>
      adminPlanLimitsSchema.parse({
        maxTrackers: -1,
        trackerGenerationsPerMonth: 2,
        lessonGenerationsPerDay: 5,
        mockTestGenerationsPerMonth: 3,
        aiTutorRequestsPerDay: 20,
      })
    ).toThrow();
  });

  it('rejects plan allowances above their operational maximums', () => {
    expect(() =>
      adminPlanLimitsSchema.parse({
        maxTrackers: 1_001,
        trackerGenerationsPerMonth: 500,
        lessonGenerationsPerDay: 500,
        mockTestGenerationsPerMonth: 500,
        aiTutorRequestsPerDay: 2_000,
      })
    ).toThrow();
  });

  it('limits generated mock tests to 50 whole-number questions', () => {
    expect(() =>
      generateMockTestSchema.parse({
        topic: 'Database indexes',
        questionCount: 51,
      })
    ).toThrow();
    expect(() =>
      generateMockTestSchema.parse({
        topic: 'Database indexes',
        questionCount: 10.5,
      })
    ).toThrow();
  });
});
