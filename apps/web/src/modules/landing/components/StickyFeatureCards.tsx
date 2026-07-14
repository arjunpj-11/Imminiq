import { featureCards } from '../constants/landing.constants';
import { cn } from '../utils/landing-ui';

const toneClasses = {
  rust: 'text-[#b84c2b] dark:text-[#e8816a] bg-[rgba(184,76,43,0.08)] border-[rgba(184,76,43,0.18)] dark:bg-[rgba(232,129,106,0.10)] dark:border-[rgba(232,129,106,0.24)]',
  blue: 'text-[#3b6cb7] dark:text-[#6b9fe8] bg-[rgba(59,108,183,0.08)] border-[rgba(59,108,183,0.18)] dark:bg-[rgba(107,159,232,0.10)] dark:border-[rgba(107,159,232,0.24)]',
  green:
    'text-[#2d6a47] dark:text-[#5cc98a] bg-[rgba(45,106,71,0.08)] border-[rgba(45,106,71,0.18)] dark:bg-[rgba(92,201,138,0.10)] dark:border-[rgba(92,201,138,0.24)]',
  amber:
    'text-[#8a6200] dark:text-[#f0a842] bg-[rgba(138,98,0,0.08)] border-[rgba(138,98,0,0.18)] dark:bg-[rgba(240,168,66,0.10)] dark:border-[rgba(240,168,66,0.24)]',
};

export default function StickyFeatureCards() {
  return (
    <section className="bg-[#f5ede4] px-4 py-16 text-[#1a1714] dark:bg-[#141412] dark:text-[#f2f0eb] sm:px-8 lg:px-10">
      <div className="mx-auto max-w-340">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-['DM_Mono',monospace] text-[10px] uppercase tracking-[0.18em] text-[#b84c2b] dark:text-[#e8816a]">
              Product stack
            </p>
            <h2 className="mt-3 max-w-170 font-['Playfair_Display',serif] text-[clamp(38px,7vw,86px)] font-extrabold leading-[0.95] tracking-[-0.07em]">
              Four loops, one learning system.
            </h2>
          </div>
          <p className="max-w-94 text-[14px] leading-[1.7] text-[#6b5f58] dark:text-[#9b9a92]">
            Sticky cards stack vertically like your reference design, but the content is fully
            Imminiq-focused and launch-safe.
          </p>
        </div>

        <div className="relative min-h-screen">
          {featureCards.map((card, index) => (
            <article
              key={card.title}
              className="sticky top-0 mb-5 flex min-h-screen flex-col justify-between overflow-hidden rounded-[34px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 shadow-[0_28px_90px_rgba(26,23,20,0.12)] dark:border-white/9 dark:bg-[#1e1c19] md:flex-row md:p-8"
              style={{ zIndex: index + 1 }}
            >
              <div className="flex flex-[0.38] justify-between gap-4">
                <span className="font-['Playfair_Display',serif] text-[clamp(74px,12vw,150px)] font-black leading-none tracking-[-0.08em]">
                  {card.number}
                </span>
                <h3 className="max-w-42 text-right text-[22px] font-bold tracking-[-0.04em] md:text-left">
                  {card.title}
                </h3>
              </div>

              <div className="flex flex-[0.48] flex-col justify-between gap-8 pt-10 md:pt-0">
                <p className="font-['Playfair_Display',serif] text-[clamp(30px,4vw,54px)] font-extrabold leading-[1.02] tracking-[-0.06em]">
                  {card.description}
                </p>

                <div className="landing-float h-48 w-full overflow-hidden rounded-3xl border border-[#e0d0c5] bg-[#141412] p-5 dark:border-white/10">
                  <div className="grid h-full grid-cols-5 gap-2 opacity-80">
                    {Array.from({ length: 20 }).map((_, itemIndex) => (
                      <span
                        key={itemIndex}
                        className={cn(
                          'rounded-xl border',
                          itemIndex % 3 === 0
                            ? toneClasses[card.tone as keyof typeof toneClasses]
                            : 'border-white/8 bg-white/5'
                        )}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {card.items.map((item) => (
                    <span
                      key={item}
                      className={cn(
                        "rounded-full border px-4 py-2 font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.12em]",
                        toneClasses[card.tone as keyof typeof toneClasses]
                      )}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
