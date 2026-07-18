import { Database, MemoryStick, Server, Zap } from "lucide-react";
import {
  AdminError,
  AdminLoading,
  AdminMetricGrid,
  AdminPageHeader,
  AdminPanel,
  AdminStatusBadge,
} from "../../../../components/admin";
import { useAdminSystemHealth } from "../hooks/useAdminSystemHealth";
export default function AdminSystemHealthPage() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useAdminSystemHealth();
  return (
    <main className="mx-auto max-w-310 px-5 py-8 sm:px-8">
      <AdminPageHeader
        title="System Health"
        description="Live dependency and runtime telemetry refreshed every fifteen seconds."
        action={
          <button onClick={() => void refetch()} className="admin-button">
            {isFetching ? "Checking…" : "Refresh now"}
          </button>
        }
      />
      {isLoading ? (
        <AdminLoading />
      ) : isError ? (
        <AdminError error={error} onRetry={() => void refetch()} />
      ) : (
        data && (
          <>
            <AdminMetricGrid
              metrics={[
                {
                  label: "Overall state",
                  value: data.status,
                  tone: data.status === "healthy" ? "success" : "warning",
                },
                {
                  label: "Uptime",
                  value: `${Math.floor(data.uptimeSeconds / 3600)}h ${Math.floor((data.uptimeSeconds % 3600) / 60)}m`,
                  tone: "info",
                },
                {
                  label: "Heap usage",
                  value: `${data.memory.heapUsedMb} MB`,
                  tone: "accent",
                },
                {
                  label: "Node runtime",
                  value: data.nodeVersion,
                  tone: "warning",
                },
              ]}
            />
            <AdminPanel title="Dependencies">
              <div className="grid gap-4 p-6 md:grid-cols-3">
                {[
                  {
                    name: "API server",
                    icon: Server,
                    status: data.services.api.status,
                    detail: "Express application",
                  },
                  {
                    name: "MongoDB",
                    icon: Database,
                    status: data.services.mongodb.status,
                    detail: `${data.services.mongodb.collections} collections`,
                  },
                  {
                    name: "Redis",
                    icon: Zap,
                    status: data.services.redis.status,
                    detail:
                      data.services.redis.latencyMs === null
                        ? "Unavailable"
                        : `${data.services.redis.latencyMs}ms latency`,
                  },
                ].map(({ name, icon: Icon, status, detail }) => (
                  <div
                    key={name}
                    className="rounded-xl border border-white/10 bg-[#24211e] p-5"
                  >
                    <div className="flex items-center justify-between">
                      <Icon className="text-[#e8816a]" />
                      <AdminStatusBadge value={status} />
                    </div>
                    <h3 className="mt-5 font-semibold">{name}</h3>
                    <p className="mt-1 text-xs text-[#aaa59d]">{detail}</p>
                  </div>
                ))}
              </div>
            </AdminPanel>
            <AdminPanel title="Memory">
              <div className="p-6">
                <div className="mb-3 flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <MemoryStick size={16} />
                    V8 heap
                  </span>
                  <span>
                    {data.memory.heapUsedMb} / {data.memory.heapTotalMb} MB
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-[#11110f]">
                  <div
                    className="h-full bg-[#e8816a]"
                    style={{
                      width: `${Math.min(100, (data.memory.heapUsedMb / Math.max(1, data.memory.heapTotalMb)) * 100)}%`,
                    }}
                  />
                </div>
                <p className="mt-3 text-xs text-[#817c75]">
                  Resident set size: {data.memory.rssMb} MB · checked{" "}
                  {new Date(data.checkedAt).toLocaleTimeString()}
                </p>
              </div>
            </AdminPanel>
            <AdminPanel title="Background queues">
              <div className="admin-table-scroll overflow-x-auto">
                <table className="admin-table w-full min-w-180 text-left text-sm">
                  <caption className="sr-only">Background queue health</caption>
                  <thead>
                    <tr>
                      <th scope="col">Queue</th>
                      <th scope="col">Waiting</th>
                      <th scope="col">Active</th>
                      <th scope="col">Delayed</th>
                      <th scope="col">Failed</th>
                      <th scope="col">State</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.queues.map((queue) => (
                      <tr key={queue.name}>
                        <td className="font-semibold capitalize">
                          {queue.name}
                        </td>
                        <td>{queue.waiting}</td>
                        <td>{queue.active}</td>
                        <td>{queue.delayed}</td>
                        <td>{queue.failed}</td>
                        <td>
                          <AdminStatusBadge value={queue.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AdminPanel>
            {data.alerts.length > 0 && (
              <AdminPanel title="Operational alerts">
                <div className="space-y-3 p-6">
                  {data.alerts.map((alert) => (
                    <div
                      key={alert.code}
                      className={`rounded-lg border p-4 text-sm ${alert.severity === "critical" ? "border-red-500/40 bg-red-500/10 text-red-200" : "border-amber-400/40 bg-amber-400/10 text-amber-100"}`}
                    >
                      <strong>{alert.code.replaceAll("_", " ")}</strong>
                      <p className="mt-1 opacity-80">{alert.message}</p>
                    </div>
                  ))}
                </div>
              </AdminPanel>
            )}
          </>
        )
      )}
    </main>
  );
}
