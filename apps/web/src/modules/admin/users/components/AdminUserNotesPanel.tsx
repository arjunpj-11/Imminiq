import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import AdminActionPasswordField from '../../../../components/admin/AdminActionPasswordField';
import { isAdminActionPasswordReady } from '../../../../lib/admin/admin-action-password';
import { useAdminUserNotes } from '../hooks/useAdminUserNotes';
import { useAddAdminUserNote } from '../hooks/useAddAdminUserNote';
import { useDeleteAdminUserNote } from '../hooks/useDeleteAdminUserNote';
import { useUpdateAdminUserTags } from '../hooks/useUpdateAdminUserTags';

export default function AdminUserNotesPanel({ userId }: { userId: string }) {
  const query = useAdminUserNotes(userId);
  const [note, setNote] = useState('');
  const [noteTags, setNoteTags] = useState('');
  const [accountTags, setAccountTags] = useState<string | null>(null);
  const [actionPassword, setActionPassword] = useState('');
  const add = useAddAdminUserNote(userId);
  const remove = useDeleteAdminUserNote(userId, actionPassword);
  const tags = useUpdateAdminUserTags(userId);
  const addNote = () =>
    add.mutate(
      {
        note: note.trim(),
        tags: noteTags
          .split(',')
          .map((value) => value.trim().toLowerCase())
          .filter(Boolean),
        actionPassword,
      },
      {
        onSuccess: () => {
          setNote('');
          setNoteTags('');
          setActionPassword('');
        },
      }
    );
  const updateTags = () =>
    tags.mutate(
      {
        tags: (accountTags ?? '')
          .split(',')
          .map((value) => value.trim().toLowerCase())
          .filter(Boolean),
        actionPassword,
      },
      {
        onSuccess: () => {
          setAccountTags(null);
          setActionPassword('');
        },
      }
    );
  const currentTags = accountTags ?? query.data?.tags.join(', ') ?? '';
  return (
    <div className="rounded-xl border border-white/10 bg-[#1c1a18] p-6">
      <h2 className="font-editorial text-2xl font-bold">Internal notes & tags</h2>
      <p className="mt-1 text-xs text-[#aaa59d]">
        Visible only to authorized administrators; every change is audited.
      </p>
      <AdminActionPasswordField value={actionPassword} onChange={setActionPassword} />
      <label className="admin-field mt-5 block">
        <span>Account tags (comma separated)</span>
        <div className="flex gap-2">
          <input
            value={currentTags}
            onChange={(event) => setAccountTags(event.target.value)}
            placeholder="vip, fraud-review, education"
          />
          <button
            className="admin-button"
            disabled={tags.isPending || !isAdminActionPasswordReady(actionPassword)}
            onClick={updateTags}
          >
            Save
          </button>
        </div>
      </label>
      <label className="admin-field mt-4 block">
        <span>New internal note</span>
        <textarea
          rows={4}
          maxLength={3000}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Add support context, investigation findings, or follow-up steps…"
        />
      </label>
      <label className="admin-field mt-3 block">
        <span>Note tags</span>
        <input
          value={noteTags}
          onChange={(event) => setNoteTags(event.target.value)}
          placeholder="support, security"
        />
      </label>
      <button
        className="admin-primary-button mt-3 inline-flex items-center gap-2"
        disabled={
          note.trim().length < 3 || add.isPending || !isAdminActionPasswordReady(actionPassword)
        }
        onClick={addNote}
      >
        <Plus size={15} /> Add note
      </button>
      <div className="mt-5 space-y-3">
        {query.data?.notes.map((item) => (
          <article key={item.id} className="rounded-lg border border-white/10 bg-[#24211e] p-4">
            <div className="flex justify-between gap-3">
              <div className="text-xs text-[#aaa59d]">
                {item.author} · {new Date(item.createdAt).toLocaleString()}
              </div>
              <button
                aria-label="Delete note"
                className="text-[#e26767]"
                disabled={!isAdminActionPasswordReady(actionPassword) || remove.isPending}
                onClick={() => remove.mutate(item.id)}
              >
                <Trash2 size={15} />
              </button>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{item.note}</p>
            <div className="mt-2 flex gap-1">
              {item.tags.map((tag) => (
                <span key={tag} className="rounded bg-white/5 px-2 py-1 text-[10px]">
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
        {query.data?.notes.length === 0 && (
          <p className="text-sm text-[#aaa59d]">No internal notes yet.</p>
        )}
      </div>
    </div>
  );
}
