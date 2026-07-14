import { useState, type FormEvent, type ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';
import {
  AdminError,
  AdminLoading,
  AdminNumberInput,
  AdminPageHeader,
  AdminPanel,
} from '../../shared';
import { getUserFacingError } from '../../../../lib/user-facing-error';
import { useAdminSettings } from '../hooks/useAdminSettings';
import { useUpdateAdminSettings } from '../hooks/useUpdateAdminSettings';
import type { AdminSettings } from '../types/admin-settings.types';
export default function AdminSettingsPage() {
  const { data, isLoading, isError, error } = useAdminSettings();
  return (
    <main className="mx-auto max-w-225 px-5 py-8 sm:px-8">
      <AdminPageHeader
        title="Console Settings"
        description="Global operational controls for the Imminiq administration environment."
      />
      {isLoading ? (
        <AdminLoading />
      ) : isError || !data ? (
        <AdminError error={error} />
      ) : (
        <SettingsForm key={data.updatedAt} initial={data} />
      )}
    </main>
  );
}
function SettingsForm({ initial }: { initial: AdminSettings }) {
  const update = useUpdateAdminSettings();
  const [form, setForm] = useState({
    allowBroadcasts: initial.allowBroadcasts,
    supportEmail: initial.supportEmail,
    auditRetentionDays: initial.auditRetentionDays,
    productPolicy: initial.productPolicy,
  });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    update.mutate(form);
  };
  return (
    <AdminPanel title="Platform controls">
      <form onSubmit={submit} className="space-y-6 p-6">
        <Toggle
          label="Allow broadcasts"
          description="Permit admins to send new user notifications from Broadcast Centre."
          checked={form.allowBroadcasts}
          setChecked={(value) => setForm((x) => ({ ...x, allowBroadcasts: value }))}
        />
        <label className="admin-field">
          <span>Support email</span>
          <input
            required
            type="email"
            value={form.supportEmail}
            onChange={(e) => setForm((x) => ({ ...x, supportEmail: e.target.value }))}
          />
        </label>
        <PolicySection title="Activity and goals">
          <PolicyNumberField
            label="Weekly XP target"
            value={form.productPolicy.activity.weeklyXpTarget}
            min={1}
            max={1_000_000}
            onChange={(value) =>
              setForm((x) => ({
                ...x,
                productPolicy: {
                  ...x.productPolicy,
                  activity: { ...x.productPolicy.activity, weeklyXpTarget: value },
                },
              }))
            }
          />
          <PolicyNumberField
            label="Daily goal reward XP"
            value={form.productPolicy.activity.dailyGoalRewardXp}
            min={0}
            max={100_000}
            onChange={(value) =>
              setForm((x) => ({
                ...x,
                productPolicy: {
                  ...x.productPolicy,
                  activity: { ...x.productPolicy.activity, dailyGoalRewardXp: value },
                },
              }))
            }
          />
        </PolicySection>

        <PolicySection title="Community verification">
          <PolicyNumberField
            label="Default required votes"
            value={form.productPolicy.community.verificationRequiredVotes}
            min={1}
            max={50}
            onChange={(value) =>
              setForm((x) => ({
                ...x,
                productPolicy: {
                  ...x.productPolicy,
                  community: { ...x.productPolicy.community, verificationRequiredVotes: value },
                },
              }))
            }
          />
          <PolicyNumberField
            label="Default duration (hours)"
            value={form.productPolicy.community.verificationDurationHours}
            min={1}
            max={168}
            onChange={(value) =>
              setForm((x) => ({
                ...x,
                productPolicy: {
                  ...x.productPolicy,
                  community: { ...x.productPolicy.community, verificationDurationHours: value },
                },
              }))
            }
          />
          <PolicyNumberField
            label="Vote XP"
            value={form.productPolicy.community.voteTeacherXp}
            min={0}
            max={100_000}
            onChange={(value) =>
              setForm((x) => ({
                ...x,
                productPolicy: {
                  ...x.productPolicy,
                  community: { ...x.productPolicy.community, voteTeacherXp: value },
                },
              }))
            }
          />
          <PolicyNumberField
            label="Majority reward XP"
            value={form.productPolicy.community.majorityTeacherXp}
            min={0}
            max={100_000}
            onChange={(value) =>
              setForm((x) => ({
                ...x,
                productPolicy: {
                  ...x.productPolicy,
                  community: { ...x.productPolicy.community, majorityTeacherXp: value },
                },
              }))
            }
          />
          <PolicyNumberField
            label="Majority reward coins"
            value={form.productPolicy.community.reviewRewardCoins}
            min={0}
            max={100_000}
            onChange={(value) =>
              setForm((x) => ({
                ...x,
                productPolicy: {
                  ...x.productPolicy,
                  community: { ...x.productPolicy.community, reviewRewardCoins: value },
                },
              }))
            }
          />
        </PolicySection>

        <PolicySection title="Leaderboard">
          <PolicyNumberField
            label="Target rank"
            value={form.productPolicy.leaderboard.targetRank}
            min={1}
            max={10_000}
            onChange={(value) =>
              setForm((x) => ({
                ...x,
                productPolicy: {
                  ...x.productPolicy,
                  leaderboard: { ...x.productPolicy.leaderboard, targetRank: value },
                },
              }))
            }
          />
          <PolicyNumberField
            label="Weekly tier XP"
            value={form.productPolicy.leaderboard.weeklyTierXp}
            min={1}
            max={1_000_000}
            onChange={(value) =>
              setForm((x) => ({
                ...x,
                productPolicy: {
                  ...x.productPolicy,
                  leaderboard: { ...x.productPolicy.leaderboard, weeklyTierXp: value },
                },
              }))
            }
          />
          <PolicyNumberField
            label="Student reward coins"
            value={form.productPolicy.leaderboard.studentRewardCoins}
            min={0}
            max={1_000_000}
            onChange={(value) =>
              setForm((x) => ({
                ...x,
                productPolicy: {
                  ...x.productPolicy,
                  leaderboard: { ...x.productPolicy.leaderboard, studentRewardCoins: value },
                },
              }))
            }
          />
          <PolicyNumberField
            label="Trainer reward coins"
            value={form.productPolicy.leaderboard.trainerRewardCoins}
            min={0}
            max={1_000_000}
            onChange={(value) =>
              setForm((x) => ({
                ...x,
                productPolicy: {
                  ...x.productPolicy,
                  leaderboard: { ...x.productPolicy.leaderboard, trainerRewardCoins: value },
                },
              }))
            }
          />
          <PolicyTextField
            label="Student badge"
            value={form.productPolicy.leaderboard.studentBadgeName}
            onChange={(value) =>
              setForm((x) => ({
                ...x,
                productPolicy: {
                  ...x.productPolicy,
                  leaderboard: { ...x.productPolicy.leaderboard, studentBadgeName: value },
                },
              }))
            }
          />
          <PolicyTextField
            label="Trainer badge"
            value={form.productPolicy.leaderboard.trainerBadgeName}
            onChange={(value) =>
              setForm((x) => ({
                ...x,
                productPolicy: {
                  ...x.productPolicy,
                  leaderboard: { ...x.productPolicy.leaderboard, trainerBadgeName: value },
                },
              }))
            }
          />
        </PolicySection>

        <PolicySection title="Learning and tests">
          <PolicyNumberField
            label="Maximum manual test questions"
            value={form.productPolicy.mockTests.maxManualQuestions}
            min={1}
            max={500}
            onChange={(value) =>
              setForm((x) => ({
                ...x,
                productPolicy: {
                  ...x.productPolicy,
                  mockTests: { ...x.productPolicy.mockTests, maxManualQuestions: value },
                },
              }))
            }
          />
          <PolicyNumberField
            label="Default test duration (minutes)"
            value={form.productPolicy.mockTests.defaultTimeLimitMinutes}
            min={1}
            max={480}
            onChange={(value) =>
              setForm((x) => ({
                ...x,
                productPolicy: {
                  ...x.productPolicy,
                  mockTests: { ...x.productPolicy.mockTests, defaultTimeLimitMinutes: value },
                },
              }))
            }
          />
          <PolicyNumberField
            label="Default passing score (%)"
            value={form.productPolicy.mockTests.defaultPassingScore}
            min={1}
            max={100}
            onChange={(value) =>
              setForm((x) => ({
                ...x,
                productPolicy: {
                  ...x.productPolicy,
                  mockTests: { ...x.productPolicy.mockTests, defaultPassingScore: value },
                },
              }))
            }
          />
          <PolicyNumberField
            label="Mock-test completion XP"
            value={form.productPolicy.mockTests.completionXp}
            min={0}
            max={100_000}
            onChange={(value) =>
              setForm((x) => ({
                ...x,
                productPolicy: {
                  ...x.productPolicy,
                  mockTests: { ...x.productPolicy.mockTests, completionXp: value },
                },
              }))
            }
          />
          <PolicyNumberField
            label="Subtopic completion XP"
            value={form.productPolicy.trackers.subtopicCompletionXp}
            min={0}
            max={100_000}
            onChange={(value) =>
              setForm((x) => ({
                ...x,
                productPolicy: {
                  ...x.productPolicy,
                  trackers: { ...x.productPolicy.trackers, subtopicCompletionXp: value },
                },
              }))
            }
          />
          <PolicyNumberField
            label="Topic completion XP"
            value={form.productPolicy.trackers.topicCompletionXp}
            min={0}
            max={100_000}
            onChange={(value) =>
              setForm((x) => ({
                ...x,
                productPolicy: {
                  ...x.productPolicy,
                  trackers: { ...x.productPolicy.trackers, topicCompletionXp: value },
                },
              }))
            }
          />
          <PolicyNumberField
            label="Tracker completion XP"
            value={form.productPolicy.trackers.trackerCompletionXp}
            min={0}
            max={100_000}
            onChange={(value) =>
              setForm((x) => ({
                ...x,
                productPolicy: {
                  ...x.productPolicy,
                  trackers: { ...x.productPolicy.trackers, trackerCompletionXp: value },
                },
              }))
            }
          />
        </PolicySection>

        <PolicySection title="Account lifecycle">
          <PolicyNumberField
            label="Deletion recovery window (days)"
            value={form.productPolicy.security.accountDeletionRecoveryDays}
            min={1}
            max={365}
            onChange={(value) =>
              setForm((x) => ({
                ...x,
                productPolicy: {
                  ...x.productPolicy,
                  security: { ...x.productPolicy.security, accountDeletionRecoveryDays: value },
                },
              }))
            }
          />
        </PolicySection>
        <label className="admin-field">
          <span>Audit retention (days)</span>
          <AdminNumberInput
            required
            min={30}
            max={3650}
            value={form.auditRetentionDays}
            onValueChange={(auditRetentionDays) =>
              setForm((x) => ({
                ...x,
                auditRetentionDays,
              }))
            }
          />
        </label>
        {update.isSuccess && (
          <p className="text-sm text-[#52c58c]">Settings saved and added to the audit log.</p>
        )}
        {update.isError && (
          <p className="text-sm text-[#e26767]">
            {getUserFacingError(update.error, 'Settings could not be saved.')}
          </p>
        )}
        <button disabled={update.isPending} className="admin-primary-button">
          {update.isPending ? (
            <>
              <LoaderCircle size={15} className="animate-spin" /> Saving…
            </>
          ) : (
            'Save settings'
          )}
        </button>
      </form>
    </AdminPanel>
  );
}

function PolicySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4 rounded-xl border border-white/10 bg-[#24211e] p-5">
      <h3 className="font-semibold">{title}</h3>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function PolicyNumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      <AdminNumberInput required min={min} max={max} value={value} onValueChange={onChange} />
    </label>
  );
}

function PolicyTextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      <input
        required
        minLength={1}
        maxLength={80}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
function Toggle({
  label,
  description,
  checked,
  setChecked,
}: {
  label: string;
  description: string;
  checked: boolean;
  setChecked: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-5 rounded-xl border border-white/10 bg-[#24211e] p-5">
      <span>
        <span className="block font-semibold">{label}</span>
        <span className="mt-1 block text-xs text-[#aaa59d]">{description}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
        className="h-5 w-5 accent-[#e8816a]"
      />
    </label>
  );
}
