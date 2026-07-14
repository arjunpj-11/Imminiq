import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AdminConsoleSettings } from '../../src/infrastructure/database/models/admin-console-settings.model';
import { MongoPlatformPolicyReader } from '../../src/infrastructure/mongo-platform-policy.reader';
import { mongoAdminSettingsRepository } from '../../src/modules/admin/settings/infrastructure/repositories/mongo-admin-settings.repository';
import { PLATFORM_POLICY_DEFAULTS } from '../../src/shared/platform-policy';

describe('admin settings persistence', () => {
  let mongo: MongoMemoryServer;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  it('persists a manual-test limit of 100 and exposes it to runtime policy readers', async () => {
    const productPolicy = {
      ...PLATFORM_POLICY_DEFAULTS,
      mockTests: { ...PLATFORM_POLICY_DEFAULTS.mockTests, maxManualQuestions: 100 },
    };
    const actor = {
      userId: new mongoose.Types.ObjectId().toString(),
      role: 'admin' as const,
      ipAddress: '127.0.0.1',
      userAgent: 'vitest',
    };

    const updated = await mongoAdminSettingsRepository.update(
      {
        allowBroadcasts: true,
        supportEmail: 'support@imminiq.com',
        auditRetentionDays: 365,
        productPolicy,
      },
      actor
    );

    expect(updated.productPolicy.mockTests.maxManualQuestions).toBe(100);
    expect(
      await AdminConsoleSettings.findOne({ key: 'global' })
        .select('productPolicy.mockTests.maxManualQuestions')
        .lean()
    ).toMatchObject({ productPolicy: { mockTests: { maxManualQuestions: 100 } } });
    await expect(new MongoPlatformPolicyReader().getMockTestPolicy()).resolves.toMatchObject({
      maxManualQuestions: 100,
    });
  });
});
