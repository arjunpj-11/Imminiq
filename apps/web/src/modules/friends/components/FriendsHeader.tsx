interface FriendsHeaderProps {
  title: string;
  description: string;
}

export default function FriendsHeader({
  title,
  description,
}: FriendsHeaderProps) {
  return (
    <header>
      <p className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-widest text-[#b84c2b] dark:text-[#e8816a]">
        Community
      </p>

      <h1 className="mt-1 font-['Playfair_Display',serif] text-[clamp(26px,3vw,34px)] font-extrabold tracking-[-0.6px] text-[#1a1714] dark:text-[#f2f0eb]">
        {title}
      </h1>

      <p className="mt-2 max-w-xl text-[13px] leading-6 text-[#6b5f58] dark:text-[#9b9a92]">
        {description}
      </p>
    </header>
  );
}
