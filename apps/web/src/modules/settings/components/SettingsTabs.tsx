import { NavLink } from 'react-router-dom'
import { SETTINGS_TABS } from '../constants/settings-tabs.constants'
import { cn } from '../utils/settingsUi.utils'

export default function SettingsTabs() {
  return (
    <div className="mb-5 flex flex-wrap gap-2 rounded-2xl border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-2 dark:border-white/9 dark:bg-[#1e1c19]">
      {SETTINGS_TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            cn(
              'rounded-[11px] px-4 py-2.5 text-[13px] font-semibold transition',
              isActive
                ? 'bg-[#b84c2b] text-[#fdf8f5] dark:bg-[#e8816a] dark:text-[#141412]'
                : 'text-[#6b5f58] hover:bg-[rgba(184,76,43,0.07)] hover:text-[#b84c2b] dark:text-[#9b9a92] dark:hover:bg-[rgba(232,129,106,0.08)] dark:hover:text-[#e8816a]'
            )
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </div>
  )
}
