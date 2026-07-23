import { useState } from 'react';
import SettingsContentLoading from '../components/SettingsContentLoading';
import { PillButton, SaveBar, SettingsCard } from '../components/SettingsUi';
import { useAppearanceSettings, useResetSettings, useUpdateAppearance } from '../hooks/useSettings';
import { useSettingsToast } from '../hooks/useSettingsToast';
import { useThemeStore } from '../../../../store/useThemeStore';
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
        <div className="flex flex-wrap gap-2">
          {(['light', 'dark', 'system'] as const).map((value) => (
            <PillButton
              key={value}
              active={theme === value}
              onClick={() => {
                setTheme(value);
                previewThemeMode(value);
              }}
            >
              {value[0].toUpperCase() + value.slice(1)}
            </PillButton>
          ))}
        </div>
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
