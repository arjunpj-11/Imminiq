import { useState } from "react";
import Modal from "../../../../components/admin/AdminModal";
import { useRevokeAdminUserSession } from "../hooks/useRevokeAdminUserSession";
import AdminActionPasswordField from "../../../../components/admin/AdminActionPasswordField";
import { isAdminActionPasswordReady } from "../../../../lib/admin/admin-action-password";

type Session = {
  id: string;
  device: string;
  ipAddress: string;
  userAgent: string;
};

export default function AdminUserSessionDialog({
  userId,
  session,
  onClose,
}: {
  userId: string;
  session: Session | null;
  onClose: () => void;
}) {
  const revoke = useRevokeAdminUserSession(userId);
  const [actionPassword, setActionPassword] = useState("");
  const submit = () => {
    if (!session) return;
    revoke.mutate(
      { sessionId: session.id, actionPassword },
      { onSuccess: onClose },
    );
  };
  return (
    <Modal
      open={Boolean(session)}
      onClose={onClose}
      preventClose={revoke.isPending}
      ariaLabel="Revoke user session"
      contentClassName="max-w-lg bg-[#1c1a18] text-[#f2f0eb]"
    >
      <h2 className="font-editorial text-2xl font-bold">
        Revoke this session?
      </h2>
      <p className="mt-2 text-sm leading-6 text-[#aaa59d]">
        The device will immediately lose API access and must sign in again.
      </p>
      <div className="mt-5 rounded-xl border border-white/10 bg-[#24211e] p-4 text-sm">
        <div className="font-semibold">{session?.device}</div>
        <div className="mt-1 break-all text-xs text-[#aaa59d]">
          {session?.ipAddress} · {session?.userAgent}
        </div>
      </div>
      <AdminActionPasswordField
        value={actionPassword}
        onChange={setActionPassword}
        className="admin-field mt-4 block"
      />
      <div className="mt-6 flex justify-end gap-2">
        <button className="admin-button" onClick={onClose}>
          Cancel
        </button>
        <button
          className="admin-button text-[#e26767]"
          onClick={submit}
          disabled={!isAdminActionPasswordReady(actionPassword) || revoke.isPending}
        >
          {revoke.isPending ? "Revoking…" : "Revoke session"}
        </button>
      </div>
    </Modal>
  );
}
