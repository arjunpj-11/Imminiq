import { useState } from 'react';
import Modal from '../../../../components/overlays/Modal';
import type {
  AdminMockTestLifecyclePayload,
  AdminMockTest,
} from '../types/admin-mock-tests.types';
import { useUpdateAdminMockTestLifecycle } from '../hooks/useUpdateAdminMockTestLifecycle';

type Props = {
  test: Pick<AdminMockTest, 'id' | 'title' | 'attemptCount' | 'moderationStatus'> | null;
  action: AdminMockTestLifecyclePayload['action'];
  onClose: () => void;
  onComplete?: () => void;
};

export default function AdminMockTestModerationDialog({
  test,
  action,
  onClose,
  onComplete,
}: Props) {
  const mutation = useUpdateAdminMockTestLifecycle();
  const [reasonCode, setReasonCode] = useState<AdminMockTestLifecyclePayload['reasonCode']>(
    action === 'restore' ? 'appeal_accepted' : 'broken_assessment'
  );
  const [reason, setReason] = useState('');
  const [notifyOwner, setNotifyOwner] = useState(true);
  const [mfaCode, setMfaCode] = useState('');

  const submit = () => {
    if (!test || reason.trim().length < 15) return;
    mutation.mutate(
      { id: test.id, payload: { action, reasonCode, reason: reason.trim(), notifyOwner, mfaCode: mfaCode.trim() } },
      { onSuccess: () => (onComplete ? onComplete() : onClose()) }
    );
  };

  const actionLabel = action === 'delete' ? 'Delete' : action === 'suspend' ? 'Suspend' : 'Restore';
  return (
    <Modal
      open={Boolean(test)}
      onClose={onClose}
      preventClose={mutation.isPending}
      ariaLabel={`${actionLabel} mock test`}
      contentClassName="max-w-xl bg-[#1c1a18] text-[#f2f0eb]"
    >
      <h2 className="font-editorial text-2xl font-bold">
        {actionLabel} {test?.title ?? 'mock test'}?
      </h2>
      <p className="mt-2 text-sm leading-6 text-[#aaa59d]">
        {action === 'delete'
          ? `The test will disappear from the user experience, sharing will stop, and active attempts will be abandoned. ${test?.attemptCount ?? 0} historical attempts will remain available for audit and results.`
          : action === 'suspend'
            ? 'New attempts and sharing will stop while the content remains recoverable for review.'
            : 'The test will become available again. It remains private until its owner republishes it.'}
      </p>
      <label className="admin-field mt-5 block">
        <span>Reason category</span>
        <select
          value={reasonCode}
          onChange={(event) =>
            setReasonCode(event.target.value as AdminMockTestLifecyclePayload['reasonCode'])
          }
        >
          <option value="incorrect_content">Incorrect content</option>
          <option value="unsafe_content">Unsafe content</option>
          <option value="copyright">Copyright concern</option>
          <option value="spam_or_abuse">Spam or abuse</option>
          <option value="broken_assessment">Broken assessment</option>
          <option value="owner_request">Owner request</option>
          <option value="appeal_accepted">Appeal accepted</option>
          <option value="other">Other</option>
        </select>
      </label>
      <label className="admin-field mt-4 block">
        <span>User-facing explanation</span>
        <textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          maxLength={1000}
          rows={5}
          placeholder="Explain the evidence and the exact reason for this decision…"
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
        Queue an email containing this explanation. An in-app notification is always sent.
      </label>
      <label className="admin-field mt-4 block">
        <span>Authenticator code</span>
        <input inputMode="numeric" autoComplete="one-time-code" maxLength={8} value={mfaCode} onChange={(event) => setMfaCode(event.target.value.replace(/\D/g, ''))} placeholder="Required in production" />
      </label>
      <div className="mt-6 flex justify-end gap-2">
        <button className="admin-button" onClick={onClose} disabled={mutation.isPending}>
          Cancel
        </button>
        <button
          className={action === 'restore' ? 'admin-primary-button' : 'admin-button text-[#e26767]'}
          disabled={reason.trim().length < 15 || mutation.isPending}
          onClick={submit}
        >
          {mutation.isPending ? 'Applying…' : `${actionLabel} test`}
        </button>
      </div>
    </Modal>
  );
}
