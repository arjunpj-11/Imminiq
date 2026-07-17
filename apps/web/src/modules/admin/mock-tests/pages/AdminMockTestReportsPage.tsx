import { useState } from "react";
import { ArrowLeft, Eye, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import Modal from "../../shared/components/AdminModal";
import {
  AdminCardSkeleton,
  AdminEmpty,
  AdminError,
  AdminTableSkeleton,
  AdminMetricGrid,
  AdminPageHeader,
  AdminPaginationControls,
  AdminPanel,
  AdminStatusBadge,
  AdminContentAppealsPanel,
} from "../../shared";
import { ADMIN_MOCK_TESTS_ROUTES } from "../constants/admin-mock-tests.constants";
import { useAdminMockTestReports } from "../hooks/useAdminMockTestReports";
import { useUpdateAdminMockTestReport } from "../hooks/useUpdateAdminMockTestReport";
import type {
  AdminMockTestIssueUpdatePayload,
  AdminMockTestQuestionIssue,
} from "../types/admin-mock-tests.types";

const reasonLabel = (value: string) => value.replaceAll("_", " ");

export default function AdminMockTestReportsPage() {
  const [status, setStatus] = useState("open");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AdminMockTestQuestionIssue | null>(
    null,
  );
  const { data, isLoading, isPlaceholderData, isError, error, refetch } = useAdminMockTestReports({
    status,
    page,
  });

  return (
    <main className="mx-auto max-w-310 px-5 py-8 sm:px-8">
      <Link
        to={ADMIN_MOCK_TESTS_ROUTES.list}
        className="mb-5 inline-flex items-center gap-2 text-sm text-[#aaa59d] hover:text-[#e8816a]"
      >
        <ArrowLeft size={16} /> Back to mock tests
      </Link>
      <AdminPageHeader
        title="Question Report Queue"
        description="Triage learner reports, inspect the exact question context, document decisions, and notify reporters."
      />
      {isLoading ? (
        <div className="mt-7">
          <AdminCardSkeleton cards={4} label="Loading mock test report metrics" />
        </div>
      ) : (
        <AdminMetricGrid
          metrics={[
          { label: "Open", value: data?.stats?.open ?? 0, tone: "error" },
          {
            label: "Reviewing",
            value: data?.stats?.reviewing ?? 0,
            tone: "warning",
          },
          {
            label: "Resolved",
            value: data?.stats?.resolved ?? 0,
            tone: "success",
          },
          {
            label: "Dismissed",
            value: data?.stats?.dismissed ?? 0,
            tone: "info",
          },
        ]}
        />
      )}
      <AdminPanel
        title="Moderation inbox"
        toolbar={
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            className="admin-select"
            aria-label="Filter mock test reports by status"
          >
            <option value="all">All reports</option>
            <option value="open">Open</option>
            <option value="reviewing">Reviewing</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        }
      >
        {isLoading || isPlaceholderData ? (
          <div className="admin-table-scroll overflow-x-auto">
            <AdminTableSkeleton columns={7} rows={8} label="Loading mock test reports" />
          </div>
        ) : isError ? (
          <AdminError error={error} onRetry={() => void refetch()} />
        ) : !data?.items.length ? (
          <AdminEmpty>No question reports match this view.</AdminEmpty>
        ) : (
          <>
            <div className="admin-table-scroll overflow-x-auto">
              <table className="admin-table w-full min-w-250 text-left text-sm">
                <caption className="sr-only">
                  Mock test moderation reports
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Age</th>
                    <th scope="col">Test / question</th>
                    <th scope="col">Reported by</th>
                    <th scope="col">Reason</th>
                    <th scope="col">Status</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((issue) => (
                    <tr key={issue.id}>
                      <td>{new Date(issue.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="font-semibold">{issue.testTitle}</div>
                        <div className="max-w-100 truncate text-xs text-[#817c75]">
                          Q{issue.questionOrder}: {issue.question}
                        </div>
                      </td>
                      <td>
                        {issue.reporter}
                        <div className="text-xs text-[#817c75]">
                          {issue.reporterEmail}
                        </div>
                      </td>
                      <td className="capitalize">
                        {reasonLabel(issue.reason)}
                      </td>
                      <td>
                        <AdminStatusBadge value={issue.status} />
                      </td>
                      <td>
                        <button
                          className="admin-button inline-flex items-center gap-2"
                          onClick={() => setSelected(issue)}
                        >
                          <Eye size={14} /> Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <AdminPaginationControls
              page={page}
              pages={data.pagination.pages}
              label="mock test reports"
              onPageChange={setPage}
            />
          </>
        )}
      </AdminPanel>
      <ReportReviewDialog
        key={selected?.id ?? "closed"}
        issue={selected}
        onClose={() => setSelected(null)}
      />
      <AdminContentAppealsPanel kind="mock-tests" />
    </main>
  );
}

function ReportReviewDialog({
  issue,
  onClose,
}: {
  issue: AdminMockTestQuestionIssue | null;
  onClose: () => void;
}) {
  const update = useUpdateAdminMockTestReport();
  const [status, setStatus] =
    useState<AdminMockTestIssueUpdatePayload["status"]>("reviewing");
  const [resolutionAction, setResolutionAction] =
    useState<AdminMockTestIssueUpdatePayload["resolutionAction"]>("none");
  const [resolutionNote, setResolutionNote] = useState("");
  const [correctedQuestion, setCorrectedQuestion] = useState(
    issue?.question ?? "",
  );
  const [correctedAnswer, setCorrectedAnswer] = useState(
    issue?.questionAnswer ?? "",
  );
  const [correctedExplanation, setCorrectedExplanation] = useState(
    issue?.questionExplanation ?? "",
  );
  const [correctedOptions, setCorrectedOptions] = useState(
    (issue?.questionOptions ?? []).join("\n"),
  );
  const [correctedDifficulty, setCorrectedDifficulty] = useState<
    "easy" | "medium" | "hard"
  >(
    issue?.questionDifficulty === "hard" ||
      issue?.questionDifficulty === "medium"
      ? issue.questionDifficulty
      : "easy",
  );
  const [correctedPoints, setCorrectedPoints] = useState(
    issue?.questionPoints ?? 1,
  );
  const [correctedCoding, setCorrectedCoding] = useState(
    issue?.questionCoding ? JSON.stringify(issue.questionCoding, null, 2) : "",
  );
  const [correctionError, setCorrectionError] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const submit = () => {
    if (
      !issue ||
      resolutionNote.trim().length < 10 ||
      (resolutionAction === "question_corrected" &&
        correctedQuestion.trim().length < 10)
    )
      return;
    let coding: Record<string, unknown> | undefined;
    if (
      resolutionAction === "question_corrected" &&
      issue.questionType === "coding" &&
      correctedCoding.trim()
    ) {
      try {
        coding = JSON.parse(correctedCoding) as Record<string, unknown>;
        setCorrectionError("");
      } catch {
        setCorrectionError("Coding configuration must be valid JSON.");
        return;
      }
    }
    const options = correctedOptions
      .split("\n")
      .map((value) => value.trim())
      .filter(Boolean);
    update.mutate(
      {
        id: issue.id,
        payload: {
          status,
          resolutionAction: status === "reviewing" ? "none" : resolutionAction,
          resolutionNote: resolutionNote.trim(),
          mfaCode: mfaCode.trim(),
          ...(resolutionAction === "question_corrected"
            ? {
                correctedQuestion: correctedQuestion.trim(),
                correctedAnswer: correctedAnswer.trim(),
                correctedExplanation: correctedExplanation.trim(),
                ...(options.length ? { correctedOptions: options } : {}),
                correctedDifficulty,
                correctedPoints,
                ...(coding ? { correctedCoding: coding } : {}),
              }
            : {}),
        },
      },
      { onSuccess: onClose },
    );
  };
  return (
    <Modal
      open={Boolean(issue)}
      onClose={onClose}
      preventClose={update.isPending}
      ariaLabel="Review question report"
      contentClassName="max-w-2xl bg-[#1c1a18] text-[#f2f0eb]"
    >
      <div className="flex items-start gap-3">
        <ShieldAlert className="mt-1 text-[#e8816a]" />
        <div>
          <h2 className="font-editorial text-2xl font-bold">Question report</h2>
          <p className="text-sm text-[#aaa59d]">
            {issue?.testTitle} · Question {issue?.questionOrder}
          </p>
        </div>
      </div>
      <div className="mt-5 rounded-xl border border-white/10 bg-[#24211e] p-4">
        <div className="text-xs uppercase text-[#e8816a]">Question</div>
        <p className="mt-2 font-semibold leading-6">{issue?.question}</p>
      </div>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-[#817c75]">Reason</dt>
          <dd className="capitalize">{reasonLabel(issue?.reason ?? "")}</dd>
        </div>
        <div>
          <dt className="text-xs text-[#817c75]">Reporter</dt>
          <dd>{issue?.reporter}</dd>
        </div>
      </dl>
      <div className="mt-4 rounded-lg border border-white/10 p-4 text-sm text-[#aaa59d]">
        {issue?.details || "The reporter did not add further details."}
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="admin-field">
          <span>Decision</span>
          <select
            value={status}
            onChange={(event) => {
              const next = event.target
                .value as AdminMockTestIssueUpdatePayload["status"];
              setStatus(next);
              if (next === "reviewing") setResolutionAction("none");
            }}
          >
            <option value="reviewing">Start reviewing</option>
            <option value="resolved">Resolve</option>
            <option value="dismissed">Dismiss</option>
          </select>
        </label>
        <label className="admin-field">
          <span>Content action</span>
          <select
            disabled={status === "reviewing"}
            value={resolutionAction}
            onChange={(event) =>
              setResolutionAction(
                event.target
                  .value as AdminMockTestIssueUpdatePayload["resolutionAction"],
              )
            }
          >
            <option value="none">No linked content action</option>
            <option value="question_corrected">
              Correct the live question
            </option>
            <option value="question_disabled">Disable the live question</option>
            <option value="test_suspended">Suspend the full test</option>
            <option value="test_deleted">Delete the full test</option>
          </select>
        </label>
      </div>
      {resolutionAction === "question_corrected" && status !== "reviewing" && (
        <div className="mt-4 grid gap-4 rounded-xl border border-[#e8816a]/30 bg-[#e8816a]/5 p-4">
          <p className="text-sm text-[#d9b4a8]">
            This creates a version snapshot before updating the question shown
            to learners. Completed attempt scores are preserved.
          </p>
          <label className="admin-field">
            <span>Corrected question</span>
            <textarea
              rows={4}
              maxLength={5000}
              value={correctedQuestion}
              onChange={(event) => setCorrectedQuestion(event.target.value)}
            />
          </label>
          <label className="admin-field">
            <span>Corrected answer (optional)</span>
            <textarea
              rows={2}
              maxLength={5000}
              value={correctedAnswer}
              onChange={(event) => setCorrectedAnswer(event.target.value)}
            />
          </label>
          <label className="admin-field">
            <span>Corrected explanation (optional)</span>
            <textarea
              rows={3}
              maxLength={5000}
              value={correctedExplanation}
              onChange={(event) => setCorrectedExplanation(event.target.value)}
            />
          </label>
          {issue?.questionType === "mcq" && (
            <label className="admin-field">
              <span>Options (one per line)</span>
              <textarea
                rows={5}
                value={correctedOptions}
                onChange={(event) => setCorrectedOptions(event.target.value)}
              />
            </label>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="admin-field">
              <span>Difficulty</span>
              <select
                value={correctedDifficulty}
                onChange={(event) =>
                  setCorrectedDifficulty(
                    event.target.value as "easy" | "medium" | "hard",
                  )
                }
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </label>
            <label className="admin-field">
              <span>Points</span>
              <input
                type="number"
                min={1}
                max={100}
                value={correctedPoints}
                onChange={(event) =>
                  setCorrectedPoints(
                    Math.max(1, Math.min(100, Number(event.target.value) || 1)),
                  )
                }
              />
            </label>
          </div>
          {issue?.questionType === "coding" && (
            <label className="admin-field">
              <span>Coding configuration (JSON)</span>
              <textarea
                rows={10}
                className="font-mono text-xs"
                value={correctedCoding}
                onChange={(event) => setCorrectedCoding(event.target.value)}
              />
            </label>
          )}
          {correctionError && (
            <p className="text-sm text-[#e26767]">{correctionError}</p>
          )}
        </div>
      )}
      {status !== "reviewing" &&
        ["question_disabled", "test_suspended", "test_deleted"].includes(
          resolutionAction,
        ) && (
          <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/5 p-4 text-sm text-amber-100">
            {resolutionAction === "question_disabled"
              ? "The question will immediately stop appearing in new and active learner sessions."
              : `The test will be ${resolutionAction === "test_deleted" ? "deleted" : "suspended"}, active attempts will be abandoned, sharing will be disabled, and the owner will be notified.`}
          </div>
        )}
      <label className="admin-field mt-4 block">
        <span>Resolution note sent to reporter</span>
        <textarea
          rows={4}
          maxLength={1500}
          value={resolutionNote}
          onChange={(event) => setResolutionNote(event.target.value)}
          placeholder="Explain what was reviewed and why this decision was made…"
        />
      </label>
      <label className="admin-field mt-4 block">
        <span>6-digit authenticator code</span>
        <input
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={mfaCode}
          onChange={(event) =>
            setMfaCode(event.target.value.replace(/\D/g, "").slice(0, 6))
          }
          placeholder="000000"
        />
      </label>
      <div className="mt-6 flex flex-wrap justify-between gap-2">
        {issue && (
          <Link
            to={ADMIN_MOCK_TESTS_ROUTES.detail(issue.testId)}
            className="admin-button"
          >
            Open full test
          </Link>
        )}
        <div className="flex gap-2">
          <button className="admin-button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="admin-primary-button"
            disabled={
              resolutionNote.trim().length < 10 ||
              mfaCode.length !== 6 ||
              (resolutionAction === "question_corrected" &&
                correctedQuestion.trim().length < 10) ||
              update.isPending
            }
            onClick={submit}
          >
            {update.isPending ? "Applying…" : "Apply decision"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
