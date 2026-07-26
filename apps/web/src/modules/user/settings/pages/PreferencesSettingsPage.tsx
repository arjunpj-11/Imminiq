import { useState } from 'react';
import SettingsContentLoading from '../components/SettingsContentLoading';
import { PillButton, SaveBar, SettingsCard, ToggleRow } from '../components/SettingsUi';
import { useAppearanceSettings, useResetSettings, useUpdateAppearance } from '../hooks/useSettings';
import { useSettingsToast } from '../hooks/useSettingsToast';
import { useThemeStore } from '../../../../store/useThemeStore';
import { useAppShellStore } from '../../../../store/useAppShellStore';
import type { ThemeType } from '../types/settings.types';

export default function PreferencesSettingsPage() {
  const query = useAppearanceSettings();
  if (query.isLoading)
    return <SettingsContentLoading variant="appearance" title="Preparing appearance" />;
  if (!query.data) return <p>Unable to load appearance settings.</p>;
  return <AppearanceForm key={query.dataUpdatedAt} initial={query.data.theme} />;
}

function AppearanceForm({ initial }: { initial: ThemeType }) {
  const [theme, setTheme] = useState(initial);
  const update = useUpdateAppearance();
  const reset = useResetSettings();
  const toast = useSettingsToast();
  const setThemeMode = useThemeStore((state) => state.setMode);
  const previewThemeMode = useThemeStore((state) => state.previewThemeMode);
  const clearThemePreview = useThemeStore((state) => state.clearThemePreview);
  const contentDensity = useAppShellStore((state) => state.contentDensity);
  const reduceMotion = useAppShellStore((state) => state.reduceMotion);
  const setContentDensity = useAppShellStore((state) => state.setContentDensity);
  const setReduceMotion = useAppShellStore((state) => state.setReduceMotion);
  const save = async () => {
    try {
      await update.mutateAsync({ theme });
      setThemeMode(theme);
      toast.showToast('Appearance saved.', 'success');
      return true;
    } catch {
      clearThemePreview();
      toast.showToast('Unable to save appearance.', 'error');
      return false;
    }
  };
  return (
    <>
      <SettingsCard
        title="Appearance"
        description="Theme is persisted to your account and applied across signed-in devices."
        icon="🎨"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {(['light', 'dark', 'system'] as const).map((value) => {
            const isSelected = theme === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setTheme(value);
                  previewThemeMode(value);
                }}
                className={`relative flex flex-col gap-3 rounded-2xl border-2 p-4 text-left transition-all ${
                  isSelected
                    ? 'border-[#b84c2b] bg-[#b84c2b]/5 shadow-sm dark:border-[#e8816a] dark:bg-[#e8816a]/10'
                    : 'border-(--border-subtle) bg-(--surface-elevated) hover:border-(--border-strong)'
                }`}
              >
                {/* Visual Mini Mockup */}
                <div
                  className={`h-20 w-full overflow-hidden rounded-xl border p-2 flex flex-col justify-between ${
                    value === 'dark'
                      ? 'bg-[#141412] border-white/10 text-white'
                      : value === 'light'
                        ? 'bg-[#f5ede4] border-[#e0d0c5] text-[#1a1714]'
                        : 'bg-gradient-to-r from-[#f5ede4] to-[#141412] border-neutral-400 text-neutral-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="h-2 w-12 rounded-full bg-current opacity-40" />
                    <div className="h-3 w-3 rounded-full bg-[#b84c2b] dark:bg-[#e8816a]" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-2 w-3/4 rounded-full bg-current opacity-30" />
                    <div className="h-2 w-1/2 rounded-full bg-current opacity-20" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold capitalize">{value}</span>
                  {isSelected && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#b84c2b] text-[10px] text-white dark:bg-[#e8816a] dark:text-black">
                      ✓
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </SettingsCard>
      <SettingsCard
        title="Reading comfort"
        description="These device preferences apply immediately and do not require saving."
        icon="Aa"
      >
        <div className="mb-4">
          <div className="mb-2 text-[13px] font-semibold text-(--text-primary)">
            Content density
          </div>
          <div className="flex flex-wrap gap-2">
            <PillButton
              active={contentDensity === 'comfortable'}
              onClick={() => setContentDensity('comfortable')}
            >
              Comfortable
            </PillButton>
            <PillButton
              active={contentDensity === 'compact'}
              onClick={() => setContentDensity('compact')}
            >
              Compact
            </PillButton>
          </div>
        </div>
        <ToggleRow
          title="Reduce motion"
          description="Minimizes animated transitions, progress movement, and smooth scrolling."
          checked={reduceMotion}
          onChange={setReduceMotion}
        />
      </SettingsCard>
      <SaveBar
        isSaving={update.isPending}
        isDirty={theme !== initial}
        onSave={save}
        onReset={async () => {
          await reset.mutateAsync();
          clearThemePreview();
          setTheme('system');
          setThemeMode('system');
        }}
      />
    </>
  );
}
