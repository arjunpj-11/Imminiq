import NavPillTabs from '../../../components/navigation/NavPillTabs'
import { SETTINGS_TABS } from '../constants/settings-tabs.constants'

export default function SettingsTabs() {
  return (
    <NavPillTabs
      items={SETTINGS_TABS}
      className="mb-5"
      ariaLabel="Settings sections"
    />
  )
}
