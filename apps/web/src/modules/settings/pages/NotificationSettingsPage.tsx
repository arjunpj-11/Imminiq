import { useMemo, useState } from 'react'
import SettingsShell from '../components/SettingsShell'
import SettingsContentLoading from '../components/SettingsContentLoading'
import {
  MonoLabel,
  PillButton,
  SaveBar,
  SettingsCard,
  SettingsPageFeedback,
  ToggleRow,
} from '../components/SettingsUi'
import { useSettingsToast } from '../hooks/useSettingsToast'
import { useUnsavedChangesGuard } from '../hooks/useUnsavedChangesGuard'
import {
  useNotificationSettings,
  useResetSettings,
  useUpdateEmailDigest,
  useUpdateNotifications,
  useUpdateQuietHours,
} from '../hooks/useSettings'
import type {
  DigestFrequencyType,
  NotificationSettings,
  NotificationTypeSettings,
  QuietHoursDayType,
} from '../types/settings.types'

const notificationItems = [
  {
    key: 'friendRequests',
    title: 'Friend Requests',
    desc: 'When another learner sends you a connection request.',
  },
  {
    key: 'challenges',
    title: 'Challenge Invites',
    desc: 'When peers invite you to a PvP knowledge duel.',
  },
  {
    key: 'battleResults',
    title: 'Battle Results',
    desc: 'Results from completed battle mode matches.',
  },
  {
    key: 'testCompletion',
    title: 'Test Completion',
    desc: 'When mock tests and assessments are finished.',
  },
  {
    key: 'postLiked',
    title: 'Post Likes',
    desc: 'When someone appreciates your shared tracker post.',
  },
  {
    key: 'postCommented',
    title: 'Post Comments',
    desc: 'Replies and discussions on your community posts.',
  },
  {
    key: 'trackerCloned',
    title: 'Tracker Cloned',
    desc: 'When another learner clones your public tracker.',
  },
  {
    key: 'streakMilestones',
    title: 'Streak Milestones',
    desc: 'Celebrate progress milestones in your learning streak.',
  },
  {
    key: 'studyReminders',
    title: 'Study Reminders',
    desc: 'Scheduled reminders for your learning journey.',
  },
  {
    key: 'adminBroadcasts',
    title: 'Admin Broadcasts',
    desc: 'Important platform announcements.',
  },
  {
    key: 'accountAlerts',
    title: 'Account Alerts',
    desc: 'Important alerts related to your account and access.',
  },
  {
    key: 'subscriptionWarnings',
    title: 'Subscription Warnings',
    desc: 'Billing renewals and plan-related notices.',
  },
  {
    key: 'paymentConfirmations',
    title: 'Payment Confirmations',
    desc: 'Successful payment and invoice notifications.',
  },
  {
    key: 'contributionUpdates',
    title: 'Contribution Updates',
    desc: 'Updates related to community submissions and reviews.',
  },
  {
    key: 'callMissed',
    title: 'Missed Calls',
    desc: 'When you miss a chat voice or video call.',
  },
] as const satisfies ReadonlyArray<{
  key: keyof NotificationTypeSettings
  title: string
  desc: string
}>
const dayOptions: QuietHoursDayType[] = [
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
  'Sun',
]

const buildAllNotificationTypes = (
  enabled: boolean
): NotificationTypeSettings => ({
  friendRequests: enabled,
  challenges: enabled,
  battleResults: enabled,
  testCompletion: enabled,
  postLiked: enabled,
  postCommented: enabled,
  trackerCloned: enabled,
  streakMilestones: enabled,
  studyReminders: enabled,
  adminBroadcasts: enabled,
  accountAlerts: enabled,
  subscriptionWarnings: enabled,
  paymentConfirmations: enabled,
  contributionUpdates: enabled,
  callMissed: enabled,
})

export default function NotificationSettingsPage() {
  const notificationQuery = useNotificationSettings()

  if (notificationQuery.isLoading) {
    return (
      <SettingsShell
        title="Notification Settings"
        subtitle="Choose what you're notified about and how."
      >
        <SettingsContentLoading
          eyebrow="Loading Notifications"
          title="Preparing notification settings"
          description="Fetching your alert preferences, digest options, and quiet-hour rules."
        />
      </SettingsShell>
    )
  }

  if (!notificationQuery.data) {
    return (
      <SettingsShell
        title="Notification Settings"
        subtitle="Choose what you're notified about and how."
      >
        <div className="rounded-[18px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-6 text-[14px] font-semibold text-[#1a1714] dark:border-white/9 dark:bg-[#1e1c19] dark:text-[#f2f0eb]">
          Unable to load notification settings.
        </div>
      </SettingsShell>
    )
  }

  return (
   <NotificationSettingsForm
  key={notificationQuery.dataUpdatedAt}
  initialForm={notificationQuery.data}
/>
  )
}

function NotificationSettingsForm({
  initialForm,
}: {
  initialForm: NotificationSettings
}) {
  const updateNotifications = useUpdateNotifications()
  const updateQuietHours = useUpdateQuietHours()
  const updateEmailDigest = useUpdateEmailDigest()
  const resetSettings = useResetSettings()
  const toast = useSettingsToast()

  const [form, setForm] = useState<NotificationSettings>(initialForm)
  const [savedForm, setSavedForm] = useState(initialForm)

  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(savedForm),
    [form, savedForm]
  )

  const unsavedChangesGuard = useUnsavedChangesGuard({
    when: isDirty,
    onDiscard: () => setForm(savedForm),
  })

  const masterLabel = form.globalEnabled
    ? 'All Enabled'
    : 'All Disabled'

  const quietDayList = useMemo(
    () => form.quietHoursDays ?? [],
    [form.quietHoursDays]
  )

  const handleSave = async () => {
    try {
      toast.showToast('Saving notification settings...', 'loading')

      await updateNotifications.mutateAsync({
        globalEnabled: form.globalEnabled,
        globalEmail: form.globalEmail,
        globalPush: form.globalPush,
        marketing: form.marketing,
        weeklyReport: form.weeklyReport,
        types: form.types,
      })

      await updateEmailDigest.mutateAsync({
        enabled: form.emailDigest.enabled,
        frequency: form.emailDigest.frequency,
        includeActivity: form.emailDigest.includeActivity,
        includeRecommendations:
          form.emailDigest.includeRecommendations,
      })

      await updateQuietHours.mutateAsync({
  quietHoursEnabled: form.quietHoursEnabled,
  quietHoursStart: form.quietHoursStart,
  quietHoursEnd: form.quietHoursEnd,
  quietHoursDays: form.quietHoursDays,
})

      setSavedForm(form)

      toast.showToast('Notification settings saved.', 'success')
      return true
    } catch {
      toast.showToast('Unable to save notification settings.', 'error')
      return false
    }
  }

  const handleReset = async () => {
    try {
      await resetSettings.mutateAsync()
      toast.showToast('Settings reset to defaults.', 'success')
    } catch {
      toast.showToast('Unable to reset settings.', 'error')
    }
  }

  const toggleNotificationType = (
    key: keyof NotificationTypeSettings,
    value: boolean
  ) => {
    setForm((current) => ({
      ...current,
      types: {
        ...current.types,
        [key]: value,
      },
    }))
  }

  const toggleAllNotifications = (enabled: boolean) => {
    setForm((current) => ({
      ...current,
      globalEnabled: enabled,
      types: buildAllNotificationTypes(enabled),
    }))
  }

  const toggleDay = (day: QuietHoursDayType) => {
    setForm((current) => {
      const currentDays = current.quietHoursDays ?? []

      const nextDays = currentDays.includes(day)
        ? currentDays.filter((item) => item !== day)
        : [...currentDays, day]

      return {
        ...current,
        quietHoursDays: nextDays,
      }
    })
  }

  return (
    <SettingsShell
      title="Notification Settings"
      subtitle="Choose what you're notified about and how."
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <SettingsCard
            title="Master Controls"
            description="Globally pause or enable all alert types."
            icon="🔔"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[15px] bg-[#f9f3ef] p-4 dark:bg-[#1a1816]">
              <div>
                <MonoLabel>Global Notification State</MonoLabel>

                <div className="text-[18px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">
                  {masterLabel}
                </div>
              </div>

              <PillButton
                active={form.globalEnabled}
                onClick={() =>
                  toggleAllNotifications(!form.globalEnabled)
                }
              >
                {form.globalEnabled ? 'Enabled' : 'Disabled'}
              </PillButton>
            </div>

            <ToggleRow
              title="Email Notifications"
              description="Receive notification emails for selected categories."
              checked={form.globalEmail}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  globalEmail: value,
                }))
              }
            />

            <ToggleRow
              title="In-App Notifications"
              description="Receive alerts inside the Imminiq interface."
              checked={form.globalPush}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  globalPush: value,
                }))
              }
            />

            <ToggleRow
              title="Marketing Emails"
              description="Receive product updates, launches and promotional emails."
              checked={form.marketing}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  marketing: value,
                }))
              }
            />

            <ToggleRow
              title="Weekly Progress Report"
              description="Receive a weekly learning summary from Imminiq."
              checked={form.weeklyReport}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  weeklyReport: value,
                }))
              }
            />
          </SettingsCard>

          <SettingsCard
            title="Notification Categories"
            description="Choose exactly which events deserve your attention."
            icon="🧾"
          >
            {notificationItems.map((item) => (
              <ToggleRow
                key={item.key}
                title={item.title}
                description={item.desc}
                checked={form.types[item.key]}
                onChange={(value) =>
                  toggleNotificationType(item.key, value)
                }
              />
            ))}

            <div className="mt-2 rounded-[14px] border border-[rgba(59,108,183,0.20)] bg-[rgba(59,108,183,0.08)] px-4 py-3 text-[12.5px] text-[#3b6cb7] dark:text-[#6b9fe8]">
              Critical security alerts may still be delivered when required.
            </div>
          </SettingsCard>

          <SettingsCard
            title="Email Digest"
            description="Receive a scholarly summary of your progress and network activity."
            icon="✉️"
          >
            <div className="flex flex-wrap gap-2">
              {(['daily', 'weekly', 'never'] as DigestFrequencyType[]).map(
                (frequency) => (
                  <PillButton
                    key={frequency}
                    active={form.emailDigest.frequency === frequency}
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        emailDigest: {
                          ...current.emailDigest,
                          enabled: frequency !== 'never',
                          frequency,
                        },
                      }))
                    }
                  >
                    {frequency === 'daily'
                      ? 'Daily Summary'
                      : frequency === 'weekly'
                        ? 'Weekly Digest'
                        : 'Never'}
                  </PillButton>
                )
              )}
            </div>

            <div className="mt-4">
              <ToggleRow
                title="Include Activity"
                description="Include profile and community activity in the digest."
                checked={form.emailDigest.includeActivity}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    emailDigest: {
                      ...current.emailDigest,
                      includeActivity: value,
                    },
                  }))
                }
              />

              <ToggleRow
                title="Include Recommendations"
                description="Include suggested trackers and learning recommendations."
                checked={form.emailDigest.includeRecommendations}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    emailDigest: {
                      ...current.emailDigest,
                      includeRecommendations: value,
                    },
                  }))
                }
              />
            </div>
          </SettingsCard>

          <SettingsCard
            title="Quiet Hours"
            description="Mute in-app sounds and notifications during focus sessions."
            icon="🌙"
          >
            <ToggleRow
              title="Enable Quiet Hours"
              description="Reduce interruptions during your preferred study or rest window."
              checked={form.quietHoursEnabled}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  quietHoursEnabled: value,
                }))
              }
            />

            <div
              className={`mt-4 grid gap-4 sm:grid-cols-2 ${
                form.quietHoursEnabled
                  ? ''
                  : 'pointer-events-none opacity-45'
              }`}
            >
              <label className="block">
                <MonoLabel>From</MonoLabel>

                <input
                  type="time"
                  value={form.quietHoursStart}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      quietHoursStart: event.target.value,
                    }))
                  }
                  className="w-full rounded-[11px] border-[1.5px] border-[#e0d0c5] bg-white px-3.5 py-3 text-[13px] text-[#1a1714] outline-none transition focus:border-[#b84c2b] focus:shadow-[0_0_0_3px_rgba(184,76,43,0.18)] dark:border-white/9 dark:bg-[#252320] dark:text-[#f2f0eb] dark:focus:border-[#e8816a]"
                />
              </label>

              <label className="block">
                <MonoLabel>To</MonoLabel>

                <input
                  type="time"
                  value={form.quietHoursEnd}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      quietHoursEnd: event.target.value,
                    }))
                  }
                  className="w-full rounded-[11px] border-[1.5px] border-[#e0d0c5] bg-white px-3.5 py-3 text-[13px] text-[#1a1714] outline-none transition focus:border-[#b84c2b] focus:shadow-[0_0_0_3px_rgba(184,76,43,0.18)] dark:border-white/9 dark:bg-[#252320] dark:text-[#f2f0eb] dark:focus:border-[#e8816a]"
                />
              </label>
            </div>

            <div
              className={`mt-4 ${
                form.quietHoursEnabled
                  ? ''
                  : 'pointer-events-none opacity-45'
              }`}
            >
              <MonoLabel>Quiet Days</MonoLabel>

              <div className="flex flex-wrap gap-2">
                {dayOptions.map((day) => (
                  <PillButton
                    key={day}
                    active={quietDayList.includes(day)}
                    onClick={() => toggleDay(day)}
                  >
                    {day}
                  </PillButton>
                ))}
              </div>
            </div>
          </SettingsCard>

          <SaveBar
            isSaving={
              updateNotifications.isPending ||
              updateEmailDigest.isPending ||
              updateQuietHours.isPending
            }
            isDirty={isDirty}
            onSave={handleSave}
            onReset={handleReset}
          />
        </div>

        <aside className="space-y-5">
          <SettingsCard title="Delivery Summary" icon="📬">
            <div className="space-y-3 text-[13px]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[#6b5f58] dark:text-[#9b9a92]">
                  Master State
                </span>

                <strong className="text-[#1a1714] dark:text-[#f2f0eb]">
                  {form.globalEnabled ? 'Enabled' : 'Disabled'}
                </strong>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-[#6b5f58] dark:text-[#9b9a92]">
                  Email Channel
                </span>

                <strong className="text-[#1a1714] dark:text-[#f2f0eb]">
                  {form.globalEmail ? 'On' : 'Off'}
                </strong>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-[#6b5f58] dark:text-[#9b9a92]">
                  In-App Channel
                </span>

                <strong className="text-[#1a1714] dark:text-[#f2f0eb]">
                  {form.globalPush ? 'On' : 'Off'}
                </strong>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-[#6b5f58] dark:text-[#9b9a92]">
                  Digest
                </span>

                <strong className="capitalize text-[#1a1714] dark:text-[#f2f0eb]">
                  {form.emailDigest.frequency}
                </strong>
              </div>
            </div>
          </SettingsCard>

          <SettingsCard title="Quiet Window" icon="🌘">
            <div className="space-y-3 text-[13px]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[#6b5f58] dark:text-[#9b9a92]">
                  Status
                </span>

                <strong className="text-[#1a1714] dark:text-[#f2f0eb]">
                  {form.quietHoursEnabled ? 'Active' : 'Inactive'}
                </strong>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-[#6b5f58] dark:text-[#9b9a92]">
                  From
                </span>

                <strong className="text-[#1a1714] dark:text-[#f2f0eb]">
                  {form.quietHoursStart || '--:--'}
                </strong>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-[#6b5f58] dark:text-[#9b9a92]">
                  To
                </span>

                <strong className="text-[#1a1714] dark:text-[#f2f0eb]">
                  {form.quietHoursEnd || '--:--'}
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
        onSaveChanges={() =>
          void unsavedChangesGuard.saveChangesAndLeave(handleSave)
        }
        toast={toast}
      />
    </SettingsShell>
  )
}