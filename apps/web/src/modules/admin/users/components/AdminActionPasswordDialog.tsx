import { useState } from 'react';
import Modal from '../../../../components/admin/AdminModal';
import type { AdminUser } from '../types/admin-users.types';
import { useSetAdminActionPassword } from '../hooks/useSetAdminActionPassword';
import AdminActionPasswordField from '../../../../components/admin/AdminActionPasswordField';
import { isAdminActionPasswordReady } from '../../../../lib/admin/admin-action-password';

export default function AdminActionPasswordDialog({
  user,
  onClose,
}: {
  user: AdminUser | null;
  onClose: () => void;
}) {
  const update = useSetAdminActionPassword(user?._id ?? '');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [actionPassword, setActionPassword] = useState('');
  const valid =
    password.length >= 10 &&
    password.length <= 128 &&
    /[A-Za-z]/.test(password) &&
    /\d/.test(password) &&
    password === confirmation;

  return (
    <Modal
      open={Boolean(user)}
      onClose={onClose}
      preventClose={update.isPending}
      ariaLabel="Set admin action password"
      contentClassName="max-w-lg bg-[#1c1a18] text-[#f2f0eb]"
    >
      <h2 className="font-editorial text-2xl font-bold">
        {user?.adminActionPasswordConfigured ? 'Reset' : 'Set'} action password
      </h2>
      <p className="mt-2 text-sm leading-6 text-[#aaa59d]">
        Assign a private password to {user?.fullName}. They must enter it before protected admin
        changes. The password cannot be viewed after saving.
      </p>
      <label className="admin-field mt-5 block">
        <span>New action password</span>
        <input
          type="password"
          autoComplete="new-password"
          minLength={10}
          maxLength={128}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      <p className="mt-2 text-xs text-[#aaa59d]">
        Use 10–128 characters with at least one letter and one number.
      </p>
      <AdminActionPasswordField
        value={actionPassword}
        onChange={setActionPassword}
        className="admin-field mt-4 block"
      />
      <label className="admin-field mt-4 block">
        <span>Confirm action password</span>
        <input
          type="password"
          autoComplete="new-password"
          maxLength={128}
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
        />
      </label>
      {confirmation && password !== confirmation && (
        <p className="mt-2 text-xs text-[#e26767]">Passwords do not match.</p>
      )}
      <div className="mt-6 flex justify-end gap-2">
        <button className="admin-button" onClick={onClose}>
          Cancel
        </button>
        <button
          className="admin-primary-button"
          disabled={!valid || !isAdminActionPasswordReady(actionPassword) || update.isPending}
          onClick={() => update.mutate({ password, actionPassword }, { onSuccess: onClose })}
        >
          {update.isPending ? 'Saving…' : 'Save password'}
        </button>
      </div>
    </Modal>
  );
}
