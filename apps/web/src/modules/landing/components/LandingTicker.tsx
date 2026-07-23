const words = [
  'LIVING TRACKERS',
  'AI-STRUCTURED START',
  'LEARN TOGETHER',
  'COMMUNITY CONTRIBUTIONS',
  'PEER VERIFICATION',
  'COLLECTIVE MASTERY',
];

export default function LandingTicker() {
  return (
    <div className="overflow-hidden border-y border-[#e0d0c5] bg-[#fdf8f5] py-4 text-[#1a1714] dark:border-white/9 dark:bg-[#1e1c19] dark:text-[#f2f0eb]">
      <div className="landing-marquee-track flex w-max gap-10 whitespace-nowrap font-['DM_Mono',monospace] text-[11px] uppercase tracking-[0.22em] text-[#b84c2b] dark:text-[#e8816a]">
        {[...words, ...words, ...words, ...words].map((word, index) => (
          <span key={`${word}-${index}`} className="inline-flex items-center gap-10">
            {word}
            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-45" />
          </span>
        ))}
      </div>
    </div>
  );
}
