import { Queue } from 'bullmq';
import { redis } from '../cache/redis.client';

const connection = { connection: redis };

export const aiQueue = new Queue('ai', connection);
export const streakQueue = new Queue('streak', connection);
export const analyticsQueue = new Queue('analytics', connection);
export const notificationQueue = new Queue('notification', connection);
