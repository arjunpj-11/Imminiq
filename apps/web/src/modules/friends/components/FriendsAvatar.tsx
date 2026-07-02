import { getInitials } from "../utils/friends-formatters";

interface FriendsAvatarProps {
  fullName: string;
  avatarUrl?: string | null;
  size?: "sm" | "md";
}

export default function FriendsAvatar({
  fullName,
  avatarUrl,
  size = "md",
}: FriendsAvatarProps) {
  const sizeClass =
    size === "sm" ? "h-9 w-9 text-[10px]" : "h-11 w-11 text-[12px]";

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={`${fullName}'s avatar`}
        className={`${sizeClass} shrink-0 rounded-full object-cover ring-1 ring-[#e0d0c5] dark:ring-white/10`}
      />
    );
  }

  return (
    <div
      aria-label={`${fullName}'s initials`}
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#b84c2b] to-[#e8816a] font-['DM_Mono',monospace] font-bold text-white`}
    >
      {getInitials(fullName)}
    </div>
  );
}
