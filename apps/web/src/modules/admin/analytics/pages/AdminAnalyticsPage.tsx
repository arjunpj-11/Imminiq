import { useMemo } from "react";
import { Download, FileText } from "lucide-react";
import {
  AdminError,
  AdminLoading,
  AdminMetricGrid,
  AdminPageHeader,
  AdminPanel,
} from "../../../../components/admin";
import { useAdminAnalytics } from "../hooks/useAdminAnalytics";
import {
  AdminDateRangeFilter,
  downloadCsv,
  downloadTablePdf,
  enumerateDateRange,
  useAdminDateRange,
} from "../../../../components/admin";

export default function AdminAnalyticsPage() {
  const dateRange = useAdminDateRange(30);
  const { data, isLoading, isPlaceholderData, isError, error, refetch } = useAdminAnalytics(
    dateRange.range,
  );
  const activity = useMemo(() => {
    const values = new Map(
      data?.dailyActivity.map((point) => [point.date, point.value]) ?? [],
    );
    return enumerateDateRange(dateRange.range).map((date) => ({
      date,
      value: values.get(date) ?? 0,
    }));
  }, [data, dateRange.range]);
  const max = Math.max(1, ...activity.map((point) => point.value));
  const downloadAnalyticsReport = async (format: "csv" | "pdf") => {
    if (!data) return;
    const users = new Map(
      data.dailyUsers.map((point) => [point.date, point.value]),
    );
    if (format === "csv") {
      downloadCsv(
        `platform-activity-${dateRange.range.from}-to-${dateRange.range.to}.csv`,
        [
          ["PLATFORM ACTIVITY REPORT"],
          ["Date range", `${dateRange.range.from} to ${dateRange.range.to}`],
          ["Generated", new Date().toLocaleString()],
          [],
          ["SUMMARY METRICS"],
          [
            "Registered users",
            "Active users",
            "Trackers",
            "Tests",
            "Test attempts",
          ],
          [
            data.metrics.users,
            data.metrics.activeUsers,
            data.metrics.trackers,
            data.metrics.tests,
            data.metrics.attempts,
          ],
          [],
          ["DAILY RESULTS"],
          ["Date", "Platform activity", "New users"],
          ...activity.map((point) => [
            point.date,
            point.value,
            users.get(point.date) ?? 0,
          ]),
        ],
      );
      return;
    }
    await downloadTablePdf({
      filename: `platform-activity-${dateRange.range.from}-to-${dateRange.range.to}.pdf`,
      title: "Platform Activity",
      description:
        "Adoption and engagement signals for the selected reporting period.",
      filters: [`Date range: ${dateRange.range.from} to ${dateRange.range.to}`],
      summary: [
        { label: "Registered users", value: data.metrics.users },
        { label: "Active users", value: data.metrics.activeUsers },
        { label: "Trackers", value: data.metrics.trackers },
        { label: "Tests", value: data.metrics.tests },
        { label: "Test attempts", value: data.metrics.attempts },
      ],
      columns: [
        { header: "Date", key: "date" },
        { header: "Platform activity", key: "activity" },
        { header: "New users", key: "users" },
      ],
      rows: activity.map((point) => ({
        date: point.date,
        activity: point.value,
        users: users.get(point.date) ?? 0,
      })),
      orientation: "portrait",
    });
  };
  return (
    <main className="mx-auto max-w-310 px-5 py-8 sm:px-8">
      <AdminPageHeader
        title="Platform Activity"
        description="Live adoption and engagement signals calculated for the selected date range."
        action={
          <div className="flex flex-wrap gap-2">
            <AdminDateRangeFilter {...dateRange} />
            <button
              className="admin-button inline-flex items-center gap-2"
              disabled={!data || isLoading}
              onClick={() => void downloadAnalyticsReport("csv")}
            >
              <Download size={16} /> Download CSV
            </button>
            <button
              className="admin-primary-button inline-flex items-center gap-2"
              disabled={!data || isLoading}
              onClick={() => void downloadAnalyticsReport("pdf")}
            >
              <FileText size={16} /> Download PDF
            </button>
          </div>
        }
      />
      {isLoading || isPlaceholderData ? (
        <AdminLoading />
      ) : isError ? (
        <AdminError error={error} onRetry={() => void refetch()} />
      ) : (
        data && (
          <>
            <AdminMetricGrid
              metrics={[
                { label: "Registered users", value: data.metrics.users },
                {
                  label: `Active (${data.rangeDays}d)`,
                  value: data.metrics.activeUsers,
                  tone: "success",
                },
                {
                  label: "Trackers",
                  value: data.metrics.trackers,
                  tone: "info",
                },
                {
                  label: "Test attempts",
                  value: data.metrics.attempts,
                  tone: "warning",
                },
              ]}
            />
            <AdminPanel title="Daily platform activity">
              <div className="admin-table-scroll overflow-x-auto p-5 sm:p-7">
                <div
                  className="flex h-64 min-w-max items-end gap-2 border-b border-white/10 px-2"
                  role="img"
                  aria-label={`Daily platform activity. ${activity.map((point) => `${point.date}: ${point.value} events`).join(", ")}`}
                >
                  {activity.map((point, index) => (
                    <div
                      key={point.date}
                      className="group flex h-full w-8 shrink-0 flex-col justify-end"
                    >
                      <span className="admin-chart-value opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                        {point.value}
                      </span>
                      <div
                        tabIndex={0}
                        aria-label={`${point.date}: ${point.value} events`}
                        title={`${point.date}: ${point.value} events`}
                        className="admin-chart-bar w-full"
                        style={{
                          height: point.value
                            ? `${Math.max(4, (point.value / max) * 86)}%`
                            : "2px",
                          background: point.value
                            ? "linear-gradient(180deg, #f0917c, #e8816a)"
                            : undefined,
                        }}
                      />
                      <span
                        className={`mt-2 -rotate-45 text-[8px] text-[#817c75] ${index % 5 === 0 || index === activity.length - 1 ? "block" : "invisible"}`}
                      >
                        {point.date.slice(5)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </AdminPanel>
            <AdminPanel title="New users">
              <div className="grid gap-3 p-6 sm:grid-cols-2 lg:grid-cols-4">
                {data.dailyUsers.slice(-8).map((point) => (
                  <div
                    key={point.date}
                    className="admin-interactive-card rounded-lg border border-white/8 bg-[#24211e] p-4"
                  >
                    <div className="text-xs text-[#aaa59d]">{point.date}</div>
                    <div className="font-editorial mt-2 text-2xl text-[#52c58c]">
                      +{point.value}
                    </div>
                  </div>
                ))}
              </div>
            </AdminPanel>
          </>
        )
      )}
    </main>
  );
}
