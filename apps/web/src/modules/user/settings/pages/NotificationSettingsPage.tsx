import { useState } from 'react';
import SettingsShell from '../components/SettingsShell';
import SettingsContentLoading from '../components/SettingsContentLoading';
import { SaveBar, SettingsCard, ToggleRow } from '../components/SettingsUi';
import { useNotificationSettings, useResetSettings, useUpdateNotifications } from '../hooks/useSettings';
import { useSettingsToast } from '../hooks/useSettingsToast';
import type { INotificationSettings } from '../types/settings.types';

export default function NotificationSettingsPage() {
  const query = useNotificationSettings();
  if (query.isLoading) return <SettingsShell title="Notifications" subtitle="Control the notifications Imminiq currently supports."><SettingsContentLoading eyebrow="Loading notifications" title="Preparing notification controls" description="Fetching your in-app announcement preference." /></SettingsShell>;
  if (!query.data) return <SettingsShell title="Notifications" subtitle="Control the notifications Imminiq currently supports."><p>Unable to load notification settings.</p></SettingsShell>;
  return <NotificationForm key={query.dataUpdatedAt} initial={query.data} />;
}

function NotificationForm({ initial }: { initial: INotificationSettings }) {
  const [form, setForm] = useState(initial);
  const update = useUpdateNotifications();
  const reset = useResetSettings();
  const toast = useSettingsToast();
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  const save = async () => {
    try { await update.mutateAsync(form); toast.showToast('Notification settings saved.', 'success'); return true; }
    catch { toast.showToast('Unable to save notifications.', 'error'); return false; }
  };
  return <SettingsShell title="Notifications" subtitle="Control the notifications Imminiq currently supports.">
    <SettingsCard title="In-app notifications" description="These controls directly affect notification delivery. Unsupported email, push, digest, and quiet-hour toggles have been removed." icon="🔔">
      <ToggleRow title="Enable in-app notifications" description="Master control for optional product notifications." checked={form.globalEnabled} onChange={(value) => setForm((current) => ({ ...current, globalEnabled: value }))} />
      <ToggleRow title="Platform announcements" description="Receive administrator broadcasts and important product announcements." checked={form.types.adminBroadcasts} onChange={(value) => setForm((current) => ({ ...current, types: { adminBroadcasts: value } }))} />
    </SettingsCard>
    <SaveBar isSaving={update.isPending} isDirty={dirty} onSave={save} onReset={async () => { await reset.mutateAsync(); toast.showToast('Settings reset.', 'success'); }} />
  </SettingsShell>;
}
