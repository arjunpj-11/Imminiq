import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  AlertTriangle,
  CheckCircle2,
  LoaderCircle,
  RotateCcw,
  Save,
} from "lucide-react";
import {
  AdminError,
  AdminLoading,
  AdminNumberInput,
  AdminPageHeader,
  AdminPanel,
} from "../../shared";
import { getUserFacingError } from "../../../../lib/user-facing-error";
import { useAdminSettings } from "../hooks/useAdminSettings";
import { useUpdateAdminSettings } from "../hooks/useUpdateAdminSettings";
import type { AdminSettings } from "../types/admin-settings.types";
import Modal from "../../shared/components/AdminModal";
import AdminActionPasswordField from "../../shared/components/AdminActionPasswordField";
import { isAdminActionPasswordReady } from "../../shared/utils/admin-action-password";
export default function AdminSettingsPage() {
  const { data, isLoading, isError, error, refetch } = useAdminSettings();
  return (
    <main className="mx-auto max-w-225 px-5 py-8 sm:px-8">
      <AdminPageHeader
        title="Console Settings"
        description="Global operational controls for the Imminiq administration environment."
      />
      {isLoading ? (
        <AdminLoading />
      ) : isError || !data ? (
        <AdminError error={error} onRetry={() => void refetch()} />
      ) : (
        <SettingsForm key={data.updatedAt} initial={data} />
      )}
    </main>
  );
}
function SettingsForm({ initial }: { initial: AdminSettings }) {
  const update = useUpdateAdminSettings();
  const initialForm = useMemo(
    () => ({
      allowBroadcasts: initial.allowBroadcasts,
      aiMonthlyTokenBudget: initial.aiMonthlyTokenBudget,
      aiBudgetWarningPercent: initial.aiBudgetWarningPercent,
      productPolicy: initial.productPolicy,
    }),
    [initial],
  );
  const [form, setForm] = useState(initialForm);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [changeReason, setChangeReason] = useState("");
  const [actionPassword, setActionPassword] = useState("");

  const changes = useMemo(
    () => collectSettingChanges(initialForm, form),
    [initialForm, form],
  );
  const isDirty = changes.length > 0;

  useEffect(() => {
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty || update.isPending) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [isDirty, update.isPending]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (isDirty) setReviewOpen(true);
  };

  const applyChanges = () => {
    update.mutate(
      { settings: form, actionPassword, changeReason: changeReason.trim() },
      {
        onSuccess: () => {
          setReviewOpen(false);
          setChangeReason("");
          setActionPassword("");
        },
      },
    );
  };

  const reset = () => {
    setForm(initialForm);
    setChangeReason("");
    setActionPassword("");
  };

  const reviewReady =
    changeReason.trim().length >= 10 &&
    isAdminActionPasswordReady(actionPassword);

  return (
    <>
      <AdminPanel
        title="Platform controls"
        toolbar={
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${
              isDirty
                ? "border-[#f0a842]/30 bg-[#f0a842]/10 text-[#f0a842]"
                : "border-[#52c58c]/25 bg-[#52c58c]/10 text-[#52c58c]"
            }`}
            role="status"
          >
            {isDirty ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
            {isDirty
              ? `${changes.length} unsaved change${changes.length === 1 ? "" : "s"}`
              : "All changes saved"}
          </span>
        }
      >
        <form onSubmit={submit} className="space-y-6 p-4 sm:p-6">
          <Toggle
            label="Allow broadcasts"
            description="Permit admins to send new user notifications from Broadcast Centre."
            checked={form.allowBroadcasts}
            setChecked={(value) =>
              setForm((x) => ({ ...x, allowBroadcasts: value }))
            }
          />
          <PolicySection title="AI usage guardrails">
            <PolicyNumberField
              label="Monthly token budget"
              value={form.aiMonthlyTokenBudget}
              min={1}
              max={10_000_000_000}
              onChange={(aiMonthlyTokenBudget) =>
                setForm((x) => ({ ...x, aiMonthlyTokenBudget }))
              }
            />
            <PolicyNumberField
              label="Budget warning threshold (%)"
              value={form.aiBudgetWarningPercent}
              min={1}
              max={100}
              onChange={(aiBudgetWarningPercent) =>
                setForm((x) => ({ ...x, aiBudgetWarningPercent }))
              }
            />
          </PolicySection>
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
                    activity: {
                      ...x.productPolicy.activity,
                      weeklyXpTarget: value,
                    },
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
                    activity: {
                      ...x.productPolicy.activity,
                      dailyGoalRewardXp: value,
                    },
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
                    community: {
                      ...x.productPolicy.community,
                      verificationRequiredVotes: value,
                    },
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
                    community: {
                      ...x.productPolicy.community,
                      verificationDurationHours: value,
                    },
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
                    community: {
                      ...x.productPolicy.community,
                      voteTeacherXp: value,
                    },
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
                    community: {
                      ...x.productPolicy.community,
                      majorityTeacherXp: value,
                    },
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
                    community: {
                      ...x.productPolicy.community,
                      reviewRewardCoins: value,
                    },
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
                    leaderboard: {
                      ...x.productPolicy.leaderboard,
                      targetRank: value,
                    },
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
                    leaderboard: {
                      ...x.productPolicy.leaderboard,
                      weeklyTierXp: value,
                    },
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
                    leaderboard: {
                      ...x.productPolicy.leaderboard,
                      studentRewardCoins: value,
                    },
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
                    leaderboard: {
                      ...x.productPolicy.leaderboard,
                      trainerRewardCoins: value,
                    },
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
                    leaderboard: {
                      ...x.productPolicy.leaderboard,
                      studentBadgeName: value,
                    },
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
                    leaderboard: {
                      ...x.productPolicy.leaderboard,
                      trainerBadgeName: value,
                    },
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
                    mockTests: {
                      ...x.productPolicy.mockTests,
                      maxManualQuestions: value,
                    },
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
                    mockTests: {
                      ...x.productPolicy.mockTests,
                      defaultTimeLimitMinutes: value,
                    },
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
                    mockTests: {
                      ...x.productPolicy.mockTests,
                      defaultPassingScore: value,
                    },
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
                    mockTests: {
                      ...x.productPolicy.mockTests,
                      completionXp: value,
                    },
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
                    trackers: {
                      ...x.productPolicy.trackers,
                      subtopicCompletionXp: value,
                    },
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
                    trackers: {
                      ...x.productPolicy.trackers,
                      topicCompletionXp: value,
                    },
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
                    trackers: {
                      ...x.productPolicy.trackers,
                      trackerCompletionXp: value,
                    },
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
                    security: {
                      ...x.productPolicy.security,
                      accountDeletionRecoveryDays: value,
                    },
                  },
                }))
              }
            />
          </PolicySection>

          {update.isSuccess && (
            <p
              className="rounded-lg border border-[#52c58c]/25 bg-[#52c58c]/10 p-3 text-sm text-[#52c58c]"
              role="status"
            >
              Settings saved and added to the audit log.
            </p>
          )}
          {update.isError && (
            <p
              className="rounded-lg border border-[#e26767]/25 bg-[#e26767]/10 p-3 text-sm text-[#e26767]"
              role="alert"
            >
              {getUserFacingError(update.error, "Settings could not be saved.")}
            </p>
          )}

          <div className="admin-sticky-action-bar">
            <div>
              <strong className="block text-sm">Global platform policy</strong>
              <span className="text-xs text-[#aaa59d]">
                Review every changed value before applying.
              </span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="admin-button"
                disabled={!isDirty || update.isPending}
                onClick={reset}
              >
                <RotateCcw size={15} /> Reset
              </button>
              <button
                disabled={!isDirty || update.isPending}
                className="admin-primary-button"
              >
                <Save size={15} /> Review changes
              </button>
            </div>
          </div>
        </form>
      </AdminPanel>

      <Modal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        preventClose={update.isPending}
        ariaLabel="Review global setting changes"
        contentClassName="max-w-2xl bg-[#1c1a18] text-[#f2f0eb]"
      >
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#f0a842]/12 text-[#f0a842]">
            <AlertTriangle size={20} />
          </span>
          <div>
            <h2 className="font-editorial text-2xl font-bold">
              Review global changes
            </h2>
            <p className="mt-1 text-sm leading-6 text-[#aaa59d]">
              These values affect the full platform immediately. Confirm the
              scope before saving.
            </p>
          </div>
        </div>

        <div className="admin-table-scroll mt-5 max-h-72 overflow-auto rounded-xl border border-white/10">
          <table className="admin-table w-full min-w-125 text-left text-sm">
            <caption className="sr-only">
              Review of global settings changes
            </caption>
            <thead>
              <tr>
                <th scope="col">Setting</th>
                <th scope="col">Previous</th>
                <th scope="col">New</th>
              </tr>
            </thead>
            <tbody>
              {changes.map((change) => (
                <tr key={change.path}>
                  <td className="font-semibold">{change.label}</td>
                  <td className="text-[#aaa59d]">{String(change.before)}</td>
                  <td className="font-semibold text-[#e8816a]">
                    {String(change.after)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <label className="admin-field mt-5">
          <span>Audit reason</span>
          <textarea
            rows={3}
            minLength={10}
            maxLength={500}
            value={changeReason}
            onChange={(event) => setChangeReason(event.target.value)}
            placeholder="Explain why these platform settings are changing."
          />
        </label>
        <AdminActionPasswordField
        value={actionPassword}
        onChange={setActionPassword}
        className="admin-field mt-4"
      />

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            className="admin-button"
            onClick={() => setReviewOpen(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="admin-primary-button"
            disabled={!reviewReady || update.isPending}
            onClick={applyChanges}
          >
            {update.isPending ? (
              <>
                <LoaderCircle size={15} className="animate-spin" /> Saving…
              </>
            ) : (
              "Apply global changes"
            )}
          </button>
        </div>
      </Modal>
    </>
  );
}

type SettingChange = {
  path: string;
  label: string;
  before: string | number | boolean;
  after: string | number | boolean;
};

function collectSettingChanges(
  before: Omit<AdminSettings, "updatedAt">,
  after: Omit<AdminSettings, "updatedAt">,
): SettingChange[] {
  const output: SettingChange[] = [];
  const walk = (left: unknown, right: unknown, path: string[]) => {
    if (
      left &&
      right &&
      typeof left === "object" &&
      typeof right === "object"
    ) {
      for (const key of Object.keys(right as Record<string, unknown>)) {
        walk(
          (left as Record<string, unknown>)[key],
          (right as Record<string, unknown>)[key],
          [...path, key],
        );
      }
      return;
    }
    if (left !== right) {
      const fullPath = path.join(".");
      output.push({
        path: fullPath,
        label: path.map(humanizeSettingKey).join(" · "),
        before: left as string | number | boolean,
        after: right as string | number | boolean,
      });
    }
  };
  walk(before, after, []);
  return output;
}

function humanizeSettingKey(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (character) => character.toUpperCase());
}

function PolicySection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="admin-policy-section space-y-4 p-5">
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
      <AdminNumberInput
        required
        min={min}
        max={max}
        value={value}
        onValueChange={onChange}
      />
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
    <label className="admin-policy-section flex cursor-pointer items-center justify-between gap-5 p-5">
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
