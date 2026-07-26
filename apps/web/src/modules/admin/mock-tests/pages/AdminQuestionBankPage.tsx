import { ArrowLeft, Database, Eye, Flag, Trash2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import {
  AdminEmpty,
  AdminError,
  AdminMetricGrid,
  AdminPageHeader,
  AdminPaginationControls,
  AdminPanel,
  AdminSearch,
  AdminStatusBadge,
  AdminTableSkeleton,
} from '../../../../components/admin';
import AdminModal from '../../../../components/admin/AdminModal';
import AdminActionPasswordField from '../../../../components/admin/AdminActionPasswordField';
import { useDebouncedValue } from '../../../../hooks/useDebouncedValue';
import { isAdminActionPasswordReady } from '../../../../lib/admin/admin-action-password';
import { getUserFacingError } from '../../../../lib/user-facing-error';
import { toast } from '../../../../lib/toast';
import { ADMIN_MOCK_TESTS_ROUTES } from '../constants/admin-mock-tests.constants';
import { useAdminQuestionBank } from '../hooks/useAdminQuestionBank';
import { useAdminQuestionBankItem } from '../hooks/useAdminQuestionBankItem';
import { useDeleteAdminQuestionBankItem } from '../hooks/useDeleteAdminQuestionBankItem';
import type {
  AdminQuestionBankDetail,
  AdminQuestionBankItem,
} from '../types/admin-mock-tests.types';

export default function AdminQuestionBankPage() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('q') ?? '');
  const [selectedBankId, setSelectedBankId] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminQuestionBankItem | null>(null);
  const [reason, setReason] = useState('');
  const [actionPassword, setActionPassword] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const page = Math.max(1, Number(params.get('page') ?? 1) || 1);
  const type = params.get('type') ?? 'all';
  const difficulty = params.get('difficulty') ?? 'all';
  const query = useAdminQuestionBank({ search: debouncedSearch, type, difficulty, page });
  const detailQuery = useAdminQuestionBankItem(selectedBankId ?? undefined);
  const remove = useDeleteAdminQuestionBankItem();

  const updateParams = (updates: Record<string, string | number | null>) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === 'all' || value === 1) next.delete(key);
      else next.set(key, String(value));
    }
    setParams(next, { replace: true });
  };

  useEffect(() => {
    if ((params.get('q') ?? '') === debouncedSearch) return;
    updateParams({ q: debouncedSearch || null, page: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const closeDelete = () => {
    if (remove.isPending) return;
    setPendingDelete(null);
    setReason('');
    setActionPassword('');
  };

  const confirmDelete = () => {
    if (!pendingDelete || reason.trim().length < 10) return;
    remove.mutate(
      { bankId: pendingDelete.bankId, reason: reason.trim(), actionPassword },
      {
        onSuccess: (result) => {
          toast.success(
            'Question removed',
            `Removed from ${result.removedFromTests} active question slot${result.removedFromTests === 1 ? '' : 's'} across ${result.affectedTests} test${result.affectedTests === 1 ? '' : 's'}.`
          );
          setPendingDelete(null);
          setSelectedBankId(null);
          setReason('');
          setActionPassword('');
        },
        onError: (error) => toast.error('Question could not be removed', getUserFacingError(error)),
      }
    );
  };

  return (
    <main className="mx-auto max-w-310 px-5 py-8 sm:px-8">
      <Link
        to={ADMIN_MOCK_TESTS_ROUTES.list}
        className="mb-5 inline-flex items-center gap-2 text-sm text-[#aaa59d] hover:text-[#e8816a]"
      >
        <ArrowLeft size={16} /> Back to mock tests
      </Link>
      <AdminPageHeader
        title="Question Bank"
        description="Review reusable assessment questions and remove incorrect content from future tests without damaging completed-attempt history."
      />

      <AdminMetricGrid
        metrics={[
          {
            label: 'Active questions',
            value: query.data?.stats?.activeQuestions ?? 0,
            tone: 'accent',
          },
          { label: 'Topics', value: query.data?.stats?.topicCount ?? 0, tone: 'info' },
          { label: 'Matching', value: query.data?.pagination.total ?? 0, tone: 'success' },
        ]}
      />

      <AdminPanel
        title="Reusable questions"
        toolbar={
          <div className="flex flex-wrap gap-3">
            <select
              className="admin-select"
              value={type}
              onChange={(event) => updateParams({ type: event.target.value, page: null })}
            >
              <option value="all">All types</option>
              <option value="mcq">MCQ</option>
              <option value="short_answer">Short answer</option>
              <option value="coding">Coding</option>
            </select>
            <select
              className="admin-select"
              value={difficulty}
              onChange={(event) => updateParams({ difficulty: event.target.value, page: null })}
            >
              <option value="all">All difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <AdminSearch
              value={search}
              onChange={setSearch}
              placeholder="Search question or topic…"
            />
          </div>
        }
      >
        {query.isLoading ? (
          <AdminTableSkeleton rows={8} columns={7} label="Loading question bank" />
        ) : query.isError ? (
          <AdminError error={query.error} onRetry={() => void query.refetch()} />
        ) : !query.data?.items.length ? (
          <AdminEmpty>No matching questions found.</AdminEmpty>
        ) : (
          <>
            <div className="admin-table-scroll overflow-x-auto">
              <table className="admin-table w-full min-w-230 text-left text-sm">
                <thead>
                  <tr>
                    <th>Bank ID</th>
                    <th>Question</th>
                    <th>Topic</th>
                    <th>Type</th>
                    <th>Difficulty</th>
                    <th>Used in</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {query.data.items.map((item) => (
                    <tr key={item.id}>
                      <td className="font-mono text-xs">#{item.bankId}</td>
                      <td className="max-w-110">
                        <div className="line-clamp-3 font-semibold">{item.question}</div>
                      </td>
                      <td>{item.topic}</td>
                      <td>
                        <AdminStatusBadge value={item.type.replace('_', ' ')} />
                      </td>
                      <td>
                        <AdminStatusBadge value={item.difficulty} />
                      </td>
                      <td>
                        <span className="inline-flex items-center gap-1">
                          <Database size={14} /> {item.usageCount} tests
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="admin-button"
                          onClick={() => setSelectedBankId(item.bankId)}
                        >
                          <Eye size={14} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <AdminPaginationControls
              page={page}
              pages={query.data.pagination.pages}
              label="questions"
              onPageChange={(next) => updateParams({ page: next })}
            />
          </>
        )}
      </AdminPanel>

      <AdminModal
        open={selectedBankId != null}
        onClose={() => setSelectedBankId(null)}
        ariaLabel="View question bank item"
        contentClassName="max-h-[90vh] max-w-3xl overflow-y-auto"
      >
        {detailQuery.isLoading ? (
          <p className="py-12 text-center text-sm text-[#aaa59d]">Loading question…</p>
        ) : detailQuery.isError || !detailQuery.data ? (
          <AdminError error={detailQuery.error} onRetry={() => void detailQuery.refetch()} />
        ) : (
          <QuestionDetail
            question={detailQuery.data}
            onDelete={() => setPendingDelete(detailQuery.data)}
            onClose={() => setSelectedBankId(null)}
          />
        )}
      </AdminModal>

      <AdminModal
        open={Boolean(pendingDelete)}
        onClose={closeDelete}
        preventClose={remove.isPending}
        ariaLabel="Delete question bank item"
        contentClassName="max-w-lg"
      >
        <h2 className="font-editorial text-2xl font-bold">
          Remove question #{pendingDelete?.bankId}?
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#aaa59d]">
          This removes the question from the reusable bank and future mock-test delivery. Existing
          completed-attempt snapshots remain intact.
        </p>
        <label className="admin-field mt-5">
          <span>Deletion reason</span>
          <textarea
            rows={3}
            maxLength={1000}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        </label>
        <AdminActionPasswordField
          value={actionPassword}
          onChange={setActionPassword}
          className="admin-field mt-4"
        />
        <div className="mt-6 flex justify-end gap-2">
          <button className="admin-button" onClick={closeDelete}>
            Cancel
          </button>
          <button
            className="admin-danger-button"
            disabled={
              reason.trim().length < 10 ||
              !isAdminActionPasswordReady(actionPassword) ||
              remove.isPending
            }
            onClick={confirmDelete}
          >
            {remove.isPending ? 'Removing…' : 'Remove question'}
          </button>
        </div>
      </AdminModal>
    </main>
  );
}

function QuestionDetail({
  question,
  onDelete,
  onClose,
}: {
  question: AdminQuestionBankDetail;
  onDelete: () => void;
  onClose: () => void;
}) {
  const coding = question.coding;
  const metrics: Array<{
    label: string;
    value: number;
    icon: typeof Users;
  }> = [
    { label: 'People attempted', value: question.uniqueLearnerCount, icon: Users },
    { label: 'Answer attempts', value: question.attemptCount, icon: Database },
    { label: 'Correct', value: question.correctCount, icon: Database },
    { label: 'Incorrect', value: question.incorrectCount, icon: Database },
    { label: 'Pending evaluation', value: question.pendingEvaluationCount, icon: Database },
    { label: 'Flags', value: question.flagCount, icon: Flag },
  ];
  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#e8816a]">
            Question Bank #{question.bankId}
          </p>
          <h2 className="mt-2 font-editorial text-2xl font-bold">Question details</h2>
        </div>
        <div className="flex gap-2">
          <AdminStatusBadge value={question.type.replace('_', ' ')} />
          <AdminStatusBadge value={question.difficulty} />
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {metrics.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-white/10 bg-[#24211e] p-4">
            <div className="flex items-center gap-2 text-[10px] uppercase text-[#817c75]">
              <Icon size={13} /> {label}
            </div>
            <div className="mt-2 text-xl font-bold">{value}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-[#24211e] p-5">
        <div className="text-xs text-[#aaa59d]">
          {question.topic} · {question.points} point{question.points === 1 ? '' : 's'} · Used in{' '}
          {question.usageCount} test{question.usageCount === 1 ? '' : 's'}
        </div>
        <p className="mt-3 whitespace-pre-wrap text-base font-semibold leading-7">
          {question.question}
        </p>
      </div>

      {question.options?.length ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {question.options.map((option) => (
            <div
              key={option}
              className={`rounded-lg border p-3 text-sm ${option === question.correctAnswer ? 'border-[#52c58c]/50 bg-[#52c58c]/10 text-[#52c58c]' : 'border-white/10 bg-[#24211e]'}`}
            >
              {option}
            </div>
          ))}
        </div>
      ) : null}

      {question.correctAnswer ? (
        <div className="mt-4 rounded-xl border border-[#52c58c]/30 bg-[#52c58c]/10 p-4 text-sm text-[#74d9a5]">
          <strong>Correct answer:</strong>{' '}
          <span className="whitespace-pre-wrap">{question.correctAnswer}</span>
        </div>
      ) : null}
      {question.explanation ? (
        <div className="mt-4 rounded-xl border border-white/10 bg-[#24211e] p-4 text-sm leading-6 text-[#ccc7bf]">
          <strong className="text-[#f2f0eb]">Explanation:</strong>{' '}
          <span className="whitespace-pre-wrap">{question.explanation}</span>
        </div>
      ) : null}
      {coding ? (
        <div className="mt-4 rounded-xl border border-[#6aa9ff]/30 bg-[#6aa9ff]/5 p-4">
          <div className="text-sm font-semibold text-[#8dbdff]">
            {coding.language ?? 'Code'}
            {coding.functionName ? ` · ${coding.functionName}` : ''}
          </div>
          {coding.starterCode ? (
            <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-lg bg-[#11110f] p-4 text-xs text-[#ccc7bf]">
              {coding.starterCode}
            </pre>
          ) : null}
          {coding.testCases?.length ? (
            <div className="mt-3 space-y-2">
              {coding.testCases.map((testCase, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-white/10 bg-[#1c1a18] p-3 text-xs"
                >
                  <strong>
                    Test {index + 1}
                    {testCase.isHidden ? ' · Hidden' : ''}
                  </strong>
                  <div className="mt-1 text-[#aaa59d]">Input: {JSON.stringify(testCase.input)}</div>
                  <div className="mt-1 text-[#aaa59d]">
                    Expected: {JSON.stringify(testCase.expectedOutput)}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-6 flex justify-end gap-2 border-t border-white/10 pt-5">
        <button className="admin-button" onClick={onClose}>
          Close
        </button>
        <button className="admin-danger-button" onClick={onDelete}>
          <Trash2 size={14} /> Delete question
        </button>
      </div>
    </div>
  );
}
