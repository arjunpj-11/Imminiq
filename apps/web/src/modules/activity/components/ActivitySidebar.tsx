import type { ReactNode } from 'react'

import type { ActivityPageResponse } from '../types/activity.types'
import {
  formatNumber,
  formatPercent,
  formatSignedPercent,
} from '../utils/activity-formatters'
import { cn } from '../utils/activity-ui'
import {
  ActivityIcon,
  CheckIcon,
  SparklesIcon,
  StarIcon,
  TrendDownIcon,
  TrendUpIcon,
  TrophyIcon,
} from './icons/ActivityIcons'

const SidebarCard = ({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) => (
  <div
    className={cn(
      'rounded-2xl border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 dark:border-white/9 dark:bg-[#1e1c19]',
      className,
    )}
  >
    {children}
  </div>
)

const SidebarCardHeader = ({
  icon,
  title,
}: {
  icon: ReactNode
  title: string
}) => (
  <div className="mb-4 flex items-center gap-2">
    {icon}
    <span className="font-['Playfair_Display',serif] text-[14.5px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">
      {title}
    </span>
  </div>
)

const SidebarValueRow = ({
  label,
  value,
}: {
  label: string
  value: string
}) => (
  <div className="flex items-center justify-between border-b border-[#ece3db] py-2.25 last:border-b-0 dark:border-white/[0.07]">
    <span className="text-[12px] text-[#6b5f58] dark:text-[#9b9a92]">
      {label}
    </span>
    <span className="font-['DM_Mono',monospace] text-[12px] font-bold text-[#1a1714] tabular-nums dark:text-[#f2f0eb]">
      {value}
    </span>
  </div>
)

interface WeeklyChartProps {
  weekly: ActivityPageResponse['weekly']
}

const WeeklyChart = ({ weekly }: WeeklyChartProps) => {
  const maxXp = Math.max(...weekly.days.map((day) => day.xp), 1)
  const now = new Date()
  const todayKey = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-')

  return (
    <SidebarCard>
      <SidebarCardHeader
        icon={
          <span className="text-[#b84c2b] dark:text-[#e8816a]">
            <ActivityIcon size={14} />
          </span>
        }
        title="This week"
      />

      <div className="mb-2 flex h-20 items-end gap-1.25">
        {weekly.days.map((day) => {
          const heightPercent = Math.round((day.xp / maxXp) * 100)
          const isToday = day.date === todayKey

          return (
            <div
              key={day.date}
              className="flex h-full flex-1 flex-col items-center justify-end"
              title={`${day.label}: ${formatNumber(day.xp)} XP · ${day.sessions} session${day.sessions === 1 ? '' : 's'}`}
            >
              <div
                className="w-full rounded-t-sm transition-all duration-500"
                style={{
                  height: `${heightPercent}%`,
                  minHeight: day.xp > 0 ? 4 : 0,
                  background: isToday
                    ? '#b84c2b'
                    : day.xp > 0
                      ? 'rgba(184,76,43,0.28)'
                      : 'rgba(26,23,20,0.06)',
                }}
              />
            </div>
          )
        })}
      </div>

      <div className="flex gap-1.25">
        {weekly.days.map((day) => {
          const isToday = day.date === todayKey

          return (
            <div key={day.date} className="flex-1 text-center">
              <span
                className={cn(
                  "font-['DM_Mono',monospace] text-[8px] uppercase tracking-wide",
                  isToday
                    ? 'font-bold text-[#b84c2b] dark:text-[#e8816a]'
                    : 'text-[#b0a097] dark:text-[#6b6460]',
                )}
              >
                {day.label}
              </span>
            </div>
          )
        })}
      </div>
    </SidebarCard>
  )
}

interface WeeklyXpCardProps {
  weekly: ActivityPageResponse['weekly']
}

const WeeklyXpCard = ({ weekly }: WeeklyXpCardProps) => {
  const growthIsPositive = weekly.growthPercent > 0
  const growthIsNegative = weekly.growthPercent < 0

  return (
    <SidebarCard>
      <SidebarCardHeader
        icon={
          <span className="text-[#b84c2b] dark:text-[#e8816a]">
            <SparklesIcon size={14} />
          </span>
        }
        title="XP this week"
      />

      <div className="mb-3 flex items-end gap-2">
        <span className="font-['Playfair_Display',serif] text-[32px] font-black leading-none text-[#1a1714] tabular-nums dark:text-[#f2f0eb]">
          {formatNumber(weekly.currentXp)}
        </span>

        <span
          className={cn(
            "mb-1 inline-flex items-center gap-1 font-['DM_Mono',monospace] text-[10px] font-bold",
            growthIsPositive && 'text-[#2d6a47] dark:text-[#5cc98a]',
            growthIsNegative && 'text-[#b84c2b] dark:text-[#e8816a]',
            !growthIsPositive &&
              !growthIsNegative &&
              'text-[#8a7d75] dark:text-[#9b9a92]',
          )}
        >
          {growthIsPositive && <TrendUpIcon size={10} />}
          {growthIsNegative && <TrendDownIcon size={10} />}
          {formatSignedPercent(weekly.growthPercent)}
        </span>
      </div>

      <div className="mb-3 h-0.75 overflow-hidden rounded-full bg-[rgba(26,23,20,0.07)] dark:bg-white/8">
        <div
          className="h-full rounded-full bg-[#b84c2b] transition-[width] duration-500 dark:bg-[#e8816a]"
          style={{
            width: `${Math.min(100, Math.max(0, weekly.progressPercent))}%`,
          }}
        />
      </div>

      <div className="mb-4 text-[10.5px] text-[#b0a097] dark:text-[#6b6460]">
        {weekly.xpToTarget > 0
          ? `${formatNumber(weekly.xpToTarget)} XP to ${formatNumber(weekly.targetXp)} XP target`
          : 'Weekly target completed'}
      </div>

      <SidebarValueRow
        label="Tracker XP"
        value={`${formatNumber(weekly.breakdown.trackerXp)} XP`}
      />
      <SidebarValueRow
        label="Test XP"
        value={`${formatNumber(weekly.breakdown.testXp)} XP`}
      />
      <SidebarValueRow
        label="Community XP"
        value={`${formatNumber(weekly.breakdown.communityXp)} XP`}
      />
      <SidebarValueRow
        label="Streak XP"
        value={`${formatNumber(weekly.breakdown.streakXp)} XP`}
      />
      <SidebarValueRow
        label="Milestone XP"
        value={`${formatNumber(weekly.breakdown.milestoneXp)} XP`}
      />
    </SidebarCard>
  )
}

interface PersonalBestsCardProps {
  personalBests: ActivityPageResponse['personalBests']
}

const PersonalBestsCard = ({
  personalBests,
}: PersonalBestsCardProps) => (
  <SidebarCard>
    <SidebarCardHeader
      icon={
        <span className="text-[#c49a2c]">
          <TrophyIcon size={14} />
        </span>
      }
      title="Personal bests"
    />

    <SidebarValueRow
      label="Best day XP"
      value={`${formatNumber(personalBests.bestDayXp)} XP`}
    />
    <SidebarValueRow
      label="Longest streak"
      value={`${formatNumber(personalBests.longestStreak)} days`}
    />
    <SidebarValueRow
      label="Sessions / week"
      value={formatNumber(personalBests.bestWeekSessions)}
    />
    <SidebarValueRow
      label="Best test score"
      value={formatPercent(personalBests.bestTestScore)}
    />
  </SidebarCard>
)

interface DailyGoalCardProps {
  dailyGoal: ActivityPageResponse['dailyGoal']
}

const DailyGoalCard = ({ dailyGoal }: DailyGoalCardProps) => (
  <div className="rounded-2xl bg-[#b84c2b] p-5">
    <div className="mb-2.5 flex items-center gap-2">
      <span className="text-[rgba(255,255,255,0.75)]">
        <StarIcon size={13} />
      </span>
      <span className="font-['Playfair_Display',serif] text-[14.5px] font-extrabold text-white">
        Daily Goal
      </span>
    </div>

    <p className="mb-3 text-[11.5px] leading-[1.6] text-[rgba(255,255,255,0.8)]">
      Finish today&apos;s tasks to earn your daily bonus of{' '}
      {formatNumber(dailyGoal.rewardXp)} XP.
    </p>

    <div className="mb-4 space-y-2">
      {dailyGoal.tasks.map((task) => (
        <div
          key={task.key}
          className="flex items-center gap-2 text-[11px] text-white/85"
        >
          <span
            className={cn(
              'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
              task.completed
                ? 'border-white bg-white text-[#b84c2b]'
                : 'border-white/35 text-transparent',
            )}
          >
            <CheckIcon size={10} />
          </span>
          <span className={task.completed ? 'line-through opacity-75' : ''}>
            {task.label}
          </span>
        </div>
      ))}
    </div>

    <div className="mb-3 h-1 overflow-hidden rounded-full bg-white/20">
      <div
        className="h-full rounded-full bg-white transition-[width] duration-500"
        style={{
          width: `${Math.min(100, Math.max(0, dailyGoal.progressPercent))}%`,
        }}
      />
    </div>

    <div className="font-['DM_Mono',monospace] text-[10px] uppercase tracking-wider text-white/70">
      {dailyGoal.completed
        ? 'Goal complete · bonus awarded'
        : `${dailyGoal.completedTasks} / ${dailyGoal.totalTasks} tasks done`}
    </div>
  </div>
)

interface ActivitySidebarProps {
  weekly: ActivityPageResponse['weekly']
  personalBests: ActivityPageResponse['personalBests']
  dailyGoal: ActivityPageResponse['dailyGoal']
}

export default function ActivitySidebar({
  weekly,
  personalBests,
  dailyGoal,
}: ActivitySidebarProps) {
  return (
    <aside className="flex w-62 shrink-0 flex-col gap-3 max-[860px]:w-full">
      <WeeklyChart weekly={weekly} />
      <WeeklyXpCard weekly={weekly} />
      <PersonalBestsCard personalBests={personalBests} />
      <DailyGoalCard dailyGoal={dailyGoal} />
    </aside>
  )
}
