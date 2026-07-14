import { useMemo } from 'react';
import { Bot, Download, FileText } from 'lucide-react';

import {
  AdminEmpty,
  AdminError,
  AdminLoading,
  AdminMetricGrid,
  AdminPageHeader,
  AdminPanel,
} from '../../shared';
import {
  AdminDateRangeFilter,
  downloadCsv,
  downloadTablePdf,
  enumerateDateRange,
  useAdminDateRange,
} from '../../shared';
import { useAdminAITokenSpend } from '../hooks/useAdminAITokenSpend';

const categoryLabels: Record<string, string> = {
  roadmap_generation: 'Roadmap / package generation',
  roadmap_evaluation: 'Tracker evaluations',
  mock_test_generation: 'Mock test generation',
  mock_test_evaluation: 'Mock test evaluations',
  lesson_generation: 'Lesson generation',
  lesson_practice: 'Lesson practice',
  ai_tutoring: 'AI tutoring',
  adaptive_learning: 'Adaptive learning',
  tracker_verification: 'Tracker verification',
  dashboard_insights: 'Dashboard insights',
  other: 'Other AI features',
};

const formatTokens = (value: number) => value.toLocaleString();

export default function AdminAITokenSpendPage() {
  const dateRange = useAdminDateRange(30);
  const { data, isLoading, isError, error } = useAdminAITokenSpend(dateRange.range);
  const daily = useMemo(() => {
    const values = new Map(data?.daily.map((point) => [point.date, point]) ?? []);
    return enumerateDateRange(dateRange.range).map(
      (date) =>
        values.get(date) ?? {
          date,
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          requests: 0,
        }
    );
  }, [data, dateRange.range]);
  const maxDaily = Math.max(1, ...daily.map((point) => point.totalTokens));

  const downloadReport = async (format: 'csv' | 'pdf') => {
    if (!data) return;
    const filename = `ai-token-spend-${dateRange.range.from}-to-${dateRange.range.to}`;
    if (format === 'csv') {
      downloadCsv(`${filename}.csv`, [
        ['AI TOKEN SPEND REPORT'],
        ['Date range', `${dateRange.range.from} to ${dateRange.range.to}`],
        ['Generated', new Date().toLocaleString()],
        [],
        ['SUMMARY'],
        ['Today tokens', 'Period tokens', 'Prompt tokens', 'Completion tokens', 'AI requests'],
        [
          data.summary.todayTokens,
          data.summary.totalTokens,
          data.summary.promptTokens,
          data.summary.completionTokens,
          data.summary.requests,
        ],
        [],
        ['FEATURE BREAKDOWN'],
        ['Feature', 'Prompt tokens', 'Completion tokens', 'Total tokens', 'Requests'],
        ...data.byCategory.map((row) => [
          categoryLabels[row.key] ?? row.key,
          row.promptTokens,
          row.completionTokens,
          row.totalTokens,
          row.requests,
        ]),
        [],
        ['DAILY USAGE'],
        ['Date', 'Prompt tokens', 'Completion tokens', 'Total tokens', 'Requests'],
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
      title: 'AI Token Spend',
      description: 'AI usage grouped by product feature for the selected reporting period.',
      filters: [`Date range: ${dateRange.range.from} to ${dateRange.range.to}`],
      summary: [
        { label: 'Today', value: formatTokens(data.summary.todayTokens) },
        { label: 'Period total', value: formatTokens(data.summary.totalTokens) },
        { label: 'Prompt tokens', value: formatTokens(data.summary.promptTokens) },
        { label: 'Completion tokens', value: formatTokens(data.summary.completionTokens) },
        { label: 'AI requests', value: formatTokens(data.summary.requests) },
      ],
      columns: [
        { header: 'Feature', key: 'feature' },
        { header: 'Prompt', key: 'prompt' },
        { header: 'Completion', key: 'completion' },
        { header: 'Total', key: 'total' },
        { header: 'Requests', key: 'requests' },
      ],
      rows: data.byCategory.map((row) => ({
        feature: categoryLabels[row.key] ?? row.key,
        prompt: formatTokens(row.promptTokens),
        completion: formatTokens(row.completionTokens),
        total: formatTokens(row.totalTokens),
        requests: formatTokens(row.requests),
      })),
      orientation: 'landscape',
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
              onClick={() => void downloadReport('csv')}
            >
              <Download size={16} /> Download CSV
            </button>
            <button
              className="admin-primary-button inline-flex items-center gap-2"
              disabled={!data || isLoading}
              onClick={() => void downloadReport('pdf')}
            >
              <FileText size={16} /> Download PDF
            </button>
          </div>
        }
      />

      {isLoading ? (
        <AdminLoading />
      ) : isError ? (
        <AdminError error={error} />
      ) : (
        data && (
          <>
            <AdminMetricGrid
              metrics={[
                { label: 'Tokens spent today', value: data.summary.todayTokens, tone: 'accent' },
                { label: 'Selected period', value: data.summary.totalTokens, tone: 'warning' },
                { label: 'Prompt tokens', value: data.summary.promptTokens, tone: 'info' },
                { label: 'AI requests', value: data.summary.requests, tone: 'success' },
              ]}
            />

            <AdminPanel title="Daily token spend">
              <div className="overflow-x-auto p-7">
                <div className="flex h-64 min-w-max items-end gap-2 border-b border-white/10 px-2">
                  {daily.map((point) => (
                    <div
                      key={point.date}
                      className="group flex h-full w-7 shrink-0 flex-col justify-end"
                    >
                      <div
                        title={`${point.date}: ${formatTokens(point.totalTokens)} tokens`}
                        className={`w-full rounded-t transition ${point.totalTokens ? 'bg-[#e8816a] hover:bg-[#d4705a]' : 'bg-[#2a2723]'}`}
                        style={{
                          height: point.totalTokens
                            ? `${Math.max(4, (point.totalTokens / maxDaily) * 100)}%`
                            : '2px',
                        }}
                      />
                      <span className="mt-2 hidden -rotate-45 text-[8px] text-[#817c75] group-last:block">
                        {point.date.slice(5)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </AdminPanel>

            <AdminPanel title="Spend by feature">
              {data.byCategory.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="bg-[#24211e] text-[10px] uppercase tracking-wider text-[#817c75]">
                      <tr>
                        <th className="px-6 py-3">Feature</th>
                        <th className="px-6 py-3">Prompt</th>
                        <th className="px-6 py-3">Completion</th>
                        <th className="px-6 py-3">Total tokens</th>
                        <th className="px-6 py-3">Requests</th>
                        <th className="px-6 py-3">Share</th>
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
                          <td className="px-6 py-4 text-[#aaa59d]">{formatTokens(row.requests)}</td>
                          <td className="px-6 py-4 text-[#52c58c]">
                            {data.summary.totalTokens
                              ? `${((row.totalTokens / data.summary.totalTokens) * 100).toFixed(1)}%`
                              : '0%'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <AdminEmpty>No AI token usage has been recorded in this date range.</AdminEmpty>
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
                  <div className="text-sm text-[#aaa59d]">No provider usage recorded.</div>
                )}
              </div>
            </AdminPanel>
          </>
        )
      )}
    </main>
  );
}
