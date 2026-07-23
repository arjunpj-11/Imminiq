import mongoose from 'mongoose';
import { redis } from '../../../../../config/redis';
import type { IAdminSystemHealthRepository } from '../../domain/repositories/admin-system-health.repository.interface';
import {
  aiQueue,
  analyticsQueue,
  emailQueue,
  notificationQueue,
  streakQueue,
} from '../../../../../infrastructure/queue/queues';
export class RuntimeAdminSystemHealthRepository implements IAdminSystemHealthRepository {
  async inspect() {
    let redisReady: boolean;
    let redisLatencyMs: number | null = null;
    const started = Date.now();
    try {
      redisReady = (await redis.ping()) === 'PONG';
      redisLatencyMs = Date.now() - started;
    } catch {
      redisReady = false;
    }
    const mongoReady = mongoose.connection.readyState === 1;
    const memory = process.memoryUsage();
    const collections =
      mongoReady && mongoose.connection.db
        ? await mongoose.connection.db.listCollections().toArray()
        : [];
    const queueInstances = [aiQueue, emailQueue, notificationQueue, analyticsQueue, streakQueue];
    const queues = redisReady
      ? await Promise.all(
          queueInstances.map(async (queue) => {
            try {
              const counts = await queue.getJobCounts(
                'waiting',
                'active',
                'completed',
                'failed',
                'delayed'
              );
              const status =
                counts.failed >= 25
                  ? 'critical'
                  : counts.failed >= 5 || counts.waiting >= 100
                    ? 'warning'
                    : 'healthy';
              return {
                name: queue.name,
                waiting: counts.waiting,
                active: counts.active,
                completed: counts.completed,
                failed: counts.failed,
                delayed: counts.delayed,
                status,
              } as const;
            } catch {
              return {
                name: queue.name,
                waiting: 0,
                active: 0,
                completed: 0,
                failed: 0,
                delayed: 0,
                status: 'critical' as const,
              };
            }
          })
        )
      : queueInstances.map((queue) => ({
          name: queue.name,
          waiting: 0,
          active: 0,
          completed: 0,
          failed: 0,
          delayed: 0,
          status: 'critical' as const,
        }));
    const heapRatio = memory.heapUsed / Math.max(1, memory.heapTotal);
    const alerts: Array<{ severity: 'warning' | 'critical'; code: string; message: string }> = [];
    if (!mongoReady)
      alerts.push({
        severity: 'critical',
        code: 'MONGODB_DOWN',
        message: 'MongoDB is unavailable.',
      });
    if (!redisReady)
      alerts.push({
        severity: 'critical',
        code: 'REDIS_DOWN',
        message: 'Redis and background queues are unavailable.',
      });
    if (heapRatio >= 0.85)
      alerts.push({
        severity: heapRatio >= 0.95 ? 'critical' : 'warning',
        code: 'HIGH_HEAP',
        message: `Heap utilization is ${Math.round(heapRatio * 100)}%.`,
      });
    for (const queue of queues.filter((item) => item.status !== 'healthy'))
      alerts.push({
        severity: queue.status === 'critical' ? 'critical' : 'warning',
        code: `QUEUE_${queue.name.toUpperCase()}_BACKLOG`,
        message: `${queue.name} queue has ${queue.waiting} waiting and ${queue.failed} failed jobs.`,
      });
    return {
      status:
        mongoReady && redisReady && !queues.some((queue) => queue.status === 'critical')
          ? alerts.length
            ? 'degraded'
            : 'healthy'
          : 'degraded',
      checkedAt: new Date(),
      uptimeSeconds: Math.floor(process.uptime()),
      services: {
        api: { status: 'healthy' },
        mongodb: { status: mongoReady ? 'healthy' : 'down', collections: collections.length },
        redis: { status: redisReady ? 'healthy' : 'down', latencyMs: redisLatencyMs },
      },
      queues,
      alerts,
      memory: {
        rssMb: Math.round(memory.rss / 1048576),
        heapUsedMb: Math.round(memory.heapUsed / 1048576),
        heapTotalMb: Math.round(memory.heapTotal / 1048576),
      },
      nodeVersion: process.version,
    };
  }
}
export const runtimeAdminSystemHealthRepository = new RuntimeAdminSystemHealthRepository();
