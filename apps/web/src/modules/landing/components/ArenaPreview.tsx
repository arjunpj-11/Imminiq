import { audienceCards } from '../constants/landing.constants';

export default function ArenaPreview() {
  return (
    <section
      id="arena"
      className="render-lazy-section bg-[#f5ede4] px-4 py-16 text-[#1a1714] dark:bg-[#141412] dark:text-[#f2f0eb] sm:px-8 sm:py-20 lg:px-10"
    >
      <div className="mx-auto grid max-w-340 gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="flex flex-col justify-between rounded-[34px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-7 shadow-[0_22px_70px_rgba(26,23,20,0.10)] dark:border-white/9 dark:bg-[#1e1c19]">
          <div>
            <p className="font-['DM_Mono',monospace] text-[10px] uppercase tracking-[0.18em] text-[#b84c2b] dark:text-[#e8816a]">
              Built for
            </p>
            <h2 className="mt-4 font-['Playfair_Display',serif] text-[clamp(42px,7vw,90px)] font-black leading-[0.9] tracking-[-0.08em]">
              People who want to learn—and leave something better behind.
            </h2>
          </div>
          <div className="mt-10 space-y-3">
            {audienceCards.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-[#e0d0c5] bg-white/60 px-4 py-3 text-[14px] font-semibold dark:border-white/9 dark:bg-white/5"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-h-130 overflow-hidden rounded-[34px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 text-[#1a1714] shadow-[0_28px_90px_rgba(26,23,20,0.16)] dark:border-white/9 dark:bg-[#050505] dark:text-[#f2f0eb]">
          <div className="landing-pulse-orb absolute -right-20 top-10 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(232,129,106,0.22),transparent_70%)] blur-3xl" />
          <div className="landing-pulse-orb absolute -bottom-24 left-0 h-90 w-90 rounded-full bg-[radial-gradient(circle,rgba(107,159,232,0.18),transparent_70%)] blur-3xl" />

          <div className="relative z-1 flex items-center justify-between border-b border-[#e0d0c5] pb-4 dark:border-white/10">
            <div>
              <p className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.18em] text-[#b84c2b] dark:text-[#e8816a]">
                Community Tracker Preview
              </p>
              <h3 className="mt-1 text-xl font-bold">
                One shared path. A community growing around it.
              </h3>
            </div>
            <span className="rounded-full border border-[#b84c2b]/30 bg-[#b84c2b]/10 px-3 py-1 font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.12em] text-[#b84c2b] dark:border-[#e8816a]/30 dark:bg-[#e8816a]/10 dark:text-[#e8816a]">
              Always evolving
            </span>
          </div>

          <div className="relative z-1 mt-6 grid gap-4 md:grid-cols-2">
            {[
              [
                'Structured beginning',
                'AI creates a practical first version from the community’s shared learning goal.',
              ],
              [
                'Learning guild',
                'People following the tracker discuss, practise, support, and challenge one another.',
              ],
              [
                'Open contribution',
                'Learners propose a missing topic or a better step when experience reveals a gap.',
              ],
              [
                'Verified evolution',
                'Trusted contributions strengthen the tracker and benefit everyone who follows it.',
              ],
            ].map(([title, body], index) => (
              <article
                key={title}
                className="landing-float rounded-3xl border border-[#e0d0c5] bg-[#f5ede4]/60 p-5 dark:border-white/10 dark:bg-white/5.5"
                style={{ animationDelay: `${index * -0.6}s` }}
              >
                <div className="mb-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#b84c2b] font-['DM_Mono',monospace] text-[11px] font-bold text-[#fdf8f5] dark:bg-[#e8816a] dark:text-[#141412]">
                  {index + 1}
                </div>
                <h4 className="font-['Playfair_Display',serif] text-3xl font-extrabold tracking-tighter">
                  {title}
                </h4>
                <p className="mt-3 text-[13px] leading-[1.65] text-[#6b5f58] dark:text-[#b8b4aa]">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
