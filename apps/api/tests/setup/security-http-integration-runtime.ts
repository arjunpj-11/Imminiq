import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import type { Express } from 'express';

type RedisTestClient = {
  flushdb(): Promise<unknown>;
  quit(): Promise<unknown>;
};

export type SecurityHttpIntegrationRuntime = {
  app: Express;
  redis: RedisTestClient;
  clearState(): Promise<void>;
  stop(): Promise<void>;
};

export const startSecurityHttpIntegrationRuntime =
  async (): Promise<SecurityHttpIntegrationRuntime> => {
    const mongoServer = await MongoMemoryServer.create();

    process.env.MONGO_URI = mongoServer.getUri();
    process.env.REDIS_URL ??= 'redis://127.0.0.1:6379/15';

    /**
     * Import after overriding MONGO_URI so env parsing and any lazy
     * database configuration read the in-memory Mongo test URI.
     */
    const [{ default: app }, { redis }] = await Promise.all([
      import('../../src/app'),
      import('../../src/config/redis'),
    ]);

    await mongoose.connect(process.env.MONGO_URI);
    await redis.flushdb();

    return {
      app,
      redis: redis as RedisTestClient,

      async clearState() {
        await Promise.all([mongoose.connection.db?.dropDatabase(), redis.flushdb()]);
      },

      async stop() {
        await Promise.allSettled([redis.flushdb(), mongoose.disconnect()]);

        await Promise.allSettled([redis.quit(), mongoServer.stop()]);
      },
    };
  };
