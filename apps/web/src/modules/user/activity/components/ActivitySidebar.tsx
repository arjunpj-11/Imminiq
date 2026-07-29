import type { ReactNode } from 'react';

import { normalizePercentage } from '../../../../lib/bounded-number';
import type { IActivityPageResponse } from '../types/activity.types';
import { formatNumber, formatSignedPercent } from '../utils/activity-formatters';
import { cn } from '../utils/activity-ui';
import {
  ActivityIcon,
  SparklesIcon,
  TrendDownIcon,
  TrendUpIcon,
  TrophyIcon,
} from './icons/ActivityIcons';

const SidebarCard = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div
    className={cn(
      'rounded-2xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-5 dark:border-(--border-subtle) dark:bg-(--surface-card)',
      className
    )}
  >
    {children}
  </div>
);

const SidebarCardHeader = ({ icon, title }: { icon: ReactNode; title: string }) => (
  <div className="mb-4 flex items-center gap-2">
    {icon}
    <span className="font-ui text-[14.5px] font-extrabold text-(--text-primary) dark:text-(--text-primary)">
      {title}
    </span>
  </div>
);

const SidebarValueRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between border-b border-[#ece3db] py-2.25 last:border-b-0 dark:border-white/[0.07]">
    <span className="text-[12px] text-(--text-secondary) dark:text-(--text-secondary)">
      {label}
    </span>
    <span className="font-mono text-[12px] font-bold text-(--text-primary) tabular-nums dark:text-(--text-primary)">
      {value}
    </span>
  </div>
);

interface IWeeklyChartProps {
  weekly: IActivityPageResponse['weekly'];
}

const WeeklyChart = ({ weekly }: IWeeklyChartProps) => {
  const maxXp = Math.max(...weekly.days.map((day) => day.xp), 1);
  const now = new Date();
  const todayKey = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');

  return (
    <SidebarCard>
      <SidebarCardHeader
        icon={
          <span className="text-(--brand-500) dark:text-(--brand-500)">
            <ActivityIcon size={14} />
          </span>
        }
        title="This week"
      />

      <div className="mb-2 flex h-20 items-end gap-1.25">
        {weekly.days.map((day) => {
          const heightPercent = Math.round((day.xp / maxXp) * 100);
          const isToday = day.date === todayKey;

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
                    ? 'var(--brand-500)'
                    : day.xp > 0
                      ? 'rgba(184,76,43,0.28)'
                      : 'rgba(26,23,20,0.06)',
                }}
              />
            </div>
          );
        })}
      </div>

      <div className="flex gap-1.25">
        {weekly.days.map((day) => {
          const isToday = day.date === todayKey;

          return (
            <div key={day.date} className="flex-1 text-center">
              <span
                className={cn(
                  'font-mono text-[8px] uppercase tracking-wide',
                  isToday
                    ? 'font-bold text-(--brand-500) dark:text-(--brand-500)'
                    : 'text-[#b0a097] dark:text-[#6b6460]'
                )}
              >
                {day.label}
              </span>
            </div>
          );
        })}
      </div>
    </SidebarCard>
  );
};

interface IWeeklyXpCardProps {
  weekly: IActivityPageResponse['weekly'];
}

const WeeklyXpCard = ({ weekly }: IWeeklyXpCardProps) => {
  const growthIsPositive = weekly.growthPercent > 0;
  const growthIsNegative = weekly.growthPercent < 0;

  return (
    <SidebarCard>
      <SidebarCardHeader
        icon={
          <span className="text-(--brand-500) dark:text-(--brand-500)">
            <SparklesIcon size={14} />
          </span>
        }
        title="XP this week"
      />

      <div className="mb-3 flex items-end gap-2">
        <span className="font-ui text-[32px] font-black leading-none text-(--text-primary) tabular-nums dark:text-(--text-primary)">
          {formatNumber(weekly.currentXp)}
        </span>

        <span
          className={cn(
            'mb-1 inline-flex items-center gap-1 font-mono text-[10px] font-bold',
            growthIsPositive && 'text-(--success) dark:text-(--success)',
            growthIsNegative && 'text-(--brand-500) dark:text-(--brand-500)',
            !growthIsPositive && !growthIsNegative && 'text-[#8a7d75] dark:text-(--text-secondary)'
          )}
        >
          {growthIsPositive && <TrendUpIcon size={10} />}
          {growthIsNegative && <TrendDownIcon size={10} />}
          {formatSignedPercent(weekly.growthPercent)}
        </span>
      </div>

      <div className="mb-3 h-0.75 overflow-hidden rounded-full bg-[rgba(26,23,20,0.07)] dark:bg-white/8">
        <div
          className="h-full rounded-full bg-(--brand-500) transition-[width] duration-500 dark:bg-(--brand-500)"
          style={{
            width: `${normalizePercentage(weekly.progressPercent)}%`,
          }}
        />
      </div>

      <div className="mb-4 text-[10.5px] text-[#b0a097] dark:text-[#6b6460]">
        {weekly.xpToTarget > 0
          ? `${formatNumber(weekly.xpToTarget)} XP to ${formatNumber(weekly.targetXp)} XP target`
          : 'Weekly target completed'}
      </div>
    </SidebarCard>
  );
};

interface IPersonalBestsCardProps {
  personalBests: IActivityPageResponse['personalBests'];
}

const PersonalBestsCard = ({ personalBests }: IPersonalBestsCardProps) => (
  <SidebarCard>
    <SidebarCardHeader
      icon={
        <span className="text-[#c49a2c]">
          <TrophyIcon size={14} />
        </span>
      }
      title="Personal bests"
    />

    <SidebarValueRow label="Best day XP" value={`${formatNumber(personalBests.bestDayXp)} XP`} />
    <SidebarValueRow
      label="Longest streak"
      value={`${formatNumber(personalBests.longestStreak)} days`}
    />
  </SidebarCard>
);

interface IActivitySidebarProps {
  weekly: IActivityPageResponse['weekly'];
  personalBests: IActivityPageResponse['personalBests'];
}

export default function ActivitySidebar({ weekly, personalBests }: IActivitySidebarProps) {
  return (
    <aside className="flex w-62 shrink-0 flex-col gap-3 max-[860px]:w-full">
      <WeeklyChart weekly={weekly} />
      <WeeklyXpCard weekly={weekly} />
      <PersonalBestsCard personalBests={personalBests} />
    </aside>
  );
}
