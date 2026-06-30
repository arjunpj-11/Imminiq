import {
  LEADERBOARD_SCOPE_LABELS,
  LEADERBOARD_SCOPES,
  LEADERBOARD_SECTION_LABELS,
  LEADERBOARD_SECTIONS,
} from '../constants/leaderboard.constants'
import type {
  LeaderboardScope,
  LeaderboardSection,
} from '../types/leaderboard.types'
import { formatNumber } from '../utils/leaderboard-formatters'
import { cn } from '../utils/leaderboard-ui'
import {
  CalendarIcon,
  ChalkBoardIcon,
  GlobeIcon,
  GraduationCapIcon,
  UserGroupIcon,
} from './icons/LeaderboardIcons'

interface LeaderboardControlsProps {
  activeSection: LeaderboardSection
  activeScope: LeaderboardScope
  counts: {
    students: number
    trainers: number
  }
  onSectionChange: (section: LeaderboardSection) => void
  onScopeChange: (scope: LeaderboardScope) => void
  disabled?: boolean
}

const sectionIcons = {
  students: <GraduationCapIcon size={20} />,
  trainers: <ChalkBoardIcon size={20} />,
} as const

const scopeIcons = {
  global: <GlobeIcon size={12} />,
  friends: <UserGroupIcon size={12} />,
  weekly: <CalendarIcon size={12} />,
} as const

export default function LeaderboardControls({
  activeSection,
  activeScope,
  counts,
  onSectionChange,
  onScopeChange,
  disabled = false,
}: LeaderboardControlsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2.5 max-[400px]:flex-col" role="group" aria-label="Leaderboard section">
        {LEADERBOARD_SECTIONS.map((section) => {
          const isActive = activeSection === section

          return (
            <button
              key={section}
              type="button"
              onClick={() => onSectionChange(section)}
              aria-pressed={isActive}
              disabled={disabled}
              className={cn(
                'group relative flex items-center gap-3 rounded-[14px] border-[1.5px] px-4 py-3 text-left transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60',
                isActive
                  ? 'border-[rgba(184,76,43,0.45)] bg-[rgba(184,76,43,0.05)] dark:border-[rgba(232,129,106,0.35)] dark:bg-[rgba(232,129,106,0.06)]'
                  : 'border-[#e0d0c5] bg-[#fdf8f5] hover:border-[rgba(184,76,43,0.22)] hover:bg-[rgba(184,76,43,0.02)] dark:border-white/9 dark:bg-[#1e1c19] dark:hover:border-white/20',
              )}
            >
              {isActive && (
                <>
                  <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-[13px] dark:hidden" style={{ background: 'linear-gradient(90deg, transparent, #b84c2b, transparent)' }} />
                  <div className="absolute inset-x-0 top-0 hidden h-0.5 rounded-t-[13px] dark:block" style={{ background: 'linear-gradient(90deg, transparent, #e8816a, transparent)' }} />
                </>
              )}

              <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] transition-colors duration-200', isActive ? 'bg-[rgba(184,76,43,0.10)] text-[#b84c2b] dark:bg-[rgba(232,129,106,0.12)] dark:text-[#e8816a]' : 'bg-[rgba(26,23,20,0.05)] text-[#9b8a82] dark:bg-white/6 dark:text-[#6b6460]')}>
                {sectionIcons[section]}
              </div>

              <div>
                <div className={cn('text-[13px] font-semibold leading-tight transition-colors duration-200', isActive ? 'text-[#b84c2b] dark:text-[#e8816a]' : 'text-[#2a2420] dark:text-[#dedad5]')}>
                  {LEADERBOARD_SECTION_LABELS[section].label}
                </div>
                <div className="mt-0.5 font-['DM_Mono',monospace] text-[10px] text-[#b0a097] dark:text-[#6b6460]">
                  {formatNumber(counts[section])} active
                </div>
              </div>

              {isActive && <div className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-[#b84c2b] dark:bg-[#e8816a]" />}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Leaderboard scope">
        {LEADERBOARD_SCOPES.map((scope) => {
          const isActive = activeScope === scope

          return (
            <button
              key={scope}
              type="button"
              onClick={() => onScopeChange(scope)}
              aria-pressed={isActive}
              disabled={disabled}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-['DM_Mono',monospace] text-[10px] font-bold uppercase tracking-[0.07em] transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-60",
                isActive
                  ? 'border-[#b84c2b] bg-[#b84c2b] text-white dark:border-[#e8816a] dark:bg-[#e8816a] dark:text-[#141412]'
                  : 'border-[#e0d0c5] bg-[#fdf8f5] text-[#9b8a82] hover:border-[rgba(184,76,43,0.25)] hover:text-[#b84c2b] dark:border-white/9 dark:bg-[#1e1c19] dark:text-[#6b6460] dark:hover:text-[#e8816a]',
              )}
            >
              {scopeIcons[scope]}
              {LEADERBOARD_SCOPE_LABELS[scope]}
            </button>
          )
        })}
      </div>
    </div>
  )
}
