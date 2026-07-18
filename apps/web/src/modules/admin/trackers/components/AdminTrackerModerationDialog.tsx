import { useState } from "react";
import Modal from "../../../../components/admin/AdminModal";
import { useUpdateAdminTrackerLifecycle } from "../hooks/useUpdateAdminTrackerLifecycle";
import type {
  AdminTracker,
  AdminTrackerLifecyclePayload,
} from "../types/admin-trackers.types";
import AdminActionPasswordField from "../../../../components/admin/AdminActionPasswordField";
import { isAdminActionPasswordReady } from "../../../../lib/admin/admin-action-password";

export default function AdminTrackerModerationDialog({
  tracker,
  action,
  onClose,
  onComplete,
}: {
  tracker: Pick<AdminTracker, "id" | "title" | "moderationStatus"> | null;
  action: AdminTrackerLifecyclePayload["action"];
  onClose: () => void;
  onComplete?: () => void;
}) {
  const mutation = useUpdateAdminTrackerLifecycle();
  const [reasonCode, setReasonCode] = useState<
    AdminTrackerLifecyclePayload["reasonCode"]
  >(action === "restore" ? "appeal_accepted" : "broken_learning_path");
  const [reason, setReason] = useState("");
  const [notifyOwner, setNotifyOwner] = useState(true);
  const [actionPassword, setActionPassword] = useState("");
  const label =
    action === "delete"
      ? "Delete"
      : action === "suspend"
        ? "Suspend"
        : "Restore";
  const submit = () => {
    if (!tracker || reason.trim().length < 15) return;
    mutation.mutate(
      {
        id: tracker.id,
        payload: {
          action,
          reasonCode,
          reason: reason.trim(),
          notifyOwner,
          actionPassword,
        },
      },
      { onSuccess: () => (onComplete ? onComplete() : onClose()) },
    );
  };
  return (
    <Modal
      open={Boolean(tracker)}
      onClose={onClose}
      preventClose={mutation.isPending}
      ariaLabel={`${label} tracker`}
      contentClassName="max-w-xl bg-[#1c1a18] text-[#f2f0eb]"
    >
      <h2 className="font-editorial text-2xl font-bold">
        {label} {tracker?.title ?? "tracker"}?
      </h2>
      <p className="mt-2 text-sm leading-6 text-[#aaa59d]">
        {action === "suspend"
          ? "The tracker will leave community discovery and cloning immediately while remaining recoverable."
          : action === "delete"
            ? "The tracker will be removed from user and community access while its moderation history is preserved."
            : "The tracker will become available to its owner again. The owner must republish it to return it to the community."}
      </p>
      <label className="admin-field mt-5 block">
        <span>Reason category</span>
        <select
          value={reasonCode}
          onChange={(event) =>
            setReasonCode(
              event.target.value as AdminTrackerLifecyclePayload["reasonCode"],
            )
          }
        >
          <option value="incorrect_content">
            Incorrect or misleading content
          </option>
          <option value="unsafe_content">Unsafe or offensive content</option>
          <option value="copyright">Copyright concern</option>
          <option value="spam_or_abuse">Spam or abuse</option>
          <option value="broken_learning_path">Broken learning path</option>
          <option value="owner_request">Owner request</option>
          <option value="appeal_accepted">Appeal accepted</option>
          <option value="other">Other</option>
        </select>
      </label>
      <label className="admin-field mt-4 block">
        <span>User-facing explanation</span>
        <textarea
          rows={5}
          maxLength={1000}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Explain the evidence and exact reason for this decision…"
        />
      </label>
      <div className="mt-1 text-right text-xs text-[#817c75]">
        {reason.trim().length}/1000 · minimum 15 characters
      </div>
      <label className="mt-4 flex items-start gap-3 text-sm text-[#aaa59d]">
        <input
          type="checkbox"
          checked={notifyOwner}
          onChange={(event) => setNotifyOwner(event.target.checked)}
          className="mt-1"
        />
        Queue an email with this explanation. An in-app notification is always
        sent.
      </label>
      <AdminActionPasswordField
        value={actionPassword}
        onChange={setActionPassword}
        className="admin-field mt-4 block"
      />
      <div className="mt-6 flex justify-end gap-2">
        <button
          className="admin-button"
          onClick={onClose}
          disabled={mutation.isPending}
        >
          Cancel
        </button>
        <button
          className={
            action === "restore"
              ? "admin-primary-button"
              : "admin-button text-[#e26767]"
          }
          disabled={
            reason.trim().length < 15 ||
            !isAdminActionPasswordReady(actionPassword) ||
            mutation.isPending
          }
          onClick={submit}
        >
          {mutation.isPending ? "Applying…" : `${label} tracker`}
        </button>
      </div>
    </Modal>
  );
}
