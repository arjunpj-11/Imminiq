import type { ProfileBadge } from '../types/profile.types'
import type { BadgeColor } from '../types/profile.types'

/* ─── Badge item ─── */
export const badgeEmojiByType: Record<ProfileBadge["badgeType"], string> = {
  streak: "🔥",
  test: "🧠",
  tracker: "🏆",
  battle: "⚔️",
  community: "🌟",
};

export const badgeColorByType: Record<ProfileBadge["badgeType"], BadgeColor> = {
  streak: "fire",
  test: "blue",
  tracker: "amber",
  battle: "green",
  community: "blue",
};

export const badgeTierByType: Record<ProfileBadge["badgeType"], string> = {
  streak: "Streak",
  test: "Assessment",
  tracker: "Creator",
  battle: "Arena",
  community: "Community",
};

export const badgeToneClasses: Record<
  BadgeColor,
  {
    tile: string;
    icon: string;
    aura: string;
    chip: string;
    dot: string;
    divider: string;
  }
> = {
  fire: {
    tile: "border-[rgba(184,76,43,0.28)] bg-[linear-gradient(145deg,rgba(184,76,43,0.16),rgba(255,248,240,0.86))] dark:border-[rgba(232,129,106,0.34)] dark:bg-[linear-gradient(145deg,rgba(232,129,106,0.18),rgba(30,28,25,0.94))]",
    icon: "border-[rgba(184,76,43,0.30)] bg-[radial-gradient(circle_at_30%_25%,rgba(255,231,210,0.95),rgba(184,76,43,0.18))] dark:border-[rgba(232,129,106,0.38)] dark:bg-[radial-gradient(circle_at_30%_25%,rgba(255,196,176,0.30),rgba(232,129,106,0.12))]",
    aura: "bg-[radial-gradient(circle,rgba(184,76,43,0.30),transparent_68%)] dark:bg-[radial-gradient(circle,rgba(232,129,106,0.34),transparent_68%)]",
    chip: "border-[rgba(184,76,43,0.24)] bg-[rgba(184,76,43,0.10)] text-[var(--brand-500)] dark:border-[rgba(232,129,106,0.34)] dark:bg-[rgba(232,129,106,0.14)] dark:text-[#f5a090]",
    dot: "bg-[var(--brand-500)] shadow-[0_0_10px_rgba(184,76,43,0.75)] dark:bg-[var(--brand-500)] dark:shadow-[0_0_12px_rgba(232,129,106,0.72)]",
    divider:
      "from-transparent via-[rgba(184,76,43,0.42)] to-transparent dark:via-[rgba(232,129,106,0.46)]",
  },
  green: {
    tile: "border-[rgba(45,106,71,0.26)] bg-[linear-gradient(145deg,rgba(45,106,71,0.14),rgba(246,252,248,0.90))] dark:border-[rgba(92,201,138,0.34)] dark:bg-[linear-gradient(145deg,rgba(92,201,138,0.16),rgba(30,28,25,0.94))]",
    icon: "border-[rgba(45,106,71,0.28)] bg-[radial-gradient(circle_at_30%_25%,rgba(215,255,231,0.92),rgba(45,106,71,0.15))] dark:border-[rgba(92,201,138,0.38)] dark:bg-[radial-gradient(circle_at_30%_25%,rgba(171,255,208,0.24),rgba(92,201,138,0.10))]",
    aura: "bg-[radial-gradient(circle,rgba(45,106,71,0.24),transparent_68%)] dark:bg-[radial-gradient(circle,rgba(92,201,138,0.30),transparent_68%)]",
    chip: "border-[rgba(45,106,71,0.24)] bg-[rgba(45,106,71,0.10)] text-[var(--success)] dark:border-[rgba(92,201,138,0.34)] dark:bg-[rgba(92,201,138,0.14)] dark:text-[#7fe1a7]",
    dot: "bg-[var(--success)] shadow-[0_0_10px_rgba(76,175,125,0.68)] dark:bg-[var(--success)] dark:shadow-[0_0_12px_rgba(92,201,138,0.72)]",
    divider:
      "from-transparent via-[rgba(45,106,71,0.40)] to-transparent dark:via-[rgba(92,201,138,0.46)]",
  },
  amber: {
    tile: "border-[rgba(138,98,0,0.26)] bg-[linear-gradient(145deg,rgba(138,98,0,0.14),rgba(255,251,241,0.90))] dark:border-[rgba(240,168,66,0.36)] dark:bg-[linear-gradient(145deg,rgba(240,168,66,0.16),rgba(30,28,25,0.94))]",
    icon: "border-[rgba(138,98,0,0.28)] bg-[radial-gradient(circle_at_30%_25%,rgba(255,243,200,0.96),rgba(138,98,0,0.15))] dark:border-[rgba(240,168,66,0.40)] dark:bg-[radial-gradient(circle_at_30%_25%,rgba(255,224,146,0.24),rgba(240,168,66,0.10))]",
    aura: "bg-[radial-gradient(circle,rgba(201,128,0,0.28),transparent_68%)] dark:bg-[radial-gradient(circle,rgba(240,168,66,0.32),transparent_68%)]",
    chip: "border-[rgba(138,98,0,0.24)] bg-[rgba(138,98,0,0.10)] text-[#8a6200] dark:border-[rgba(240,168,66,0.36)] dark:bg-[rgba(240,168,66,0.14)] dark:text-[#f0bf67]",
    dot: "bg-[var(--warning)] shadow-[0_0_10px_rgba(201,128,0,0.68)] dark:bg-[var(--warning)] dark:shadow-[0_0_12px_rgba(240,168,66,0.72)]",
    divider:
      "from-transparent via-[rgba(138,98,0,0.40)] to-transparent dark:via-[rgba(240,168,66,0.48)]",
  },
  blue: {
    tile: "border-[rgba(59,108,183,0.28)] bg-[linear-gradient(145deg,rgba(59,108,183,0.14),rgba(246,250,255,0.90))] dark:border-[rgba(107,159,232,0.36)] dark:bg-[linear-gradient(145deg,rgba(107,159,232,0.16),rgba(30,28,25,0.94))]",
    icon: "border-[rgba(59,108,183,0.30)] bg-[radial-gradient(circle_at_30%_25%,rgba(220,235,255,0.96),rgba(59,108,183,0.15))] dark:border-[rgba(107,159,232,0.40)] dark:bg-[radial-gradient(circle_at_30%_25%,rgba(188,219,255,0.24),rgba(107,159,232,0.10))]",
    aura: "bg-[radial-gradient(circle,rgba(59,108,183,0.28),transparent_68%)] dark:bg-[radial-gradient(circle,rgba(107,159,232,0.32),transparent_68%)]",
    chip: "border-[rgba(59,108,183,0.24)] bg-[rgba(59,108,183,0.10)] text-[var(--info)] dark:border-[rgba(107,159,232,0.36)] dark:bg-[rgba(107,159,232,0.14)] dark:text-[#8ab8f4]",
    dot: "bg-[var(--info)] shadow-[0_0_10px_rgba(59,108,183,0.68)] dark:bg-[var(--info)] dark:shadow-[0_0_12px_rgba(107,159,232,0.72)]",
    divider:
      "from-transparent via-[rgba(59,108,183,0.42)] to-transparent dark:via-[rgba(107,159,232,0.48)]",
  },
  locked: {
    tile: "border-[var(--border-subtle)] bg-[linear-gradient(145deg,rgba(26,23,20,0.06),rgba(253,248,245,0.84))] opacity-65 grayscale dark:border-white/[0.09] dark:bg-[linear-gradient(145deg,rgba(242,240,235,0.06),rgba(30,28,25,0.92))]",
    icon: "border-[var(--border-subtle)] bg-[rgba(26,23,20,0.06)] dark:border-white/[0.09] dark:bg-[rgba(242,240,235,0.08)]",
    aura: "bg-[radial-gradient(circle,rgba(26,23,20,0.10),transparent_68%)] dark:bg-[radial-gradient(circle,rgba(242,240,235,0.10),transparent_68%)]",
    chip: "border-[var(--border-subtle)] bg-[rgba(26,23,20,0.05)] text-[var(--text-secondary)] dark:border-white/[0.09] dark:bg-[rgba(242,240,235,0.08)] dark:text-[var(--text-secondary)]",
    dot: "",
    divider:
      "from-transparent via-[rgba(26,23,20,0.18)] to-transparent dark:via-[rgba(242,240,235,0.16)]",
  },
};
