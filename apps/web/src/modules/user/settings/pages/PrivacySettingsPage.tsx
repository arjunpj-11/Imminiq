import { useState } from 'react';
import SettingsContentLoading from '../components/SettingsContentLoading';
import { SaveBar, SettingsCard, ToggleRow } from '../components/SettingsUi';
import {
  useCancelDataPrivacyRequest,
  useDataPrivacyRequests,
  usePrivacySettings,
  useResetSettings,
  useSubmitDataPrivacyRequest,
  useUpdatePrivacy,
} from '../hooks/useSettings';
import { useSettingsToast } from '../hooks/useSettingsToast';
import type { DataPrivacyRequest, IPrivacySettings } from '../types/settings.types';

export default function PrivacySettingsPage() {
  const query = usePrivacySettings();
  if (query.isLoading)
    return <SettingsContentLoading variant="privacy" title="Preparing privacy controls" />;
  if (!query.data) return <p>Unable to load privacy settings.</p>;
  return <PrivacyForm key={query.dataUpdatedAt} initial={query.data} />;
}

function PrivacyForm({ initial }: { initial: IPrivacySettings }) {
  const [form, setForm] = useState(initial);
  const update = useUpdatePrivacy();
  const reset = useResetSettings();
  const toast = useSettingsToast();
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  const save = async () => {
    try {
      await update.mutateAsync(form);
      toast.showToast('Privacy settings saved.', 'success');
      return true;
    } catch {
      toast.showToast('Unable to save privacy settings.', 'error');
      return false;
    }
  };
  return (
    <>
      <div className="space-y-5">
        <SettingsCard
          title="Public profile"
          description="Every setting below is enforced when another learner requests your public profile."
          icon="🛡️"
        >
          <ToggleRow
            title="Allow public profile"
            description="If disabled, other learners cannot open your profile."
            checked={form.showProfile}
            onChange={(showProfile) => setForm((current) => ({ ...current, showProfile }))}
          />
          <ToggleRow
            title="Show learning statistics"
            description="Expose XP, level, streak, and other high-level learning statistics."
            checked={form.showStats}
            onChange={(showStats) => setForm((current) => ({ ...current, showStats }))}
          />
          <ToggleRow
            title="Show recent activity"
            description="Expose recent public learning activity on your profile."
            checked={form.showActivity}
            onChange={(showActivity) => setForm((current) => ({ ...current, showActivity }))}
          />
        </SettingsCard>
        <SettingsCard
          title="Chat presence"
          description="Control whether people you chat with can see when you are available."
          icon="💬"
        >
          <ToggleRow
            title="Show online status and last activity"
            description="When disabled, people in your chats cannot see when you are online or when you were last active."
            checked={form.showOnlineStatus}
            onChange={(showOnlineStatus) =>
              setForm((current) => ({ ...current, showOnlineStatus }))
            }
          />
        </SettingsCard>
        <SaveBar
          isSaving={update.isPending}
          isDirty={dirty}
          onSave={save}
          onReset={async () => {
            await reset.mutateAsync();
            toast.showToast('Settings reset.', 'success');
          }}
        />
        <DataRightsPanel />
      </div>
    </>
  );
}

function DataRightsPanel() {
  const query = useDataPrivacyRequests();
  const submit = useSubmitDataPrivacyRequest();
  const cancel = useCancelDataPrivacyRequest();
  const [type, setType] = useState<DataPrivacyRequest['type']>('export');
  const [details, setDetails] = useState('Please process this request for my Imminiq account.');
  const active = query.data?.some(
    (item) => item.type === type && ['pending', 'in_progress'].includes(item.status)
  );
  return (
    <SettingsCard
      title="Your data rights"
      description="Submit and track access, portable export, correction, or deletion requests. Requests are due within 30 days."
      icon="📁"
    >
      <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
        <label className="text-xs font-semibold text-(--text-secondary)">
          Request type
          <select
            className="mt-2 w-full rounded-md border border-(--border-subtle) bg-(--surface-card) px-3 py-2 text-(--text-primary)"
            value={type}
            onChange={(event) => setType(event.target.value as DataPrivacyRequest['type'])}
          >
            <option value="export">Portable export</option>
            <option value="access">Access report</option>
            <option value="correction">Correction</option>
            <option value="delete">Deletion</option>
          </select>
        </label>
        <label className="text-xs font-semibold text-(--text-secondary)">
          Details
          <textarea
            className="mt-2 min-h-22 w-full rounded-md border border-(--border-subtle) bg-(--surface-card) px-3 py-2 text-(--text-primary)"
            maxLength={3000}
            value={details}
            onChange={(event) => setDetails(event.target.value)}
          />
        </label>
      </div>
      <button
        type="button"
        className="mt-3 rounded-md bg-(--brand-500) px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
        disabled={details.trim().length < 10 || active || submit.isPending}
        onClick={() => submit.mutate({ type, details: details.trim() })}
      >
        {active ? 'Request already active' : submit.isPending ? 'Submitting…' : 'Submit request'}
      </button>
      <div className="mt-5 space-y-2" aria-live="polite">
        {query.isLoading && <p className="text-sm text-(--text-secondary)">Loading requests…</p>}
        {query.data?.map((item) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-(--border-subtle) p-3 text-sm"
          >
            <div>
              <strong className="capitalize">{item.type}</strong>
              <div className="text-xs text-(--text-secondary)">
                Submitted {new Date(item.createdAt).toLocaleDateString()} · Due{' '}
                {new Date(item.dueAt).toLocaleDateString()}
              </div>
              {item.resolutionNote && <p className="mt-1 text-xs">{item.resolutionNote}</p>}
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-black/5 px-2 py-1 text-xs font-semibold capitalize dark:bg-white/10">
                {item.status.replace('_', ' ')}
              </span>
              {item.downloadUrl && (
                <a
                  className="text-xs font-bold text-(--brand-500)"
                  href={item.downloadUrl}
                  rel="noreferrer"
                >
                  Open export
                </a>
              )}
              {item.status === 'pending' && (
                <button
                  className="text-xs font-bold text-(--danger)"
                  onClick={() => cancel.mutate(item.id)}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </SettingsCard>
  );
}
