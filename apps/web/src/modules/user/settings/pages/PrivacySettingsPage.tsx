import { useMemo, useState } from 'react';
import SettingsShell from '../components/SettingsShell';
import SettingsContentLoading from '../components/SettingsContentLoading';
import {
  MonoLabel,
  PillButton,
  SaveBar,
  SettingsCard,
  SettingsPageFeedback,
  ToggleRow,
} from '../components/SettingsUi';
import { useSettingsToast } from '../hooks/useSettingsToast';
import { useUnsavedChangesGuard } from '../hooks/useUnsavedChangesGuard';
import { usePrivacySettings, useResetSettings, useUpdatePrivacy } from '../hooks/useSettings';
import type { MessagePermissionType, IPrivacySettings } from '../types/settings.types';

export default function PrivacySettingsPage() {
  const privacyQuery = usePrivacySettings();

  if (privacyQuery.isLoading) {
    return (
      <SettingsShell
        title="Privacy"
        subtitle="Control what others can see across your Imminiq presence."
      >
        <SettingsContentLoading
          eyebrow="Loading Privacy"
          title="Preparing privacy controls"
          description="Fetching your visibility, interaction, and tracker-sharing preferences."
        />
      </SettingsShell>
    );
  }

  if (!privacyQuery.data) {
    return (
      <SettingsShell
        title="Privacy"
        subtitle="Control what others can see across your Imminiq presence."
      >
        <div className="rounded-lg border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-6 text-[14px] font-semibold text-(--text-primary) dark:border-(--border-subtle) dark:bg-(--surface-card) dark:text-(--text-primary)">
          Unable to load privacy settings.
        </div>
      </SettingsShell>
    );
  }

  return <PrivacySettingsForm key={privacyQuery.dataUpdatedAt} initialForm={privacyQuery.data} />;
}

function PrivacySettingsForm({ initialForm }: { initialForm: IPrivacySettings }) {
  const updatePrivacy = useUpdatePrivacy();
  const resetSettings = useResetSettings();
  const toast = useSettingsToast();

  const [form, setForm] = useState<IPrivacySettings>(initialForm);
  const [savedForm, setSavedForm] = useState(initialForm);

  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(savedForm),
    [form, savedForm]
  );

  const unsavedChangesGuard = useUnsavedChangesGuard({
    when: isDirty,
    onDiscard: () => setForm(savedForm),
  });

  const privacyScore = useMemo(() => {
    let score = 100;

    if (form.showProfile) score -= 12;
    if (form.showActivity) score -= 10;
    if (form.showStats) score -= 8;
    if (form.allowPublicTrackerView) score -= 12;
    if (form.allowTrackerCloning) score -= 14;
    if (form.showTrackerProgress) score -= 10;
    if (form.allowFriendRequests) score -= 6;
    if (form.allowChallenges) score -= 8;

    if (form.messagePermission === 'everyone') {
      score -= 16;
    }

    if (form.messagePermission === 'friends') {
      score -= 8;
    }

    return Math.max(0, score);
  }, [form]);

  const scoreLabel =
    privacyScore >= 80 ? 'Highly Private' : privacyScore >= 55 ? 'Balanced' : 'Open';

  const handleSave = async () => {
    try {
      toast.showToast('Saving privacy settings...', 'loading');

      await updatePrivacy.mutateAsync({
        profileVisibility: form.profileVisibility,

        showProfile: form.showProfile,
        showStreak: form.showStreak,
        showProgress: form.showProgress,
        showLeaderboardRank: form.showLeaderboardRank,
        showActivity: form.showActivity,
        showOnlineStatus: form.showOnlineStatus,
        showStats: form.showStats,

        allowFriendRequests: form.allowFriendRequests,
        allowChallenges: form.allowChallenges,
        allowMessages: form.allowMessages,
        messagePermission: form.messagePermission,

        allowPublicTrackerView: form.allowPublicTrackerView,
        allowTrackerCloning: form.allowTrackerCloning,
        showTrackerProgress: form.showTrackerProgress,
      });

      setSavedForm(form);

      toast.showToast('Privacy settings saved.', 'success');
      return true;
    } catch {
      toast.showToast('Unable to save privacy settings.', 'error');
      return false;
    }
  };

  const handleReset = async () => {
    try {
      await resetSettings.mutateAsync();
      toast.showToast('Settings reset to defaults.', 'success');
    } catch {
      toast.showToast('Unable to reset privacy settings.', 'error');
    }
  };

  const makeProfilePrivate = () => {
    setForm((current) => ({
      ...current,
      profileVisibility: 'private',

      showProfile: false,
      showStreak: false,
      showProgress: false,
      showLeaderboardRank: false,
      showActivity: false,
      showOnlineStatus: false,
      showStats: false,

      allowFriendRequests: false,
      allowChallenges: false,
      allowMessages: false,
      messagePermission: 'nobody',

      allowPublicTrackerView: false,
      allowTrackerCloning: false,
      showTrackerProgress: false,
    }));

    toast.showToast('Private mode prepared. Save changes to apply.', 'info');
  };

  const selectProfileVisibility = (profileVisibility: IPrivacySettings['profileVisibility']) => {
    setForm((current) => ({
      ...current,
      profileVisibility,
    }));
  };

  const selectMessagePermission = (messagePermission: MessagePermissionType) => {
    setForm((current) => ({
      ...current,
      messagePermission,
      allowMessages: messagePermission !== 'nobody',
    }));
  };

  return (
    <SettingsShell
      title="Privacy"
      subtitle="Control what others can see across your Imminiq presence."
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          {/* ─── HERO CARD ─────────────────────────────── */}
          <SettingsCard
            title="Control what others can see"
            description="Configure how your scholarly progress, trackers and interactions appear to the Imminiq community."
            icon="🛡️"
            className="bg-[linear-gradient(135deg,rgba(184,76,43,0.10),rgba(59,108,183,0.06))] dark:bg-[linear-gradient(135deg,rgba(232,129,106,0.11),rgba(107,159,232,0.06))]"
          >
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[rgba(184,76,43,0.10)] px-3 py-1 text-[11px] font-semibold text-(--brand-500) dark:bg-[rgba(232,129,106,0.12)] dark:text-(--brand-500)">
                {form.profileVisibility === 'private'
                  ? 'Private Profile'
                  : form.profileVisibility === 'friends'
                    ? 'Friends Visibility'
                    : 'Public Visibility'}
              </span>

              <span className="rounded-full bg-[rgba(59,108,183,0.10)] px-3 py-1 text-[11px] font-semibold text-(--info) dark:text-(--info)">
                {form.allowTrackerCloning ? 'Tracker Cloning Allowed' : 'Tracker Cloning Blocked'}
              </span>

              <span className="rounded-full bg-[rgba(45,106,71,0.10)] px-3 py-1 text-[11px] font-semibold text-(--success) dark:text-(--success)">
                Privacy Score {privacyScore}
              </span>
            </div>
          </SettingsCard>

          {/* ─── PROFILE VISIBILITY ───────────────────── */}
          <SettingsCard
            title="Profile Visibility"
            description="Choose the default visibility level for your profile."
            icon="👤"
          >
            <MonoLabel>Visibility Mode</MonoLabel>

            <div className="mb-4 flex flex-wrap gap-2">
              <PillButton
                active={form.profileVisibility === 'public'}
                onClick={() => selectProfileVisibility('public')}
              >
                Public
              </PillButton>

              <PillButton
                active={form.profileVisibility === 'friends'}
                onClick={() => selectProfileVisibility('friends')}
              >
                Friends
              </PillButton>

              <PillButton
                active={form.profileVisibility === 'private'}
                onClick={() => selectProfileVisibility('private')}
              >
                Private
              </PillButton>
            </div>

            <ToggleRow
              title="Show my public profile"
              description="Allows other learners to discover and visit your profile page."
              code="privacy.showProfile"
              checked={form.showProfile}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  showProfile: value,
                }))
              }
            />

            <ToggleRow
              title="Show online status"
              description="Display whether you are currently active on Imminiq."
              code="privacy.showOnlineStatus"
              checked={form.showOnlineStatus}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  showOnlineStatus: value,
                }))
              }
            />
          </SettingsCard>

          {/* ─── ACTIVITY VISIBILITY ───────────────────── */}
          <SettingsCard
            title="Activity & Progress Visibility"
            description="Decide which learning achievements appear publicly."
            icon="📈"
          >
            <ToggleRow
              title="Show my learning streak"
              description="Display your streak count on public and social areas."
              checked={form.showStreak}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  showStreak: value,
                }))
              }
            />

            <ToggleRow
              title="Show my progress"
              description="Expose high-level roadmap completion progress."
              checked={form.showProgress}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  showProgress: value,
                }))
              }
            />

            <ToggleRow
              title="Show leaderboard rank"
              description="Display your ranking in leaderboard-related areas."
              checked={form.showLeaderboardRank}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  showLeaderboardRank: value,
                }))
              }
            />

            <ToggleRow
              title="Show community activity"
              description="Reveal likes, comments, posts and tracker-sharing activity."
              checked={form.showActivity}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  showActivity: value,
                }))
              }
            />

            <ToggleRow
              title="Show global stats"
              description="Display summary metrics on your public profile."
              checked={form.showStats}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  showStats: value,
                }))
              }
            />
          </SettingsCard>

          {/* ─── TRACKER VISIBILITY ───────────────────── */}
          <SettingsCard
            title="Tracker Visibility"
            description="Control whether other users can view, clone or inspect your tracker progress."
            icon="🗺️"
          >
            <ToggleRow
              title="Allow public tracker viewing"
              description="Other users can open public trackers attached to your profile."
              checked={form.allowPublicTrackerView}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  allowPublicTrackerView: value,
                }))
              }
            />

            <ToggleRow
              title="Allow tracker cloning"
              description="Other learners can duplicate your shared tracker structure."
              checked={form.allowTrackerCloning}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  allowTrackerCloning: value,
                }))
              }
            />

            <ToggleRow
              title="Show tracker progress"
              description="Expose progress percentages within visible trackers."
              checked={form.showTrackerProgress}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  showTrackerProgress: value,
                }))
              }
            />
          </SettingsCard>

          {/* ─── CONTACT & INTERACTION ────────────────── */}
          <SettingsCard
            title="Messages & Invitations"
            description="Choose who can contact or challenge you."
            icon="💬"
          >
            <MonoLabel>Who can message me?</MonoLabel>

            <div className="mb-4 flex flex-wrap gap-2">
              <PillButton
                active={form.messagePermission === 'everyone'}
                onClick={() => selectMessagePermission('everyone')}
              >
                Everyone
              </PillButton>

              <PillButton
                active={form.messagePermission === 'friends'}
                onClick={() => selectMessagePermission('friends')}
              >
                Friends Only
              </PillButton>

              <PillButton
                active={form.messagePermission === 'nobody'}
                onClick={() => selectMessagePermission('nobody')}
              >
                Nobody
              </PillButton>
            </div>

            <ToggleRow
              title="Allow messages"
              description="Enable or disable direct messages entirely."
              checked={form.allowMessages}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  allowMessages: value,
                  messagePermission: value
                    ? current.messagePermission === 'nobody'
                      ? 'friends'
                      : current.messagePermission
                    : 'nobody',
                }))
              }
            />

            <ToggleRow
              title="Allow friend requests"
              description="Let other learners send connection requests."
              checked={form.allowFriendRequests}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  allowFriendRequests: value,
                }))
              }
            />

            <ToggleRow
              title="Allow challenge invitations"
              description="Permit other users to invite you into battle mode or challenge events."
              checked={form.allowChallenges}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  allowChallenges: value,
                }))
              }
            />
          </SettingsCard>

          <SaveBar
            isSaving={updatePrivacy.isPending}
            isDirty={isDirty}
            onSave={handleSave}
            onReset={handleReset}
          />
        </div>

        {/* ─── RIGHT SIDE SUMMARY ───────────────────── */}
        <aside className="space-y-5">
          <SettingsCard title="Privacy Score" icon="📊">
            <div className="rounded-lg bg-[#f9f3ef] p-5 text-center dark:bg-(--surface-card)">
              <div className="text-[44px] font-black tracking-[-1px] text-(--brand-500) dark:text-(--brand-500)">
                {privacyScore}
              </div>

              <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.15em] text-(--text-secondary) dark:text-(--text-secondary)">
                {scoreLabel}
              </div>
            </div>

            <button
              type="button"
              onClick={makeProfilePrivate}
              className="mt-4 w-full rounded-md border-[1.5px] border-[rgba(196,60,60,0.22)] bg-[rgba(196,60,60,0.08)] px-4 py-3 text-[13px] font-bold text-(--danger) transition hover:bg-[rgba(196,60,60,0.12)] dark:text-(--danger)"
            >
              Make Profile Private
            </button>
          </SettingsCard>

          <SettingsCard title="Visibility Summary" icon="🧭">
            <div className="space-y-3 text-[13px]">
              <div className="flex justify-between gap-3">
                <span className="text-(--text-secondary) dark:text-(--text-secondary)">
                  Profile
                </span>

                <strong className="capitalize text-(--text-primary) dark:text-(--text-primary)">
                  {form.profileVisibility}
                </strong>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-(--text-secondary) dark:text-(--text-secondary)">
                  Discoverable
                </span>

                <strong className="text-(--text-primary) dark:text-(--text-primary)">
                  {form.showProfile ? 'Yes' : 'No'}
                </strong>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-(--text-secondary) dark:text-(--text-secondary)">
                  Tracker Cloning
                </span>

                <strong className="text-(--text-primary) dark:text-(--text-primary)">
                  {form.allowTrackerCloning ? 'Allowed' : 'Blocked'}
                </strong>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-(--text-secondary) dark:text-(--text-secondary)">
                  Messages
                </span>

                <strong className="capitalize text-(--text-primary) dark:text-(--text-primary)">
                  {form.messagePermission}
                </strong>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-(--text-secondary) dark:text-(--text-secondary)">
                  Challenge Invites
                </span>

                <strong className="text-(--text-primary) dark:text-(--text-primary)">
                  {form.allowChallenges ? 'Allowed' : 'Blocked'}
                </strong>
              </div>
            </div>
          </SettingsCard>
        </aside>
      </div>

      <SettingsPageFeedback
        isBlocked={unsavedChangesGuard.isBlocked}
        isSaving={unsavedChangesGuard.isSavingChanges}
        onStay={unsavedChangesGuard.stayOnPage}
        onDiscard={unsavedChangesGuard.discardAndLeave}
        onSaveChanges={() => void unsavedChangesGuard.saveChangesAndLeave(handleSave)}
        toast={toast}
      />
    </SettingsShell>
  );
}
