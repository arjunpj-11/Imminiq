import { useState } from 'react';
import SettingsContentLoading from '../components/SettingsContentLoading';
import { SaveBar, SettingsCard, ToggleRow } from '../components/SettingsUi';
import {
  useNotificationSettings,
  useResetSettings,
  useUpdateNotifications,
} from '../hooks/useSettings';
import { useSettingsToast } from '../hooks/useSettingsToast';
import type { INotificationSettings } from '../types/settings.types';
import { useAppShellStore } from '../../../../store/useAppShellStore';

export default function NotificationSettingsPage() {
  const query = useNotificationSettings();
  if (query.isLoading)
    return (
      <SettingsContentLoading variant="notifications" title="Preparing notification controls" />
    );
  if (!query.data) return <p>Unable to load notification settings.</p>;
  return <NotificationForm key={query.dataUpdatedAt} initial={query.data} />;
}

function NotificationForm({ initial }: { initial: INotificationSettings }) {
  const [form, setForm] = useState(initial);
  const update = useUpdateNotifications();
  const reset = useResetSettings();
  const toast = useSettingsToast();
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  const messageMode = useAppShellStore((state) => state.messageNotificationMode);
  const setMessageMode = useAppShellStore((state) => state.setMessageNotificationMode);
  const quietHoursEnabled = useAppShellStore((state) => state.quietHoursEnabled);
  const quietHoursStart = useAppShellStore((state) => state.quietHoursStart);
  const quietHoursEnd = useAppShellStore((state) => state.quietHoursEnd);
  const setQuietHours = useAppShellStore((state) => state.setQuietHours);
  const save = async () => {
    try {
      await update.mutateAsync(form);
      toast.showToast('Notification settings saved.', 'success');
      return true;
    } catch {
      toast.showToast('Unable to save notifications.', 'error');
      return false;
    }
  };
  return (
    <>
      <SettingsCard
        title="In-app notifications"
        description="These controls directly affect notification delivery. Unsupported email, push, digest, and quiet-hour toggles have been removed."
        icon="🔔"
      >
        <ToggleRow
          title="Enable in-app notifications"
          description="Master control for optional product notifications."
          checked={form.globalEnabled}
          onChange={(value) => setForm((current) => ({ ...current, globalEnabled: value }))}
        />
        <ToggleRow
          title="Platform announcements"
          description="Receive administrator broadcasts and important product announcements."
          checked={form.types.adminBroadcasts}
          onChange={(value) =>
            setForm((current) => ({ ...current, types: { adminBroadcasts: value } }))
          }
        />
      </SettingsCard>
      <SettingsCard
        title="Messages and quiet hours"
        description="Reduce chat noise without leaving important conversations."
        icon="💬"
      >
        <div className="grid gap-2 sm:grid-cols-3">
          {[
            ['all', 'All messages'],
            ['mentions', 'Mentions only'],
            ['muted', 'Mute messages'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setMessageMode(value as 'all' | 'mentions' | 'muted')}
              className={`min-h-11 rounded-xl border px-3 text-sm font-bold ${
                messageMode === value
                  ? 'border-(--brand-500) bg-[color-mix(in_srgb,var(--brand-500)_10%,transparent)] text-(--brand-500)'
                  : 'border-(--border-subtle) text-(--text-secondary)'
              }`}
              aria-pressed={messageMode === value}
            >
              {label}
            </button>
          ))}
        </div>
        <ToggleRow
          title="Quiet hours"
          description="Silence optional alerts during your chosen time window."
          checked={quietHoursEnabled}
          onChange={(enabled) =>
            setQuietHours({ enabled, start: quietHoursStart, end: quietHoursEnd })
          }
        />
        {quietHoursEnabled && (
          <div className="grid gap-3 pb-3 sm:grid-cols-2">
            <label className="text-xs font-bold text-(--text-secondary)">
              Starts
              <input
                type="time"
                value={quietHoursStart}
                onChange={(event) =>
                  setQuietHours({
                    enabled: true,
                    start: event.target.value,
                    end: quietHoursEnd,
                  })
                }
                className="mt-1 block min-h-11 w-full rounded-xl border border-(--border-subtle) bg-(--surface-elevated) px-3"
              />
            </label>
            <label className="text-xs font-bold text-(--text-secondary)">
              Ends
              <input
                type="time"
                value={quietHoursEnd}
                onChange={(event) =>
                  setQuietHours({
                    enabled: true,
                    start: quietHoursStart,
                    end: event.target.value,
                  })
                }
                className="mt-1 block min-h-11 w-full rounded-xl border border-(--border-subtle) bg-(--surface-elevated) px-3"
              />
            </label>
          </div>
        )}
        <button
          type="button"
          onClick={() =>
            toast.showToast(
              quietHoursEnabled
                ? `Preview: optional alerts are quiet from ${quietHoursStart} to ${quietHoursEnd}.`
                : `Preview: ${messageMode === 'all' ? 'all messages' : messageMode === 'mentions' ? 'mentions only' : 'message alerts are muted'}.`,
              'info'
            )
          }
          className="mt-3 min-h-11 rounded-xl border border-(--border-subtle) px-4 text-[13px] font-bold text-(--brand-500) transition hover:border-(--brand-500)"
        >
          Preview notification behavior
        </button>
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
    </>
  );
}
