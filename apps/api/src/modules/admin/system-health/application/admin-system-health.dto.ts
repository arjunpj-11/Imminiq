export interface AdminSystemHealthDTO {
  status: string;
  checkedAt: Date;
  uptimeSeconds: number;
  services: {
    api: { status: string };
    mongodb: { status: string; collections: number };
    redis: { status: string; latencyMs: number | null };
  };
  memory: { rssMb: number; heapUsedMb: number; heapTotalMb: number };
  nodeVersion: string;
}
