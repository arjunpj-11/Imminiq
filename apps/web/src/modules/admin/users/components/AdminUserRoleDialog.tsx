import { useState } from "react";
import Modal from "../../shared/components/AdminModal";
import type { AdminUser } from "../types/admin-users.types";
import { useUpdateAdminUserRole } from "../hooks/useUpdateAdminUserRole";

export default function AdminUserRoleDialog({
  user,
  onClose,
}: {
  user: AdminUser | null;
  onClose: () => void;
}) {
  const update = useUpdateAdminUserRole(user?._id ?? "");
  const [role, setRole] = useState<"user" | "moderator" | "admin">(
    user?.role === "moderator" || user?.role === "admin" ? user.role : "user",
  );
  const [reason, setReason] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const submit = () => {
    if (!user || reason.trim().length < 10) return;
    update.mutate(
      { role, reason: reason.trim(), mfaCode: mfaCode.trim() },
      { onSuccess: onClose },
    );
  };
  return (
    <Modal
      open={Boolean(user)}
      onClose={onClose}
      preventClose={update.isPending}
      ariaLabel="Change user role"
      contentClassName="max-w-lg bg-[#1c1a18] text-[#f2f0eb]"
    >
      <h2 className="font-editorial text-2xl font-bold">Change staff role</h2>
      <p className="mt-2 text-sm leading-6 text-[#aaa59d]">
        Only superadmins can change roles. Existing sessions are revoked so new
        permissions take effect safely.
      </p>
      <label className="admin-field mt-5 block">
        <span>Role</span>
        <select
          value={role}
          onChange={(event) => setRole(event.target.value as typeof role)}
        >
          <option value="user">User</option>
          <option value="moderator">Moderator</option>
          <option value="admin">Administrator</option>
        </select>
      </label>
      <label className="admin-field mt-4 block">
        <span>Audit reason</span>
        <textarea
          rows={4}
          maxLength={1000}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
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
      <div className="mt-6 flex justify-end gap-2">
        <button className="admin-button" onClick={onClose}>
          Cancel
        </button>
        <button
          className="admin-primary-button"
          disabled={
            reason.trim().length < 10 ||
            mfaCode.length !== 6 ||
            update.isPending
          }
          onClick={submit}
        >
          {update.isPending ? "Updating…" : "Update role"}
        </button>
      </div>
    </Modal>
  );
}
