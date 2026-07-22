import { Database, MemoryStick, RotateCcw, Server, Trash2, XCircle, Zap } from "lucide-react";
import { useState } from "react";
import {
  AdminError,
  AdminLoading,
  AdminMetricGrid,
  AdminPageHeader,
  AdminPanel,
  AdminStatusBadge,
  AdminPaginationControls,
} from "../../../../components/admin";
import AdminModal from "../../../../components/admin/AdminModal";
import AdminActionPasswordField from "../../../../components/admin/AdminActionPasswordField";
import { isAdminActionPasswordReady } from "../../../../lib/admin/admin-action-password";
import { getUserFacingError } from "../../../../lib/user-facing-error";
import { toast } from "../../../../lib/toast";
import { useAdminSystemHealth } from "../hooks/useAdminSystemHealth";
import { useAdminJobWorklist } from "../hooks/useAdminJobWorklist";
import { useAdminJobAction } from "../hooks/useAdminJobAction";
import type { AdminBackgroundJob } from "../types/admin-system-health.types";
export default function AdminSystemHealthPage() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useAdminSystemHealth();
  const [queue, setQueue] = useState("all");
  const [jobStatus, setJobStatus] = useState("all");
  const [jobPage, setJobPage] = useState(1);
  const [pendingAction, setPendingAction] = useState<{
    job: AdminBackgroundJob;
    action: "cancel" | "retry" | "remove";
  } | null>(null);
  const [actionPassword, setActionPassword] = useState("");
  const jobs = useAdminJobWorklist({ queue, status: jobStatus, page: jobPage });
  const jobAction = useAdminJobAction();
  const closeAction = () => {
    if (jobAction.isPending) return;
    setPendingAction(null);
    setActionPassword("");
  };
  const confirmAction = () => {
    if (!pendingAction) return;
    jobAction.mutate(
      {
        queue: pendingAction.job.queue,
        jobId: pendingAction.job.id,
        action: pendingAction.action,
        actionPassword,
      },
      {
        onSuccess: () => {
          toast.success("Background job updated", `${pendingAction.action} completed successfully.`);
          closeAction();
        },
        onError: (jobError) => toast.error("Job action failed", getUserFacingError(jobError)),
      },
    );
  };
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
        <AdminLoading variant="health" />
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
            <AdminPanel
              title="Background worklist"
              toolbar={
                <div className="flex flex-wrap gap-3">
                  <select className="admin-select" value={queue} onChange={(event) => { setQueue(event.target.value); setJobPage(1); }}>
                    <option value="all">All queues</option>
                    {data.queues.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
                  </select>
                  <select className="admin-select" value={jobStatus} onChange={(event) => { setJobStatus(event.target.value); setJobPage(1); }}>
                    <option value="all">All states</option><option value="waiting">Waiting</option><option value="active">Active</option><option value="delayed">Delayed</option><option value="failed">Failed</option><option value="completed">Completed</option>
                  </select>
                  <button type="button" className="admin-button" onClick={() => void jobs.refetch()}>{jobs.isFetching ? "Refreshing…" : "Refresh worklist"}</button>
                </div>
              }
            >
              {jobs.isError ? (
                <AdminError error={jobs.error} onRetry={() => void jobs.refetch()} />
              ) : (
                <>
                  <div className="admin-table-scroll overflow-x-auto">
                    <table className="admin-table w-full min-w-230 text-left text-sm">
                      <thead><tr><th>Queue / task</th><th>State</th><th>Attempts</th><th>Started</th><th>Finished</th><th>Failure</th><th>Safe action</th></tr></thead>
                      <tbody>
                        {jobs.data?.items.map((job) => (
                          <tr key={`${job.queue}-${job.id}`}>
                            <td><div className="font-semibold capitalize">{job.queue} · {job.name.replaceAll("-", " ")}</div><div className="mt-1 font-mono text-[10px] text-[#817c75]">{job.applicationJobId ?? job.id}</div></td>
                            <td><AdminStatusBadge value={job.state} /></td>
                            <td>{job.attemptsMade} / {job.maxAttempts}</td>
                            <td>{job.processedOn ? new Date(job.processedOn).toLocaleString() : "Not started"}</td>
                            <td>{job.finishedOn ? new Date(job.finishedOn).toLocaleString() : "—"}</td>
                            <td className="max-w-70 text-xs text-[#aaa59d]">{job.failedReason || "—"}</td>
                            <td>
                              {job.state === "failed" ? <div className="flex gap-2"><button className="admin-button" onClick={() => setPendingAction({ job, action: "retry" })}><RotateCcw size={14} /> Retry</button><button className="admin-button text-[#e26767]" onClick={() => setPendingAction({ job, action: "remove" })}><Trash2 size={14} /> Remove</button></div>
                                : job.state === "completed" ? <button className="admin-button" onClick={() => setPendingAction({ job, action: "remove" })}><Trash2 size={14} /> Remove</button>
                                  : ["waiting", "delayed"].includes(job.state) ? <button className="admin-button text-[#e26767]" onClick={() => setPendingAction({ job, action: "cancel" })}><XCircle size={14} /> Cancel</button>
                                    : <span className="text-xs text-[#817c75]">Active · finishing safely</span>}
                            </td>
                          </tr>
                        ))}
                        {!jobs.isLoading && !jobs.data?.items.length && <tr><td colSpan={7} className="py-10 text-center text-[#817c75]">No jobs match these filters.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                  <AdminPaginationControls page={jobPage} pages={jobs.data?.pagination.pages ?? 1} label="background jobs" onPageChange={setJobPage} />
                </>
              )}
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
      <AdminModal open={Boolean(pendingAction)} onClose={closeAction} preventClose={jobAction.isPending} ariaLabel="Confirm background job action" contentClassName="max-w-md">
        <h2 className="font-editorial text-2xl font-bold capitalize">{pendingAction?.action} background job?</h2>
        <p className="mt-2 text-sm leading-6 text-[#aaa59d]">This action is limited to safe queue states. Active work is never force-killed because that can leave partially written data.</p>
        <AdminActionPasswordField value={actionPassword} onChange={setActionPassword} className="admin-field mt-5" />
        <div className="mt-6 flex justify-end gap-2"><button className="admin-button" onClick={closeAction}>Cancel</button><button className="admin-primary-button" disabled={!isAdminActionPasswordReady(actionPassword) || jobAction.isPending} onClick={confirmAction}>{jobAction.isPending ? "Working…" : "Confirm"}</button></div>
      </AdminModal>
    </main>
  );
}
