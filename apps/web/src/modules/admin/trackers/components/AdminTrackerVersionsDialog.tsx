import { useState } from "react";
import Modal from "../../../../components/admin/AdminModal";
import { useAdminTrackerVersions } from "../hooks/useAdminTrackerVersions";
import { useRestoreAdminTrackerVersion } from "../hooks/useRestoreAdminTrackerVersion";
import AdminActionPasswordField from "../../../../components/admin/AdminActionPasswordField";
import { isAdminActionPasswordReady } from "../../../../lib/admin/admin-action-password";
export default function AdminTrackerVersionsDialog({
  trackerId,
  onClose,
}: {
  trackerId: string | null;
  onClose: () => void;
}) {
  const query = useAdminTrackerVersions(trackerId ?? undefined);
  const restore = useRestoreAdminTrackerVersion();
  const [selected, setSelected] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [actionPassword, setActionPassword] = useState("");
  return (
    <Modal
      open={Boolean(trackerId)}
      onClose={onClose}
      preventClose={restore.isPending}
      ariaLabel="Tracker version history"
      contentClassName="max-w-3xl bg-[#1c1a18] text-[#f2f0eb]"
    >
      <h2 className="font-editorial text-2xl font-bold">
        Tracker version history
      </h2>
      <p className="mt-1 text-sm text-[#aaa59d]">
        Restore metadata without changing learner progress or completed study
        records.
      </p>
      <div className="mt-5 max-h-90 space-y-2 overflow-y-auto">
        {query.isLoading && <p>Loading versions…</p>}
        {query.data?.map((item) => (
          <label
            key={item.id}
            className={`block cursor-pointer rounded-lg border p-4 ${selected === item.version ? "border-[#e8816a] bg-[#e8816a]/10" : "border-white/10 bg-[#24211e]"}`}
          >
            <input
              className="mr-3"
              type="radio"
              name="tracker-version"
              checked={selected === item.version}
              onChange={() => setSelected(item.version)}
            />
            <strong>Version {item.version}</strong>
            <span className="ml-2 text-xs text-[#aaa59d]">
              {new Date(item.createdAt).toLocaleString()} · {item.changedBy}
            </span>
            <p className="mt-2 text-xs text-[#aaa59d]">{item.reason}</p>
            <p className="mt-1 text-sm">
              {String(item.snapshot.title ?? "Untitled")} ·{" "}
              {String(item.snapshot.status ?? "")} ·{" "}
              {String(item.snapshot.visibility ?? "")}
            </p>
          </label>
        ))}
        {query.data?.length === 0 && (
          <p className="rounded-lg border border-white/10 p-4 text-sm text-[#aaa59d]">
            No prior metadata versions have been captured yet.
          </p>
        )}
      </div>
      {selected !== null && (
        <>
          <label className="admin-field mt-4 block">
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
        className="admin-field mt-4 block"
      />
        </>
      )}
      <div className="mt-6 flex justify-end gap-2">
        <button className="admin-button" onClick={onClose}>
          Close
        </button>
        <button
          className="admin-primary-button"
          disabled={
            !trackerId ||
            selected === null ||
            reason.trim().length < 10 ||
            !isAdminActionPasswordReady(actionPassword) ||
            restore.isPending
          }
          onClick={() =>
            trackerId &&
            selected !== null &&
            restore.mutate(
              {
                id: trackerId,
                version: selected,
                reason: reason.trim(),
                actionPassword,
              },
              { onSuccess: onClose },
            )
          }
        >
          {restore.isPending ? "Restoring…" : "Restore selected"}
        </button>
      </div>
    </Modal>
  );
}
