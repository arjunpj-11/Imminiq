import { useEffect, useMemo, useRef, useState } from 'react'
import SettingsShell from '../components/SettingsShell'
import SettingsContentLoading from '../components/SettingsContentLoading'
import {
  MonoLabel,
  PillButton,
  SaveBar,
  SelectField,
  SettingsCard,
  SettingsPageFeedback,
  ToggleRow,
} from '../components/SettingsUi'
import { useSettingsToast } from '../hooks/useSettingsToast'
import { useUnsavedChangesGuard } from '../hooks/useUnsavedChangesGuard'
import {
  useResetSettings,
  useSettings,
  useUpdateAIBehaviour,
  useUpdateAppearance,
  useUpdateCodeEditor,
  useUpdateCompiler,
  useUpdateGestures,
  useUpdateLearningJourney,
} from '../hooks/useSettings'
import type { IUserSettings } from '../types/settings.types'
import { useThemeStore } from '../../../store/useThemeStore'

type GestureToggleKey =
  | 'backGesture'
  | 'zoomGesture'
  | 'annotateGesture'
  | 'scrollGesture'

const gestureToggleItems: Array<{
  key: GestureToggleKey
  icon: string
  label: string
}> = [
  {
    key: 'backGesture',
    icon: '👈',
    label: 'Back',
  },
  {
    key: 'zoomGesture',
    icon: '🤏',
    label: 'Zoom',
  },
  {
    key: 'annotateGesture',
    icon: '✍️',
    label: 'Annotate',
  },
  {
    key: 'scrollGesture',
    icon: '🖐️',
    label: 'Scroll',
  },
]

export default function PreferencesSettingsPage() {
  const settingsQuery = useSettings()

  if (settingsQuery.isLoading) {
    return (
      <SettingsShell
        title="Preferences"
        subtitle="Customise the way Imminiq looks, behaves and supports your learning flow."
      >
        <SettingsContentLoading
          eyebrow="Loading Preferences"
          title="Preparing your preferences"
          description="Fetching your appearance, compiler, editor, and learning-flow settings."
        />
      </SettingsShell>
    )
  }

  if (!settingsQuery.data) {
    return (
      <SettingsShell
        title="Preferences"
        subtitle="Customise the way Imminiq looks, behaves and supports your learning flow."
      >
        <div className="rounded-lg border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-6 text-[14px] font-semibold text-(--text-primary) dark:border-(--border-subtle) dark:bg-(--surface-card) dark:text-(--text-primary)">
          Unable to load preferences.
        </div>
      </SettingsShell>
    )
  }

  return (
    <PreferencesSettingsForm
      key={settingsQuery.dataUpdatedAt}
      initialForm={settingsQuery.data}
    />
  )
}

function PreferencesSettingsForm({
  initialForm,
}: {
  initialForm: IUserSettings
}) {
  const updateAppearance = useUpdateAppearance()
  const updateGestures = useUpdateGestures()
  const updateCompiler = useUpdateCompiler()
  const updateCodeEditor = useUpdateCodeEditor()
  const updateAIBehaviour = useUpdateAIBehaviour()
  const updateLearningJourney = useUpdateLearningJourney()
  const resetSettings = useResetSettings()
  const toast = useSettingsToast()

  const themeMode = useThemeStore((state) => state.mode)
  const setThemeMode = useThemeStore((state) => state.setMode)

  const previewThemeMode = useThemeStore(
    (state) => state.previewThemeMode
  )

  const clearThemePreview = useThemeStore(
    (state) => state.clearThemePreview
  )

  const initialFormWithLocalTheme = useMemo<IUserSettings>(
    () => ({
      ...initialForm,
      appearance: {
        ...initialForm.appearance,
        theme: themeMode,
      },
    }),
    [initialForm, themeMode]
  )

  const [form, setForm] = useState<IUserSettings>(
    initialFormWithLocalTheme
  )

  const [savedForm, setSavedForm] = useState<IUserSettings>(
    initialFormWithLocalTheme
  )

  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(savedForm),
    [form, savedForm]
  )

  const unsavedChangesGuard = useUnsavedChangesGuard({
    when: isDirty,
    onDiscard: () => {
      setForm(savedForm)
      clearThemePreview()
    },
  })

  const skipThemeRestoreOnUnmountRef = useRef(false)

  useEffect(() => {
    return () => {
      if (!skipThemeRestoreOnUnmountRef.current) {
        clearThemePreview()
      }
    }
  }, [clearThemePreview])

  const handleSave = async () => {
    const previouslySavedTheme = useThemeStore.getState().mode
    const selectedTheme = form.appearance.theme

    try {
      toast.showToast('Saving preferences...', 'loading')

      skipThemeRestoreOnUnmountRef.current = true

      setThemeMode(selectedTheme)

      await updateAppearance.mutateAsync(form.appearance)
      await updateGestures.mutateAsync(form.gestures)
      await updateCompiler.mutateAsync(form.compiler)
      await updateCodeEditor.mutateAsync(form.codeEditor)
      await updateAIBehaviour.mutateAsync(form.aiBehaviour)
      await updateLearningJourney.mutateAsync(form.learningJourney)

      setSavedForm({
        ...form,
        appearance: {
          ...form.appearance,
          theme: selectedTheme,
        },
      })

      skipThemeRestoreOnUnmountRef.current = false

      toast.showToast('Preferences saved.', 'success')
      return true
    } catch {
      skipThemeRestoreOnUnmountRef.current = false
      setThemeMode(previouslySavedTheme)

      toast.showToast('Unable to save preferences.', 'error')
      return false
    }
  }

  const handleReset = async () => {
    try {
      clearThemePreview()
      await resetSettings.mutateAsync()
      toast.showToast('Settings reset to defaults.', 'success')
    } catch {
      toast.showToast('Unable to reset preferences.', 'error')
    }
  }

  return (
    <SettingsShell
      title="Preferences"
      subtitle="Customise the way Imminiq looks, behaves and supports your learning flow."
    >
      <div className="space-y-5">
        {/* ─── APPEARANCE ─────────────────────────────── */}
        <SettingsCard
          title="Appearance"
          description="Customise how your archive looks and feels across devices."
          icon="🎨"
        >
          <MonoLabel>Theme Selector</MonoLabel>

          <div className="flex flex-wrap gap-2">
            {(['light', 'dark', 'system'] as const).map((theme) => (
              <PillButton
                key={theme}
                active={form.appearance.theme === theme}
                onClick={() => {
                  setForm((current) => ({
                    ...current,
                    appearance: {
                      ...current.appearance,
                      theme,
                    },
                  }))

                  previewThemeMode(theme)
                }}
              >
                {theme[0].toUpperCase() + theme.slice(1)}
              </PillButton>
            ))}
          </div>
        </SettingsCard>

        {/* ─── GESTURES — COMING SOON ─────────────────────────────── */}
        <div className="relative overflow-hidden rounded-lg">
          <div className="pointer-events-none select-none blur-[3px] opacity-65">
            <SettingsCard
              title="Gesture Controls"
              description="Navigate your archive with hand gestures via your camera."
              icon="🖐"
            >
              <ToggleRow
                title="Enable Gesture Controls"
                description="Turn on webcam-based gesture navigation."
                checked={form.gestures.enabled}
                onChange={() => undefined}
              />

              <div className="mt-4">
                <MonoLabel>
                  Sensitivity · {form.gestures.sensitivity}%
                </MonoLabel>

                <input
                  type="range"
                  min={0}
                  max={100}
                  value={form.gestures.sensitivity}
                  readOnly
                  className="w-full accent-(--brand-500) dark:accent-(--brand-500)"
                />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {gestureToggleItems.map((item) => {
                  const active = form.gestures[item.key]

                  return (
                    <button
                      type="button"
                      key={item.key}
                      tabIndex={-1}
                      className={`rounded-2xl border-[1.5px] p-4 text-center transition ${
                        active
                          ? 'border-[rgba(184,76,43,0.26)] bg-[rgba(184,76,43,0.10)] dark:border-[rgba(232,129,106,0.28)] dark:bg-[rgba(232,129,106,0.12)]'
                          : 'border-(--border-subtle) dark:border-(--border-subtle)'
                      }`}
                    >
                      <div className="text-[24px]">{item.icon}</div>

                      <div className="mt-2 text-[13px] font-semibold text-(--text-primary) dark:text-(--text-primary)">
                        {item.label}
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="mt-5">
                <ToggleRow
                  title="Swipe to Next"
                  checked={form.gestures.swipeToNext}
                  onChange={() => undefined}
                />

                <ToggleRow
                  title="Swipe to Previous"
                  checked={form.gestures.swipeToPrevious}
                  onChange={() => undefined}
                />

                <ToggleRow
                  title="Pinch to Zoom"
                  checked={form.gestures.pinchToZoom}
                  onChange={() => undefined}
                />
              </div>
            </SettingsCard>
          </div>

          <div className="absolute inset-0 z-10 flex items-center justify-center bg-(--surface-card)/55 px-4 backdrop-blur-[2px] dark:bg-(--surface-canvas)/60">
            <div className="w-full max-w-107.5 rounded-xl border-[1.5px] border-[rgba(184,76,43,0.24)] bg-(--surface-card)/95 p-6 text-center shadow-[0_18px_60px_rgba(26,23,20,0.14)] dark:border-[rgba(232,129,106,0.25)] dark:bg-(--surface-card)/95 dark:shadow-[0_22px_70px_rgba(0,0,0,0.40)]">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-[rgba(184,76,43,0.10)] text-[28px] dark:bg-[rgba(232,129,106,0.12)]">
                🖐
              </div>

              <p className="mt-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-(--brand-500) dark:text-(--brand-500)">
                Coming Soon
              </p>

              <h3 className="mt-2 font-ui text-[24px] font-extrabold text-(--text-primary) dark:text-(--text-primary)">
                Hand Gesture Scrolling
              </h3>

              <p className="mt-3 text-[13px] leading-[1.7] text-(--text-secondary) dark:text-(--text-secondary)">
                Gesture-based scrolling and navigation are planned for a future
                Imminiq update. This feature will become available in a later
                release.
              </p>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[rgba(184,76,43,0.18)] bg-[rgba(184,76,43,0.08)] px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-(--brand-500) dark:border-[rgba(232,129,106,0.18)] dark:bg-[rgba(232,129,106,0.10)] dark:text-(--brand-500)">
                Experimental Feature
              </div>
            </div>
          </div>
        </div>

        {/* ─── COMPILER ─────────────────────────────── */}
        <SettingsCard
          title="Compiler Preferences"
          description="Configure your default coding environment and runtime."
          icon="⌨️"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <SelectField
              label="Default Language"
              value={form.compiler.defaultLanguage}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  compiler: {
                    ...current.compiler,
                    defaultLanguage: value,
                  },
                }))
              }
              options={[
                { label: 'JavaScript', value: 'javascript' },
                { label: 'Python', value: 'python' },
                { label: 'TypeScript', value: 'typescript' },
                { label: 'Rust', value: 'rust' },
                { label: 'Go', value: 'go' },
                { label: 'Java', value: 'java' },
              ]}
            />

            <SelectField
              label="Runtime Environment"
              value={form.compiler.defaultRuntime}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  compiler: {
                    ...current.compiler,
                    defaultRuntime: value,
                  },
                }))
              }
              options={[
                { label: 'Node.js 20', value: 'node20' },
                { label: 'Node.js 18', value: 'node18' },
                { label: 'Deno 1.x', value: 'deno1' },
                { label: 'Bun', value: 'bun' },
              ]}
            />
          </div>

          <div className="mt-4">
            <ToggleRow
              title="Auto-switch Compiler by Lesson"
              description="Automatically select the most suitable compiler for the current lesson."
              checked={form.compiler.autoSwitchLanguage}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  compiler: {
                    ...current.compiler,
                    autoSwitchLanguage: value,
                  },
                }))
              }
            />
          </div>
        </SettingsCard>

        {/* ─── CODE EDITOR ─────────────────────────────── */}
        <SettingsCard
          title="Code Editor"
          description="Personalise your coding environment's look and feel."
          icon="<>"
        >
          <MonoLabel>Editor Theme</MonoLabel>

          <div className="mb-5 flex flex-wrap gap-2">
            {['vs-dark', 'oxford-light', 'monokai-rust'].map((theme) => (
              <PillButton
                key={theme}
                active={form.codeEditor.theme === theme}
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    codeEditor: {
                      ...current.codeEditor,
                      theme,
                    },
                  }))
                }
              >
                {theme}
              </PillButton>
            ))}
          </div>

          <div className="mb-5 overflow-hidden rounded-2xl bg-[#1a1714] p-4 font-mono text-[12px] leading-[1.8] text-[#f2f0eb]">
            <div>1&nbsp;&nbsp;class Polymath {'{'}</div>
            <div>2&nbsp;&nbsp;&nbsp;&nbsp;constructor(subject) {'{'}</div>
            <div>
              3&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// initialise deep learning
            </div>
            <div>4&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;this.focus = subject;</div>
            <div>5&nbsp;&nbsp;&nbsp;&nbsp;{'}'}</div>
            <div>6&nbsp;&nbsp;{'}'}</div>
          </div>

          <ToggleRow
            title="Auto Indent"
            checked={form.codeEditor.autoIndent}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                codeEditor: {
                  ...current.codeEditor,
                  autoIndent: value,
                },
              }))
            }
          />

          <ToggleRow
            title="Line Numbers"
            checked={form.codeEditor.lineNumbers}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                codeEditor: {
                  ...current.codeEditor,
                  lineNumbers: value,
                },
              }))
            }
          />

          <ToggleRow
            title="Word Wrap"
            checked={form.codeEditor.wordWrap}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                codeEditor: {
                  ...current.codeEditor,
                  wordWrap: value,
                },
              }))
            }
          />

          <ToggleRow
            title="Minimap"
            checked={form.codeEditor.minimap}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                codeEditor: {
                  ...current.codeEditor,
                  minimap: value,
                },
              }))
            }
          />
        </SettingsCard>

        {/* ─── AI BEHAVIOUR ─────────────────────────────── */}
        <SettingsCard
          title="AI Behaviour"
          description="Control how your AI study companion responds."
          icon="🧠"
        >
          <MonoLabel>Response Style</MonoLabel>

          <div className="mb-4 flex flex-wrap gap-2">
            {(['concise', 'detailed', 'eli5'] as const).map((style) => (
              <PillButton
                key={style}
                active={form.aiBehaviour.responseStyle === style}
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    aiBehaviour: {
                      ...current.aiBehaviour,
                      responseStyle: style,
                    },
                  }))
                }
              >
                {style === 'eli5'
                  ? 'ELI5'
                  : style[0].toUpperCase() + style.slice(1)}
              </PillButton>
            ))}
          </div>

          <ToggleRow
            title="Auto-generate Lessons"
            checked={form.aiBehaviour.autoGenerateLessons}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                aiBehaviour: {
                  ...current.aiBehaviour,
                  autoGenerateLessons: value,
                },
              }))
            }
          />

          <ToggleRow
            title="Show AI Insights"
            checked={form.aiBehaviour.showAIInsights}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                aiBehaviour: {
                  ...current.aiBehaviour,
                  showAIInsights: value,
                },
              }))
            }
          />

          <ToggleRow
            title="Daily Quota Alert"
            checked={form.aiBehaviour.dailyQuotaAlert}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                aiBehaviour: {
                  ...current.aiBehaviour,
                  dailyQuotaAlert: value,
                },
              }))
            }
          />
        </SettingsCard>

        {/* ─── LEARNING JOURNEY ─────────────────────────────── */}
        <SettingsCard
          title="Learning Journey"
          description="Shape the pace of your scholarly path."
          icon="📚"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <SelectField
              label="Daily Commitment"
              value={String(form.learningJourney.dailyGoalMinutes)}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  learningJourney: {
                    ...current.learningJourney,
                    dailyGoalMinutes: Number(value),
                  },
                }))
              }
              options={[
                { label: '30 min — Light', value: '30' },
                { label: '1 hour — Moderate', value: '60' },
                { label: '2 hours — Intensive', value: '120' },
                { label: '3+ hours — Scholar', value: '180' },
              ]}
            />

            <SelectField
              label="Reminder Time"
              value={form.learningJourney.reminderTime}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  learningJourney: {
                    ...current.learningJourney,
                    reminderTime: value,
                  },
                }))
              }
              options={[
                { label: 'Daily at 07:00 AM', value: '07:00' },
                { label: 'Daily at 08:00 AM', value: '08:00' },
                { label: 'Daily at 09:00 AM', value: '09:00' },
                { label: 'Daily at 06:00 PM', value: '18:00' },
                { label: 'Daily at 08:00 PM', value: '20:00' },
              ]}
            />
          </div>

          <div className="mt-4">
            <ToggleRow
              title="Study Reminder Enabled"
              checked={form.learningJourney.reminderEnabled}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  learningJourney: {
                    ...current.learningJourney,
                    reminderEnabled: value,
                  },
                }))
              }
            />

            <ToggleRow
              title="Auto-play Next Topic"
              checked={form.learningJourney.autoPlayNextTopic}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  learningJourney: {
                    ...current.learningJourney,
                    autoPlayNextTopic: value,
                  },
                }))
              }
            />

            <ToggleRow
              title="Show Estimated Time"
              checked={form.learningJourney.showEstimatedTime}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  learningJourney: {
                    ...current.learningJourney,
                    showEstimatedTime: value,
                  },
                }))
              }
            />
          </div>
        </SettingsCard>

        <SaveBar
          isSaving={
            updateAppearance.isPending ||
            updateGestures.isPending ||
            updateCompiler.isPending ||
            updateCodeEditor.isPending ||
            updateAIBehaviour.isPending ||
            updateLearningJourney.isPending
          }
          isDirty={isDirty}
          onSave={handleSave}
          onReset={handleReset}
        />
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