import {
  LEADERBOARD_SCOPE_LABELS,
  LEADERBOARD_SCOPES,
  LEADERBOARD_SECTION_LABELS,
  LEADERBOARD_SECTIONS,
} from '../constants/leaderboard.constants';
import type { LeaderboardScope, LeaderboardSection } from '../types/leaderboard.types';
import PillTabs from '../../../../components/navigation/PillTabs';
import FilterBar from '../../../../components/filters/FilterBar';
import {
  CalendarIcon,
  ChalkBoardIcon,
  GlobeIcon,
  GraduationCapIcon,
  UserGroupIcon,
} from './icons/LeaderboardIcons';

interface ILeaderboardControlsProps {
  activeSection: LeaderboardSection;
  activeScope: LeaderboardScope;
  counts: {
    students: number;
    trainers: number;
  };
  onSectionChange: (section: LeaderboardSection) => void;
  onScopeChange: (scope: LeaderboardScope) => void;
  disabled?: boolean;
}

const sectionIcons = {
  students: <GraduationCapIcon size={20} />,
  trainers: <ChalkBoardIcon size={20} />,
} as const;

const scopeIcons = {
  global: <GlobeIcon size={12} />,
  friends: <UserGroupIcon size={12} />,
  weekly: <CalendarIcon size={12} />,
} as const;

export default function LeaderboardControls({
  activeSection,
  activeScope,
  counts,
  onSectionChange,
  onScopeChange,
  disabled = false,
}: ILeaderboardControlsProps) {
  const sectionItems = LEADERBOARD_SECTIONS.map((section) => ({
    value: section,
    label: LEADERBOARD_SECTION_LABELS[section].label,
    icon: sectionIcons[section],
    count: counts[section],
    disabled,
  }));
  const scopeItems = LEADERBOARD_SCOPES.map((scope) => ({
    value: scope,
    label: LEADERBOARD_SCOPE_LABELS[scope],
    icon: scopeIcons[scope],
    disabled,
  }));

  return (
    <FilterBar
      surface
      className="w-full flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl p-2.5 sm:p-3"
    >
      <PillTabs
        value={activeSection}
        items={sectionItems}
        onValueChange={onSectionChange}
        ariaLabel="Leaderboard section"
        className="w-full sm:w-auto border-0 bg-transparent p-0 justify-start"
        itemClassName="flex-1 sm:flex-none text-center"
      />
      <PillTabs
        value={activeScope}
        items={scopeItems}
        onValueChange={onScopeChange}
        ariaLabel="Leaderboard scope"
        className="w-full sm:w-auto border-0 bg-transparent p-0 justify-start sm:justify-end overflow-x-auto"
        itemClassName="flex-1 sm:flex-none px-3 text-center"
      />
    </FilterBar>
  );
}
