export interface AdminSystemHealthDTO {
  status: string;
  checkedAt: Date;
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
  alerts: Array<{ severity: 'warning' | 'critical'; code: string; message: string }>;
  memory: { rssMb: number; heapUsedMb: number; heapTotalMb: number };
  nodeVersion: string;
}
