import { useMemo } from "react";
import { Bot, Download, FileText } from "lucide-react";

import {
  AdminEmpty,
  AdminError,
  AdminLoading,
  AdminMetricGrid,
  AdminPageHeader,
  AdminPanel,
} from "../../../../components/admin";
import {
  AdminDateRangeFilter,
  downloadCsv,
  downloadTablePdf,
  enumerateDateRange,
  useAdminDateRange,
} from "../../../../components/admin";
import { useAdminAITokenSpend } from "../hooks/useAdminAITokenSpend";

const categoryLabels: Record<string, string> = {
  roadmap_generation: "Roadmap / package generation",
  roadmap_evaluation: "Tracker evaluations",
  mock_test_generation: "Mock test generation",
  mock_test_evaluation: "Mock test evaluations",
  lesson_generation: "Lesson generation",
  lesson_practice: "Lesson practice",
  ai_tutoring: "AI tutoring",
  adaptive_learning: "Adaptive learning",
  tracker_verification: "Tracker verification",
  dashboard_insights: "Dashboard insights",
  other: "Other AI features",
};

const formatTokens = (value: number) => value.toLocaleString();

export default function AdminAITokenSpendPage() {
  const dateRange = useAdminDateRange(30);
  const { data, isLoading, isPlaceholderData, isError, error, refetch } = useAdminAITokenSpend(
    dateRange.range,
  );
  const daily = useMemo(() => {
    const values = new Map(
      data?.daily.map((point) => [point.date, point]) ?? [],
    );
    return enumerateDateRange(dateRange.range).map(
      (date) =>
        values.get(date) ?? {
          date,
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          requests: 0,
        },
    );
  }, [data, dateRange.range]);
  const maxDaily = Math.max(1, ...daily.map((point) => point.totalTokens));

  const downloadReport = async (format: "csv" | "pdf") => {
    if (!data) return;
    const filename = `ai-token-spend-${dateRange.range.from}-to-${dateRange.range.to}`;
    if (format === "csv") {
      downloadCsv(`${filename}.csv`, [
        ["AI TOKEN SPEND REPORT"],
        ["Date range", `${dateRange.range.from} to ${dateRange.range.to}`],
        ["Generated", new Date().toLocaleString()],
        [],
        ["SUMMARY"],
        [
          "Today tokens",
          "Period tokens",
          "Previous period",
          "Change %",
          "Prompt tokens",
          "Completion tokens",
          "AI requests",
        ],
        [
          data.summary.todayTokens,
          data.summary.totalTokens,
          data.summary.previousPeriodTokens,
          data.summary.changePercent ?? "No baseline",
          data.summary.promptTokens,
          data.summary.completionTokens,
          data.summary.requests,
        ],
        ["Monthly budget", data.budget.monthlyLimit],
        ["Month-to-date tokens", data.budget.monthTokens],
        ["Budget utilization %", data.budget.utilizationPercent],
        ["Budget state", data.budget.status],
        [],
        ["FEATURE BREAKDOWN"],
        [
          "Feature",
          "Prompt tokens",
          "Completion tokens",
          "Total tokens",
          "Requests",
        ],
        ...data.byCategory.map((row) => [
          categoryLabels[row.key] ?? row.key,
          row.promptTokens,
          row.completionTokens,
          row.totalTokens,
          row.requests,
        ]),
        [],
        ["DAILY USAGE"],
        [
          "Date",
          "Prompt tokens",
          "Completion tokens",
          "Total tokens",
          "Requests",
        ],
        ...daily.map((row) => [
          row.date,
          row.promptTokens,
          row.completionTokens,
          row.totalTokens,
          row.requests,
        ]),
      ]);
      return;
    }

    await downloadTablePdf({
      filename: `${filename}.pdf`,
      title: "AI Token Spend",
      description:
        "AI usage grouped by product feature for the selected reporting period.",
      filters: [`Date range: ${dateRange.range.from} to ${dateRange.range.to}`],
      summary: [
        { label: "Today", value: formatTokens(data.summary.todayTokens) },
        {
          label: "Period total",
          value: formatTokens(data.summary.totalTokens),
        },
        {
          label: "Prompt tokens",
          value: formatTokens(data.summary.promptTokens),
        },
        {
          label: "Completion tokens",
          value: formatTokens(data.summary.completionTokens),
        },
        { label: "AI requests", value: formatTokens(data.summary.requests) },
        {
          label: "Monthly budget used",
          value: `${data.budget.utilizationPercent}%`,
        },
      ],
      columns: [
        { header: "Feature", key: "feature" },
        { header: "Prompt", key: "prompt" },
        { header: "Completion", key: "completion" },
        { header: "Total", key: "total" },
        { header: "Requests", key: "requests" },
      ],
      rows: data.byCategory.map((row) => ({
        feature: categoryLabels[row.key] ?? row.key,
        prompt: formatTokens(row.promptTokens),
        completion: formatTokens(row.completionTokens),
        total: formatTokens(row.totalTokens),
        requests: formatTokens(row.requests),
      })),
      orientation: "landscape",
    });
  };

  return (
    <main className="mx-auto max-w-310 px-5 py-8 sm:px-8">
      <AdminPageHeader
        title="AI Token Spend"
        description="Daily AI token consumption and the product features responsible for it."
        action={
          <div className="flex flex-wrap gap-2">
            <AdminDateRangeFilter {...dateRange} />
            <button
              className="admin-button inline-flex items-center gap-2"
              disabled={!data || isLoading}
              onClick={() => void downloadReport("csv")}
            >
              <Download size={16} /> Download CSV
            </button>
            <button
              className="admin-primary-button inline-flex items-center gap-2"
              disabled={!data || isLoading}
              onClick={() => void downloadReport("pdf")}
            >
              <FileText size={16} /> Download PDF
            </button>
          </div>
        }
      />

      {isLoading || isPlaceholderData ? (
        <AdminLoading variant="analytics" />
      ) : isError ? (
        <AdminError error={error} onRetry={() => void refetch()} />
      ) : (
        data && (
          <>
            <AdminMetricGrid
              metrics={[
                {
                  label: "Tokens spent today",
                  value: data.summary.todayTokens,
                  tone: "accent",
                },
                {
                  label: "Selected period",
                  value: data.summary.totalTokens,
                  tone: "warning",
                },
                {
                  label: "Prompt tokens",
                  value: data.summary.promptTokens,
                  tone: "info",
                },
                {
                  label: "AI requests",
                  value: data.summary.requests,
                  tone: "success",
                },
              ]}
            />

            <AdminPanel title="Monthly budget guardrail">
              <div className="p-6">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span>
                    {formatTokens(data.budget.monthTokens)} of{" "}
                    {formatTokens(data.budget.monthlyLimit)} tokens used
                  </span>
                  <span
                    className={
                      data.budget.status === "exceeded"
                        ? "text-[#e26767]"
                        : data.budget.status === "warning"
                          ? "text-amber-300"
                          : "text-[#52c58c]"
                    }
                  >
                    {data.budget.utilizationPercent}% ·{" "}
                    {data.budget.status.replace("_", " ")}
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-[#11110f]">
                  <div
                    className={
                      data.budget.status === "exceeded"
                        ? "h-full bg-[#e26767]"
                        : data.budget.status === "warning"
                          ? "h-full bg-amber-400"
                          : "h-full bg-[#52c58c]"
                    }
                    style={{
                      width: `${Math.min(100, data.budget.utilizationPercent)}%`,
                    }}
                  />
                </div>
                <p className="mt-3 text-xs text-[#817c75]">
                  Warning begins at {data.budget.warningPercent}%.
                  Selected-period usage is{" "}
                  {data.summary.changePercent === null
                    ? "waiting for a comparison baseline"
                    : `${Math.abs(data.summary.changePercent)}% ${data.summary.changePercent >= 0 ? "higher" : "lower"} than the previous equivalent period`}
                  .
                </p>
              </div>
            </AdminPanel>

            <AdminPanel title="Daily token spend">
              <div className="admin-table-scroll overflow-x-auto p-5 sm:p-7">
                <div
                  className="flex h-64 min-w-max items-end gap-2 border-b border-white/10 px-2"
                  role="img"
                  aria-label={`Daily AI token spend. ${daily.map((point) => `${point.date}: ${point.totalTokens} tokens`).join(", ")}`}
                >
                  {daily.map((point, index) => (
                    <div
                      key={point.date}
                      className="group flex h-full w-8 shrink-0 flex-col justify-end"
                    >
                      <span className="admin-chart-value opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                        {formatTokens(point.totalTokens)}
                      </span>
                      <div
                        tabIndex={0}
                        aria-label={`${point.date}: ${formatTokens(point.totalTokens)} tokens`}
                        title={`${point.date}: ${formatTokens(point.totalTokens)} tokens`}
                        className="admin-chart-bar w-full"
                        style={{
                          height: point.totalTokens
                            ? `${Math.max(4, (point.totalTokens / maxDaily) * 86)}%`
                            : "2px",
                          background: point.totalTokens
                            ? "linear-gradient(180deg, #f0917c, #e8816a)"
                            : undefined,
                        }}
                      />
                      <span
                        className={`mt-2 -rotate-45 text-[8px] text-[#817c75] ${index % 5 === 0 || index === daily.length - 1 ? "block" : "invisible"}`}
                      >
                        {point.date.slice(5)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </AdminPanel>

            <AdminPanel title="Spend by feature">
              {data.byCategory.length ? (
                <div className="admin-table-scroll overflow-x-auto">
                  <table className="admin-table w-full min-w-180 text-left text-sm">
                    <caption className="sr-only">
                      AI token spend by category
                    </caption>
                    <thead className="bg-[#24211e] text-[10px] uppercase tracking-wider text-[#817c75]">
                      <tr>
                        <th scope="col" className="px-6 py-3">
                          Feature
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Prompt
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Completion
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Total tokens
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Requests
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Share
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.byCategory.map((row) => (
                        <tr key={row.key} className="border-t border-white/7">
                          <td className="px-6 py-4 font-semibold text-[#f2f0eb]">
                            {categoryLabels[row.key] ?? row.key}
                          </td>
                          <td className="px-6 py-4 text-[#aaa59d]">
                            {formatTokens(row.promptTokens)}
                          </td>
                          <td className="px-6 py-4 text-[#aaa59d]">
                            {formatTokens(row.completionTokens)}
                          </td>
                          <td className="px-6 py-4 font-semibold text-[#e8816a]">
                            {formatTokens(row.totalTokens)}
                          </td>
                          <td className="px-6 py-4 text-[#aaa59d]">
                            {formatTokens(row.requests)}
                          </td>
                          <td className="px-6 py-4 text-[#52c58c]">
                            {data.summary.totalTokens
                              ? `${((row.totalTokens / data.summary.totalTokens) * 100).toFixed(1)}%`
                              : "0%"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <AdminEmpty>
                  No AI token usage has been recorded in this date range.
                </AdminEmpty>
              )}
            </AdminPanel>

            <AdminPanel title="Provider usage">
              <div className="grid gap-3 p-6 sm:grid-cols-2 lg:grid-cols-3">
                {data.byProvider.length ? (
                  data.byProvider.map((row) => (
                    <div key={row.key} className="rounded-lg bg-[#24211e] p-5">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Bot size={16} className="text-[#e8816a]" /> {row.key}
                      </div>
                      <div className="font-editorial mt-3 text-2xl text-[#52c58c]">
                        {formatTokens(row.totalTokens)}
                      </div>
                      <div className="mt-1 text-xs text-[#817c75]">
                        {formatTokens(row.requests)} requests
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-[#aaa59d]">
                    No provider usage recorded.
                  </div>
                )}
              </div>
            </AdminPanel>
          </>
        )
      )}
    </main>
  );
}
