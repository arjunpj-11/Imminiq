export type AdminSystemHealth = {
  status: string;
  checkedAt: string;
  uptimeSeconds: number;
  services: {
    api: { status: string };
    mongodb: { status: string; collections: number };
    redis: { status: string; latencyMs: number | null };
  };
  queues: Array<{
    name: string;
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    status: 'healthy' | 'warning' | 'critical';
  }>;
  alerts: Array<{
    severity: 'warning' | 'critical';
    code: string;
    message: string;
  }>;
  memory: { rssMb: number; heapUsedMb: number; heapTotalMb: number };
  nodeVersion: string;
};

export type AdminBackgroundJob = {
  id: string;
  queue: string;
  name: string;
  state: 'waiting' | 'active' | 'delayed' | 'completed' | 'failed';
  progress: number;
  attemptsMade: number;
  maxAttempts: number;
  timestamp: number;
  processedOn?: number | null;
  finishedOn?: number | null;
  failedReason?: string | null;
  applicationJobId?: string | null;
};
