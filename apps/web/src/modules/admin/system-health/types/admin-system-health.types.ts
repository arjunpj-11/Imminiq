export type AdminSystemHealth = {
  status: string;
  checkedAt: string;
  uptimeSeconds: number;
  services: {
    api: { status: string };
    mongodb: { status: string; collections: number };
    redis: { status: string; latencyMs: number | null };
  };
  memory: { rssMb: number; heapUsedMb: number; heapTotalMb: number };
  nodeVersion: string;
};
