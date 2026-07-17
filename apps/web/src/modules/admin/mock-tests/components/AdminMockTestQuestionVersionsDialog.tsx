import { useState } from "react";
import Modal from "../../shared/components/AdminModal";
import type { AdminMockTestQuestion } from "../types/admin-mock-tests.types";
import { useAdminMockTestQuestionVersions } from "../hooks/useAdminMockTestQuestionVersions";
import { useRestoreAdminMockTestQuestionVersion } from "../hooks/useRestoreAdminMockTestQuestionVersion";
import AdminActionPasswordField from "../../shared/components/AdminActionPasswordField";
import { isAdminActionPasswordReady } from "../../shared/utils/admin-action-password";

export default function AdminMockTestQuestionVersionsDialog({
  question,
  onClose,
}: {
  question: AdminMockTestQuestion | null;
  onClose: () => void;
}) {
  const versions = useAdminMockTestQuestionVersions(question?.id);
  const restore = useRestoreAdminMockTestQuestionVersion();
  const [selected, setSelected] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [actionPassword, setActionPassword] = useState("");
  const submit = () => {
    if (!question || selected === null || reason.trim().length < 10) return;
    restore.mutate(
      {
        questionId: question.id,
        version: selected,
        reason: reason.trim(),
        actionPassword,
      },
      { onSuccess: onClose },
    );
  };
  return (
    <Modal
      open={Boolean(question)}
      onClose={onClose}
      preventClose={restore.isPending}
      ariaLabel="Question version history"
      contentClassName="max-w-3xl bg-[#1c1a18] text-[#f2f0eb]"
    >
      <h2 className="font-editorial text-2xl font-bold">
        Question version history
      </h2>
      <p className="mt-2 text-sm text-[#aaa59d]">
        Current version: v{question?.version}. Restoring creates a new version
        and preserves every previous snapshot.
      </p>
      <div className="mt-5 max-h-80 space-y-3 overflow-y-auto">
        {versions.isLoading && (
          <p className="text-sm text-[#aaa59d]">Loading versions…</p>
        )}
        {versions.data?.map((version) => (
          <button
            key={version.id}
            type="button"
            onClick={() => setSelected(version.version)}
            className={`w-full rounded-xl border p-4 text-left ${selected === version.version ? "border-[#e8816a] bg-[#e8816a]/10" : "border-white/10 bg-[#24211e]"}`}
          >
            <div className="flex justify-between gap-3">
              <strong>Version {version.version}</strong>
              <time className="text-xs text-[#817c75]">
                {new Date(version.createdAt).toLocaleString()}
              </time>
            </div>
            <p className="mt-1 text-xs text-[#aaa59d]">
              {version.reason} · {version.changedBy}
            </p>
            <pre className="mt-3 max-h-28 overflow-auto rounded bg-[#11110f] p-3 text-[10px] text-[#817c75]">
              {JSON.stringify(version.snapshot, null, 2)}
            </pre>
          </button>
        ))}
        {!versions.isLoading && !versions.data?.length && (
          <p className="text-sm text-[#aaa59d]">
            No earlier versions have been created.
          </p>
        )}
      </div>
      {selected !== null && (
        <div className="mt-5 grid gap-3">
          <label className="admin-field">
            <span>Restore reason</span>
            <textarea
              rows={3}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              maxLength={1000}
            />
          </label>
          <AdminActionPasswordField
        value={actionPassword}
        onChange={setActionPassword}
        className="admin-field"
      />
        </div>
      )}
      <div className="mt-6 flex justify-end gap-2">
        <button className="admin-button" onClick={onClose}>
          Cancel
        </button>
        <button
          className="admin-primary-button"
          disabled={
            selected === null ||
            reason.trim().length < 10 ||
            !isAdminActionPasswordReady(actionPassword) ||
            restore.isPending
          }
          onClick={submit}
        >
          {restore.isPending ? "Restoring…" : "Restore selected version"}
        </button>
      </div>
    </Modal>
  );
}
