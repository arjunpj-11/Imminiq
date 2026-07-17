import { useState } from "react";
import Modal from "../../shared/components/AdminModal";
import { useSendAdminUserMessage } from "../hooks/useSendAdminUserMessage";
import type { AdminUser } from "../types/admin-users.types";

export default function AdminUserMessageDialog({
  user,
  onClose,
}: {
  user: AdminUser | null;
  onClose: () => void;
}) {
  const mutation = useSendAdminUserMessage(user?._id ?? "");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [notifyEmail, setNotifyEmail] = useState(true);
  const submit = () => {
    if (!user || subject.trim().length < 3 || message.trim().length < 10)
      return;
    mutation.mutate(
      { subject: subject.trim(), message: message.trim(), notifyEmail },
      { onSuccess: onClose },
    );
  };
  return (
    <Modal
      open={Boolean(user)}
      onClose={onClose}
      preventClose={mutation.isPending}
      ariaLabel="Message user"
      contentClassName="max-w-xl bg-[#1c1a18] text-[#f2f0eb]"
    >
      <h2 className="font-editorial text-2xl font-bold">
        Message {user?.fullName ?? "user"}
      </h2>
      <p className="mt-2 text-sm leading-6 text-[#aaa59d]">
        This creates an in-app notification and an auditable administrative
        communication.
      </p>
      <label className="admin-field mt-5 block">
        <span>Subject</span>
        <input
          maxLength={120}
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          placeholder="Account or learning update"
        />
      </label>
      <label className="admin-field mt-4 block">
        <span>Message</span>
        <textarea
          rows={7}
          maxLength={3000}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Write the message the user should receive…"
        />
      </label>
      <label className="mt-4 flex items-start gap-3 text-sm text-[#aaa59d]">
        <input
          type="checkbox"
          checked={notifyEmail}
          onChange={(event) => setNotifyEmail(event.target.checked)}
          className="mt-1"
        />
        Also queue this message for email delivery when the user has an email
        address.
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
          className="admin-primary-button"
          disabled={
            subject.trim().length < 3 ||
            message.trim().length < 10 ||
            mutation.isPending
          }
          onClick={submit}
        >
          {mutation.isPending ? "Sending…" : "Send message"}
        </button>
      </div>
    </Modal>
  );
}
