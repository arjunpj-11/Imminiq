interface IFriendsHeaderProps {
  title: string;
  description: string;
}

export default function FriendsHeader({ title, description }: IFriendsHeaderProps) {
  return (
    <header>
      <p className="font-mono text-[9px] uppercase tracking-widest text-(--brand-500) dark:text-(--brand-500)">
        Community
      </p>

      <h1 className="mt-1 font-ui text-[clamp(26px,3vw,34px)] font-extrabold tracking-[-0.6px] text-(--text-primary) dark:text-(--text-primary)">
        {title}
      </h1>

      <p className="mt-2 max-w-xl text-[13px] leading-6 text-(--text-secondary) dark:text-(--text-secondary)">
        {description}
      </p>
    </header>
  );
}
