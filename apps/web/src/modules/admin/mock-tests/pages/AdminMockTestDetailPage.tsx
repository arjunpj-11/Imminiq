import { ArrowLeft, Braces, CheckCircle2, RotateCcw, ShieldAlert, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AdminEmpty,
  AdminError,
  AdminLoading,
  AdminPageHeader,
  AdminPanel,
  AdminStatusBadge,
} from '../../shared';
import { useAdminMockTestDetail } from '../hooks/useAdminMockTestDetail';
import { ADMIN_MOCK_TESTS_ROUTES } from '../constants/admin-mock-tests.constants';
import AdminMockTestModerationDialog from '../components/AdminMockTestModerationDialog';
import type { AdminMockTestLifecyclePayload } from '../types/admin-mock-tests.types';
import { useAuthStore } from '../../../../store/useAuthStore';
export default function AdminMockTestDetailPage() {
  const canManageLifecycle = useAuthStore((state) => state.user?.role !== 'moderator');
  const { testId } = useParams();
  const { data, isLoading, isError, error, refetch } = useAdminMockTestDetail(testId);
  const [moderating, setModerating] = useState<AdminMockTestLifecyclePayload['action'] | null>(null);
  if (isLoading) return <AdminLoading />;
  if (isError || !data) return <AdminError error={error} />;
  return (
    <main className="mx-auto max-w-[1050px] px-5 py-8 sm:px-8">
      <Link
        to={ADMIN_MOCK_TESTS_ROUTES.list}
        className="mb-5 inline-flex items-center gap-2 text-sm text-[#aaa59d] hover:text-[#e8816a]"
      >
        <ArrowLeft size={16} />
        Back to mock tests
      </Link>
      <AdminPageHeader
        title={data.title}
        description={data.description || 'No test description provided.'}
        action={
          <div className="flex flex-wrap justify-end gap-2">
            <AdminStatusBadge value={data.difficulty} />
            <AdminStatusBadge value={data.visibility} />
            <AdminStatusBadge value={data.moderationStatus} />
            {canManageLifecycle && data.moderationStatus === 'active' && (
              <button className="admin-button inline-flex items-center gap-2 text-[#f0a842]" onClick={() => setModerating('suspend')}><ShieldAlert size={15} /> Suspend</button>
            )}
            {canManageLifecycle && data.moderationStatus !== 'deleted' && (
              <button className="admin-button inline-flex items-center gap-2 text-[#e26767]" onClick={() => setModerating('delete')}><Trash2 size={15} /> Delete</button>
            )}
            {canManageLifecycle && data.moderationStatus !== 'active' && (
              <button className="admin-button inline-flex items-center gap-2 text-[#52c58c]" onClick={() => setModerating('restore')}><RotateCcw size={15} /> Restore</button>
            )}
          </div>
        }
      />
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        {[
          ['Owner', data.owner],
          ['Questions', data.questions.length],
          ['Time limit', `${data.timeLimitMinutes} min`],
          ['Passing score', `${data.passingScore}%`],
          ['Open reports', data.openReportCount],
          ['Active attempts', data.activeAttemptCount],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-white/10 bg-[#1c1a18] p-5">
            <div className="text-[10px] uppercase text-[#817c75]">{label}</div>
            <div className="mt-2 font-semibold">{value}</div>
          </div>
        ))}
      </div>
      {data.moderationReason && (
        <div className="mt-5 rounded-xl border border-[#f0a842]/30 bg-[#f0a842]/10 p-4 text-sm text-[#f0c060]">
          <strong>Moderation reason:</strong> {data.moderationReason}
        </div>
      )}
      <AdminPanel title="Questions">
        {!data.questions.length ? (
          <AdminEmpty>This test does not contain questions.</AdminEmpty>
        ) : (
          <div className="space-y-4 p-6">
            {data.questions.map((question) => (
              <article
                key={question.id}
                className="rounded-xl border border-white/10 bg-[#24211e] p-5"
              >
                <div className="flex justify-between gap-3">
                  <div className="text-[10px] uppercase tracking-wider text-[#e8816a]">
                    Question {question.order} · {question.type.replace('_', ' ')}
                  </div>
                  <div className="flex items-center gap-2">
                    {question.openReportCount > 0 && (
                      <span className="rounded-full bg-[#e26767]/15 px-2 py-1 text-xs text-[#e26767]">
                        {question.openReportCount} open reports
                      </span>
                    )}
                    <AdminStatusBadge value={question.difficulty} />
                  </div>
                </div>
                <h3 className="mt-3 font-semibold leading-6">{question.question}</h3>
                {question.options?.length ? (
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {question.options.map((option) => (
                      <div
                        key={option}
                        className={`rounded-lg border p-3 text-sm ${option === question.correctAnswer ? 'border-[#52c58c]/50 bg-[#52c58c]/10 text-[#52c58c]' : 'border-white/10 bg-[#1c1a18]'}`}
                      >
                        {option === question.correctAnswer && (
                          <CheckCircle2 size={14} className="mr-2 inline" />
                        )}
                        {option}
                      </div>
                    ))}
                  </div>
                ) : null}
                {question.correctAnswer && !question.options?.length && (
                  <div className="mt-4 rounded-lg bg-[#52c58c]/10 p-3 text-sm text-[#52c58c]">
                    <strong>Correct answer:</strong> {question.correctAnswer}
                  </div>
                )}
                {question.coding && (
                  <div className="mt-4 rounded-lg border border-white/10 bg-[#11110f] p-4">
                    <div className="flex items-center gap-2 text-sm text-[#6aa9ff]">
                      <Braces size={15} />
                      {question.coding.language} · {question.coding.functionName} ·{' '}
                      {question.coding.testCaseCount} test cases
                    </div>
                    {question.coding.starterCode && (
                      <pre className="mt-3 overflow-x-auto text-xs text-[#aaa59d]">
                        {question.coding.starterCode}
                      </pre>
                    )}
                  </div>
                )}
                {question.explanation && (
                  <p className="mt-4 text-sm text-[#aaa59d]">
                    <strong className="text-[#f2f0eb]">Explanation:</strong> {question.explanation}
                  </p>
                )}
                <div className="mt-4 grid gap-2 border-t border-white/10 pt-4 text-xs text-[#aaa59d] sm:grid-cols-4">
                  <span>{question.answerCount} answers</span>
                  <span>{Math.round(question.correctRate)}% correct</span>
                  <span>{Math.round(question.skipRate)}% skipped</span>
                  <span>{question.reportCount} total reports</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </AdminPanel>
      <AdminMockTestModerationDialog
        key={`${data.id}-${moderating ?? 'closed'}`}
        test={moderating ? data : null}
        action={moderating ?? 'suspend'}
        onClose={() => setModerating(null)}
        onComplete={() => {
          setModerating(null);
          void refetch();
        }}
      />
    </main>
  );
}
