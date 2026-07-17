import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ShieldAlert, UsersRound, X } from "lucide-react";
import { useState } from "react";
import Modal from "./AdminModal";
import api from "../../../../lib/axios";
import { toast } from "../../../../lib/toast";
import { getUserFacingError } from "../../../../lib/user-facing-error";

type Kind = "users" | "trackers" | "mock-tests";
type Action = "suspend" | "delete" | "restore" | "block";

type BulkResult = {
  eligible?: string[];
  succeeded?: number;
  failed?: number;
};

export function AdminBulkActionBar({
  kind,
  selected,
  onClear,
}: {
  kind: Kind;
  selected: string[];
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<Action>("suspend");
  const [reason, setReason] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [eligible, setEligible] = useState<string[] | null>(null);
  const client = useQueryClient();
  const endpoint =
    kind === "users"
      ? "/admin/users/bulk/status"
      : `/admin/${kind}/bulk/lifecycle`;

  const body = (preview: boolean) =>
    kind === "users"
      ? {
          userIds: selected,
          status:
            action === "block" || action === "restore"
              ? action === "restore"
                ? "active"
                : "blocked"
              : "paused",
          reasonCode: action === "restore" ? "appeal_accepted" : "other",
          reason,
          notifyEmail: true,
          preview,
        }
      : {
          ids: selected,
          action: action === "block" ? "suspend" : action,
          reasonCode: action === "restore" ? "appeal_accepted" : "other",
          reason,
          notifyOwner: true,
          preview,
        };

  const mutation = useMutation({
    mutationFn: async (preview: boolean) =>
      (
        await api.post(endpoint, body(preview), {
          headers: mfaCode ? { "X-Admin-MFA-Code": mfaCode } : undefined,
        })
      ).data.data as BulkResult,
    onSuccess: async (data, preview) => {
      if (preview) {
        setEligible(data.eligible ?? []);
        return;
      }
      toast.success(
        "Bulk action completed",
        `${data.succeeded ?? 0} succeeded; ${data.failed ?? 0} failed.`,
      );
      setOpen(false);
      setEligible(null);
      setReason("");
      setMfaCode("");
      onClear();
      await client.invalidateQueries({ queryKey: ["admin", kind] });
    },
    onError: (error) =>
      toast.error("Bulk action failed", getUserFacingError(error)),
  });

  if (!selected.length) return null;

  const close = () => {
    if (mutation.isPending) return;
    setOpen(false);
    setEligible(null);
  };

  const mfaReady = /^\d{6}$/.test(mfaCode);
  const reasonReady = reason.trim().length >= 15;

  return (
    <div
      className="admin-sticky-action-bar mb-4"
      role="region"
      aria-label="Bulk selection actions"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e8816a]/12 text-[#e8816a]">
          <UsersRound size={18} aria-hidden="true" />
        </span>
        <div>
          <strong className="block text-sm">
            {selected.length} records selected
          </strong>
          <span className="text-xs text-[#aaa59d]">
            Selection may include records from earlier pages.
          </span>
        </div>
      </div>
      <div className="flex gap-2">
        <button type="button" className="admin-button" onClick={onClear}>
          <X size={15} aria-hidden="true" />
          Clear
        </button>
        <button
          type="button"
          className="admin-primary-button"
          onClick={() => setOpen(true)}
        >
          Bulk action
        </button>
      </div>

      <Modal
        open={open}
        onClose={close}
        preventClose={mutation.isPending}
        ariaLabel="Bulk administration action"
        contentClassName="max-w-xl bg-[#1c1a18] text-[#f2f0eb]"
      >
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#e8816a]/12 text-[#e8816a]">
            <ShieldAlert size={20} aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-editorial text-2xl font-bold">
              Bulk {kind} action
            </h2>
            <p className="mt-1 text-sm leading-6 text-[#aaa59d]">
              Preview is required before applying changes. Every record receives
              an individual audit result.
            </p>
          </div>
        </div>

        <label className="admin-field mt-5 block">
          <span>Action</span>
          <select
            value={action}
            onChange={(event) => {
              setAction(event.target.value as Action);
              setEligible(null);
            }}
          >
            <option value="suspend">Suspend</option>
            {kind === "users" && <option value="block">Block</option>}
            {kind !== "users" && <option value="delete">Delete</option>}
            <option value="restore">Restore</option>
          </select>
        </label>

        <label className="admin-field mt-4 block">
          <span>Reason</span>
          <textarea
            rows={5}
            minLength={15}
            maxLength={1000}
            value={reason}
            onChange={(event) => {
              setReason(event.target.value);
              setEligible(null);
            }}
            placeholder="Explain why this action is necessary. This is stored in the audit log."
          />
          <span className="text-right text-xs font-normal text-[#817c75]">
            {reason.trim().length}/1000 · minimum 15 characters
          </span>
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
            aria-describedby="bulk-mfa-help"
          />
          <span
            id="bulk-mfa-help"
            className="text-xs font-normal text-[#817c75]"
          >
            Required before a high-impact action can be previewed or applied.
          </span>
        </label>

        {eligible && (
          <div
            className="admin-dialog-section mt-4 p-4 text-sm"
            role="status"
            aria-live="polite"
          >
            <strong>
              {eligible.length} of {selected.length}
            </strong>{" "}
            records are eligible. Review the scope, then apply.
          </div>
        )}

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button type="button" className="admin-button" onClick={close}>
            Cancel
          </button>
          {eligible ? (
            <button
              type="button"
              className="admin-primary-button"
              disabled={!eligible.length || mutation.isPending || !mfaReady}
              onClick={() => mutation.mutate(false)}
            >
              {mutation.isPending ? "Applying…" : `Apply to ${eligible.length}`}
            </button>
          ) : (
            <button
              type="button"
              className="admin-primary-button"
              disabled={!reasonReady || !mfaReady || mutation.isPending}
              onClick={() => mutation.mutate(true)}
            >
              {mutation.isPending ? "Checking impact…" : "Preview impact"}
            </button>
          )}
        </div>
      </Modal>
    </div>
  );
}
