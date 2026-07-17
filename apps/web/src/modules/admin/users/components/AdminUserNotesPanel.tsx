import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import api from "../../../../lib/axios";
import type { ApiEnvelope } from "../../../../lib/api.types";
import { toast } from "../../../../lib/toast";
import { ADMIN_USERS_ENDPOINTS } from "../constants/admin-users.constants";
import AdminActionPasswordField from "../../shared/components/AdminActionPasswordField";
import { isAdminActionPasswordReady } from "../../shared/utils/admin-action-password";

type NotesData = {
  tags: string[];
  notes: Array<{
    id: string;
    note: string;
    tags: string[];
    author: string;
    createdAt: string;
  }>;
};
export default function AdminUserNotesPanel({ userId }: { userId: string }) {
  const key = ["admin", "users", userId, "notes"] as const;
  const client = useQueryClient();
  const query = useQuery({
    queryKey: key,
    queryFn: async () =>
      (
        await api.get<ApiEnvelope<NotesData>>(
          ADMIN_USERS_ENDPOINTS.notes(userId),
        )
      ).data.data,
  });
  const [note, setNote] = useState("");
  const [noteTags, setNoteTags] = useState("");
  const [accountTags, setAccountTags] = useState<string | null>(null);
  const [actionPassword, setActionPassword] = useState("");
  const passwordHeaders = () => ({ headers: { 'x-admin-action-password': actionPassword } });
  const refresh = () => client.invalidateQueries({ queryKey: key });
  const add = useMutation({
    mutationFn: () =>
      api.post(ADMIN_USERS_ENDPOINTS.notes(userId), {
        note: note.trim(),
        tags: noteTags
          .split(",")
          .map((value) => value.trim().toLowerCase())
          .filter(Boolean),
      }, passwordHeaders()),
    onSuccess: async () => {
      setNote("");
      setNoteTags("");
      setActionPassword("");
      toast.success("Internal note added");
      await refresh();
    },
  });
  const remove = useMutation({
    mutationFn: (noteId: string) =>
      api.delete(ADMIN_USERS_ENDPOINTS.note(userId, noteId), passwordHeaders()),
    onSuccess: refresh,
  });
  const tags = useMutation({
    mutationFn: () =>
      api.put(ADMIN_USERS_ENDPOINTS.tags(userId), {
        tags: (accountTags ?? "")
          .split(",")
          .map((value) => value.trim().toLowerCase())
          .filter(Boolean),
      }, passwordHeaders()),
    onSuccess: async () => {
      toast.success("Account tags updated");
      setAccountTags(null);
      setActionPassword("");
      await refresh();
    },
  });
  const currentTags = accountTags ?? query.data?.tags.join(", ") ?? "";
  return (
    <div className="rounded-xl border border-white/10 bg-[#1c1a18] p-6">
      <h2 className="font-editorial text-2xl font-bold">
        Internal notes & tags
      </h2>
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
            onClick={() => tags.mutate()}
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
        disabled={note.trim().length < 3 || add.isPending || !isAdminActionPasswordReady(actionPassword)}
        onClick={() => add.mutate()}
      >
        <Plus size={15} /> Add note
      </button>
      <div className="mt-5 space-y-3">
        {query.data?.notes.map((item) => (
          <article
            key={item.id}
            className="rounded-lg border border-white/10 bg-[#24211e] p-4"
          >
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
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
              {item.note}
            </p>
            <div className="mt-2 flex gap-1">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-white/5 px-2 py-1 text-[10px]"
                >
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
