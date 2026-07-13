import { useState } from 'react';
import { Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  AdminEmpty,
  AdminError,
  AdminLoading,
  AdminMetricGrid,
  AdminPageHeader,
  AdminPanel,
  AdminSearch,
  AdminStatusBadge,
} from '../../../../components/admin/AdminPage';
import { useDebouncedValue } from '../../../../hooks/useDebouncedValue';
import { useAdminMockTests } from '../hooks/useAdminMockTests';

export default function AdminMockTestsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useAdminMockTests({
    search: useDebouncedValue(search, 300),
    status,
    page,
  });
  return (
    <main className="mx-auto max-w-[1240px] px-5 py-8 sm:px-8">
      <AdminPageHeader
        title="Mock Test Management"
        description="Inspect assessment contents, questions, correct answers, and test configuration."
      />
      <AdminMetricGrid
        metrics={[
          { label: 'All tests', value: data?.pagination.total ?? 0 },
          { label: 'Public', value: data?.stats?.public ?? 0, tone: 'success' },
          { label: 'Private', value: data?.stats?.private ?? 0, tone: 'info' },
          { label: 'Attempts', value: data?.stats?.attempts ?? 0, tone: 'accent' },
        ]}
      />
      <AdminPanel
        title="Assessment inventory"
        toolbar={
          <div className="flex flex-wrap gap-3">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="admin-select"
            >
              <option value="all">All visibility</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
            <AdminSearch
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search mock tests…"
            />
          </div>
        }
      >
        {isLoading ? (
          <AdminLoading />
        ) : isError ? (
          <AdminError />
        ) : !data?.items.length ? (
          <AdminEmpty />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="admin-table w-full min-w-[900px] text-left text-sm">
                <thead>
                  <tr>
                    <th>Test</th>
                    <th>Owner</th>
                    <th>Difficulty</th>
                    <th>Questions</th>
                    <th>Attempts</th>
                    <th>Average</th>
                    <th>Visibility</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="font-semibold">{item.title}</div>
                        {item.isAIGenerated && (
                          <span className="text-[10px] text-[#6aa9ff]">AI generated</span>
                        )}
                      </td>
                      <td>{item.owner}</td>
                      <td>{item.difficulty}</td>
                      <td>{item.questionCount}</td>
                      <td>{item.attemptCount}</td>
                      <td>{Math.round(item.averageScore)}%</td>
                      <td>
                        <AdminStatusBadge value={item.visibility} />
                      </td>
                      <td>
                        <Link
                          to={`/admin/mock-tests/${item.id}`}
                          className="admin-button inline-flex items-center gap-2"
                        >
                          <Eye size={14} />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-2 border-t border-white/10 p-4">
              <button
                className="admin-button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>
              <span className="px-3 py-2 text-xs text-[#aaa59d]">
                {page} / {data.pagination.pages}
              </span>
              <button
                className="admin-button"
                disabled={page >= data.pagination.pages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          </>
        )}
      </AdminPanel>
    </main>
  );
}
