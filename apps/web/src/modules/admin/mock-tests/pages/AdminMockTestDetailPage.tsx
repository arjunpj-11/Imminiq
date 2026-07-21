import {
  ArrowLeft,
  Braces,
  CheckCircle2,
  Eye,
  EyeOff,
  RotateCcw,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AdminEmpty,
  AdminError,
  AdminLoading,
  AdminPageHeader,
  AdminPanel,
  AdminStatusBadge,
} from "../../../../components/admin";
import { useAdminMockTestDetail } from "../hooks/useAdminMockTestDetail";
import { useRestoreAdminQuestionBankItem } from "../hooks/useAdminQuestionBank";
import { ADMIN_MOCK_TESTS_ROUTES } from "../constants/admin-mock-tests.constants";
import AdminMockTestModerationDialog from "../components/AdminMockTestModerationDialog";
import type { AdminMockTestLifecyclePayload } from "../types/admin-mock-tests.types";
import { useAuthStore } from "../../../../store/useAuthStore";
import AdminModal from "../../../../components/admin/AdminModal";
import AdminActionPasswordField from "../../../../components/admin/AdminActionPasswordField";
import { isAdminActionPasswordReady } from "../../../../lib/admin/admin-action-password";
import { getUserFacingError } from "../../../../lib/user-facing-error";
import { toast } from "../../../../lib/toast";
import type { AdminMockTestQuestion } from "../types/admin-mock-tests.types";
export default function AdminMockTestDetailPage() {
  const canManageLifecycle = useAuthStore(
    (state) => state.user?.role !== "moderator",
  );
  const { testId } = useParams();
  const { data, isLoading, isError, error, refetch } =
    useAdminMockTestDetail(testId);
  const [moderating, setModerating] = useState<
    AdminMockTestLifecyclePayload["action"] | null
  >(null);
  const [learnerPreview, setLearnerPreview] = useState(false);
  const [restoreQuestion, setRestoreQuestion] =
    useState<AdminMockTestQuestion | null>(null);
  const [restoreReason, setRestoreReason] = useState("");
  const [actionPassword, setActionPassword] = useState("");
  const restoreBankQuestion = useRestoreAdminQuestionBankItem();
  const closeRestore = () => {
    if (restoreBankQuestion.isPending) return;
    setRestoreQuestion(null);
    setRestoreReason("");
    setActionPassword("");
  };
  const confirmRestore = () => {
    if (restoreQuestion?.bankId == null || restoreReason.trim().length < 10) return;
    restoreBankQuestion.mutate(
      {
        bankId: restoreQuestion.bankId,
        reason: restoreReason.trim(),
        actionPassword,
      },
      {
        onSuccess: (result) => {
          toast.success(
            "Question restored",
            `Restored in ${result.restoredInTests} question slot${result.restoredInTests === 1 ? "" : "s"} across ${result.affectedTests} mock test${result.affectedTests === 1 ? "" : "s"}.`,
          );
          setRestoreQuestion(null);
          setRestoreReason("");
          setActionPassword("");
          void refetch();
        },
        onError: (restoreError) =>
          toast.error("Question could not be restored", getUserFacingError(restoreError)),
      },
    );
  };
  if (isLoading) return <main className="mx-auto max-w-275 px-5 py-8 sm:px-8"><AdminLoading variant="detail" /></main>;
  if (isError || !data)
    return <AdminError error={error} onRetry={() => void refetch()} />;
  return (
    <main className="mx-auto max-w-262.5 px-5 py-8 sm:px-8">
      <Link
        to={ADMIN_MOCK_TESTS_ROUTES.list}
        className="mb-5 inline-flex items-center gap-2 text-sm text-[#aaa59d] hover:text-[#e8816a]"
      >
        <ArrowLeft size={16} />
        Back to mock tests
      </Link>
      <AdminPageHeader
        title={data.title}
        description={data.description || "No test description provided."}
        action={
          <div className="flex flex-wrap justify-end gap-2">
            <button
              className="admin-button inline-flex items-center gap-2"
              onClick={() => setLearnerPreview((value) => !value)}
            >
              {learnerPreview ? <EyeOff size={15} /> : <Eye size={15} />}
              {learnerPreview ? "Exit learner preview" : "Learner preview"}
            </button>
            <AdminStatusBadge value={data.difficulty} />
            <AdminStatusBadge value={data.moderationStatus} />
            {canManageLifecycle && data.moderationStatus === "active" && (
              <button
                className="admin-button inline-flex items-center gap-2 text-[#f0a842]"
                onClick={() => setModerating("suspend")}
              >
                <ShieldAlert size={15} /> Suspend
              </button>
            )}
            {canManageLifecycle && data.moderationStatus !== "deleted" && (
              <button
                className="admin-button inline-flex items-center gap-2 text-[#e26767]"
                onClick={() => setModerating("delete")}
              >
                <Trash2 size={15} /> Delete
              </button>
            )}
            {canManageLifecycle && data.moderationStatus !== "active" && (
              <button
                className="admin-button inline-flex items-center gap-2 text-[#52c58c]"
                onClick={() => setModerating("restore")}
              >
                <RotateCcw size={15} /> Restore
              </button>
            )}
          </div>
        }
      />
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        {[
          ["Owner", data.owner],
          ["Questions", data.questions.length],
          ["Time limit", `${data.timeLimitMinutes} min`],
          ["Passing score", `${data.passingScore}%`],
          ["Open reports", data.openReportCount],
          ["Learner flags", data.flagCount],
          ["Active attempts", data.activeAttemptCount],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-white/10 bg-[#1c1a18] p-5"
          >
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
                className={`rounded-xl border p-5 ${question.moderationStatus === "disabled" ? "border-[#e26767]/30 bg-[#e26767]/5 opacity-75" : "border-white/10 bg-[#24211e]"}`}
              >
                <div className="flex justify-between gap-3">
                  <div className="text-[10px] uppercase tracking-wider text-[#e8816a]">
                    Question {question.order} ·{" "}
                    {question.type.replace("_", " ")}
                    {question.bankId == null && " · Not linked to Question Bank"}
                    {question.bankId != null && (
                      <>
                        {" · "}
                        <Link
                          to={`${ADMIN_MOCK_TESTS_ROUTES.questionBank}?q=${question.bankId}`}
                          className="font-mono underline decoration-[#e8816a]/50 underline-offset-2 hover:text-[#f2a18f]"
                        >
                          Question Bank #{question.bankId}
                        </Link>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {question.openReportCount > 0 && (
                      <span className="rounded-full bg-[#e26767]/15 px-2 py-1 text-xs text-[#e26767]">
                        {question.openReportCount} open reports
                      </span>
                    )}
                    {question.flagCount > 0 && (
                      <span className="rounded-full bg-[#6aa9ff]/15 px-2 py-1 text-xs text-[#6aa9ff]">
                        {question.flagCount} learner flags
                      </span>
                    )}
                    <AdminStatusBadge value={question.difficulty} />
                    <AdminStatusBadge value={question.moderationStatus} />
                    {!learnerPreview &&
                      question.bankId != null &&
                      question.questionBankStatus === "disabled" && (
                        <button
                          type="button"
                          className="admin-button px-2.5 py-1.5 text-xs text-[#52c58c]"
                          onClick={() => setRestoreQuestion(question)}
                        >
                          <RotateCcw size={14} /> Restore question
                        </button>
                      )}
                  </div>
                </div>
                <h3 className="mt-3 font-semibold leading-6">
                  {question.question}
                </h3>
                {question.options?.length ? (
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {question.options.map((option) => (
                      <div
                        key={option}
                        className={`rounded-lg border p-3 text-sm ${!learnerPreview && option === question.correctAnswer ? "border-[#52c58c]/50 bg-[#52c58c]/10 text-[#52c58c]" : "border-white/10 bg-[#1c1a18]"}`}
                      >
                        {!learnerPreview &&
                          option === question.correctAnswer && (
                            <CheckCircle2 size={14} className="mr-2 inline" />
                          )}
                        {option}
                      </div>
                    ))}
                  </div>
                ) : null}
                {!learnerPreview &&
                  question.correctAnswer &&
                  !question.options?.length && (
                    <div className="mt-4 rounded-lg bg-[#52c58c]/10 p-3 text-sm text-[#52c58c]">
                      <strong>Correct answer:</strong> {question.correctAnswer}
                    </div>
                  )}
                {question.coding && (
                  <div className="mt-4 rounded-lg border border-white/10 bg-[#11110f] p-4">
                    <div className="flex items-center gap-2 text-sm text-[#6aa9ff]">
                      <Braces size={15} />
                      {question.coding.language} ·{" "}
                      {question.coding.functionName} ·{" "}
                      {question.coding.testCaseCount} test cases
                    </div>
                    {question.coding.starterCode && (
                      <pre className="mt-3 overflow-x-auto text-xs text-[#aaa59d]">
                        {question.coding.starterCode}
                      </pre>
                    )}
                  </div>
                )}
                {!learnerPreview && question.explanation && (
                  <p className="mt-4 text-sm text-[#aaa59d]">
                    <strong className="text-[#f2f0eb]">Explanation:</strong>{" "}
                    {question.explanation}
                  </p>
                )}
                {question.moderationReason && (
                  <p className="mt-3 rounded-lg border border-[#f0a842]/20 bg-[#f0a842]/5 p-3 text-xs text-[#f0c060]">
                    <strong>Moderation note:</strong>{" "}
                    {question.moderationReason}
                  </p>
                )}
                <div className="mt-4 grid gap-2 border-t border-white/10 pt-4 text-xs text-[#aaa59d] sm:grid-cols-5">
                  <span>{question.answerCount} answers</span>
                  <span>{Math.round(question.correctRate)}% correct</span>
                  <span>{Math.round(question.skipRate)}% skipped</span>
                  <span>{question.reportCount} total reports</span>
                  <span>{question.flagCount} learner flags</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </AdminPanel>
      <AdminPanel title="Moderation history">
        {!data.moderationHistory.length ? (
          <AdminEmpty>
            No administrative changes have been recorded for this test.
          </AdminEmpty>
        ) : (
          <div className="divide-y divide-white/10">
            {data.moderationHistory.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap justify-between gap-3 p-5 text-sm"
              >
                <div>
                  <div className="font-semibold">
                    {item.action.replaceAll("_", " ")}
                  </div>
                  <div className="mt-1 text-xs text-[#aaa59d]">
                    By {item.actor}
                    {item.reason ? ` · ${item.reason}` : ""}
                  </div>
                </div>
                <time className="text-xs text-[#817c75]">
                  {new Date(item.createdAt).toLocaleString()}
                </time>
              </div>
            ))}
          </div>
        )}
      </AdminPanel>
      <AdminMockTestModerationDialog
        key={`${data.id}-${moderating ?? "closed"}`}
        test={moderating ? data : null}
        action={moderating ?? "suspend"}
        onClose={() => setModerating(null)}
        onComplete={() => {
          setModerating(null);
          void refetch();
        }}
      />
      <AdminModal
        open={Boolean(restoreQuestion)}
        onClose={closeRestore}
        preventClose={restoreBankQuestion.isPending}
        ariaLabel="Restore question bank item"
        contentClassName="max-w-lg"
      >
        <h2 className="font-editorial text-2xl font-bold">
          Restore Question Bank #{restoreQuestion?.bankId}?
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#aaa59d]">
          This restores the question in the Question Bank and every linked mock test.
          Tests automatically suspended because they became empty will be reactivated.
        </p>
        <label className="admin-field mt-5">
          <span>Restoration reason</span>
          <textarea
            rows={3}
            maxLength={1000}
            value={restoreReason}
            onChange={(event) => setRestoreReason(event.target.value)}
          />
        </label>
        <AdminActionPasswordField
          value={actionPassword}
          onChange={setActionPassword}
          className="admin-field mt-4"
        />
        <div className="mt-6 flex justify-end gap-2">
          <button className="admin-button" onClick={closeRestore}>Cancel</button>
          <button
            className="admin-primary-button"
            disabled={
              restoreReason.trim().length < 10 ||
              !isAdminActionPasswordReady(actionPassword) ||
              restoreBankQuestion.isPending
            }
            onClick={confirmRestore}
          >
            {restoreBankQuestion.isPending ? "Restoring…" : "Restore question"}
          </button>
        </div>
      </AdminModal>
    </main>
  );
}
