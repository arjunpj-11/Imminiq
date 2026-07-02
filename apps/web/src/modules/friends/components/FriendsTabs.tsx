import type { ReactNode } from "react";

import type { FriendsTab } from "../types/friends.types";
import { FriendsIcon, UserPlusIcon } from "./icons/FriendsIcons";

interface TabButtonProps {
  active: boolean;
  icon: ReactNode;
  label: string;
  count: number;
  onClick: () => void;
}

const TabButton = ({ active, icon, label, count, onClick }: TabButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={[
      "flex min-w-0 flex-1 items-center justify-center gap-2 rounded-[10px]",
      "px-3 py-2.5 text-[11.5px] font-bold transition",
      active
        ? "bg-[#b84c2b] text-white shadow-sm dark:bg-[#e8816a] dark:text-[#141412]"
        : "text-[#6b5f58] hover:bg-[rgba(184,76,43,0.07)] hover:text-[#b84c2b] dark:text-[#9b9a92] dark:hover:text-[#e8816a]",
    ].join(" ")}
  >
    {icon}
    <span className="truncate">{label}</span>
    <span
      className={[
        "rounded-full px-2 py-0.5 font-['DM_Mono',monospace] text-[8.5px]",
        active ? "bg-white/20" : "bg-[#e8ddd6] dark:bg-white/8",
      ].join(" ")}
    >
      {Math.max(0, count)}
    </span>
  </button>
);

interface FriendsTabsProps {
  activeTab: FriendsTab;
  friendsCount: number;
  pendingCount: number;
  onChange: (tab: FriendsTab) => void;
}

export default function FriendsTabs({
  activeTab,
  friendsCount,
  pendingCount,
  onChange,
}: FriendsTabsProps) {
  return (
    <div className="flex gap-2 rounded-[14px] border border-[#e8ddd6] bg-white/45 p-1.5 dark:border-white/8 dark:bg-white/3">
      <TabButton
        active={activeTab === "friends"}
        icon={<FriendsIcon />}
        label="My Friends"
        count={friendsCount}
        onClick={() => onChange("friends")}
      />
      <TabButton
        active={activeTab === "requests"}
        icon={<UserPlusIcon />}
        label="Friend Invites"
        count={pendingCount}
        onClick={() => onChange("requests")}
      />
    </div>
  );
}
