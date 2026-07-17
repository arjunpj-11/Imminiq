import { useState } from "react";
import Modal from "../../shared/components/AdminModal";
import { toast } from "../../../../lib/toast";
import { getUserFacingError } from "../../../../lib/user-facing-error";
import { useSetAdminUserStatus } from "../hooks/useSetAdminUserStatus";
import type {
  AdminUser,
  AdminUserStatusPayload,
} from "../types/admin-users.types";

type UserStatusAction = "suspend" | "block" | "restore";

export default function AdminUserStatusDialog({
  user,
  action,
  onClose,
}: {
  user: AdminUser | null;
  action: UserStatusAction;
  onClose: () => void;
}) {
  const mutation = useSetAdminUserStatus(user?._id ?? "");
  const [reasonCode, setReasonCode] = useState<
    AdminUserStatusPayload["reasonCode"]
  >(action === "restore" ? "appeal_accepted" : "policy_violation");
  const [reason, setReason] = useState("");
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [mfaCode, setMfaCode] = useState("");
  const label =
    action === "suspend" ? "Suspend" : action === "block" ? "Block" : "Restore";
  const status: AdminUserStatusPayload["status"] =
    action === "suspend" ? "paused" : action === "block" ? "blocked" : "active";

  const submit = () => {
    if (!user || reason.trim().length < 15) return;
    mutation.mutate(
      {
        status,
        reasonCode,
        reason: reason.trim(),
        notifyEmail,
        mfaCode: mfaCode.trim(),
      },
      {
        onSuccess: () => {
          toast.success(
            `${label} completed`,
            "The status change was recorded in the audit log.",
          );
          onClose();
        },
        onError: (error) =>
          toast.error("Status update failed", getUserFacingError(error)),
      },
    );
  };

  return (
    <Modal
      open={Boolean(user)}
      onClose={onClose}
      preventClose={mutation.isPending}
      ariaLabel={`${label} user`}
      contentClassName="max-w-xl bg-[#1c1a18] text-[#f2f0eb]"
    >
      <h2 className="font-editorial text-2xl font-bold">
        {label} {user?.fullName ?? "user"}?
      </h2>
      <p className="mt-2 text-sm leading-6 text-[#aaa59d]">
        {action === "suspend"
          ? "The user will be signed out and temporarily unable to access protected pages."
          : action === "block"
            ? "All sessions will be revoked and the account will remain inaccessible until restored."
            : "The user will regain account access immediately."}
      </p>
      <label className="admin-field mt-5 block">
        <span>Reason category</span>
        <select
          value={reasonCode}
          onChange={(event) =>
            setReasonCode(
              event.target.value as AdminUserStatusPayload["reasonCode"],
            )
          }
        >
          <option value="policy_violation">Policy violation</option>
          <option value="security_risk">Security risk</option>
          <option value="spam_or_abuse">Spam or abuse</option>
          <option value="payment_or_fraud">Payment or fraud concern</option>
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
          placeholder="Explain the evidence and reason for this decision…"
        />
      </label>
      <div className="mt-1 text-right text-xs text-[#817c75]">
        {reason.trim().length}/1000 · minimum 15 characters
      </div>
      <label className="mt-4 flex items-start gap-3 text-sm text-[#aaa59d]">
        <input
          type="checkbox"
          checked={notifyEmail}
          onChange={(event) => setNotifyEmail(event.target.checked)}
          className="mt-1"
        />
        Queue an email containing this explanation. An in-app notification is
        always recorded.
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
            mfaCode.length !== 6 ||
            mutation.isPending
          }
          onClick={submit}
        >
          {mutation.isPending ? "Applying…" : `${label} user`}
        </button>
      </div>
    </Modal>
  );
}
