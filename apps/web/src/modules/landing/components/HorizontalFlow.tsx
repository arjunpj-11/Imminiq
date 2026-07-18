import { horizontalFlowCards } from '../constants/landing.constants';
import { useHorizontalScroll } from '../hooks/useHorizontalScroll';

export default function HorizontalFlow() {
  const { sectionRef, trackRef } = useHorizontalScroll();

  return (
    <section
      id="flow"
      ref={sectionRef}
      className="relative bg-[#f5ede4] text-[#1a1714] dark:bg-[#050505] dark:text-[#f2f0eb] md:h-[220vh]"
    >
      <div className="flex flex-col justify-center overflow-hidden px-4 py-18 sm:px-8 md:sticky md:top-0 md:h-screen lg:px-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="font-['DM_Mono',monospace] text-[10px] uppercase tracking-[0.18em] text-[#b84c2b] dark:text-[#e8816a]">
              Horizontal flow
            </p>
            <h2 className="mt-3 max-w-180 font-['Playfair_Display',serif] text-[clamp(38px,7vw,86px)] font-extrabold leading-[0.95] tracking-[-0.07em]">
              One goal. A complete learning loop.
            </h2>
          </div>
          <p className="max-w-86 text-[13px] leading-[1.7] text-[#6b5f58] dark:text-[#9b9a92]">
            Move from intention to a personalized path, collaborative practice, and measurable
            mastery without leaving your learning context.
          </p>
        </div>

        <div
          ref={trackRef}
          className="grid w-full gap-4 md:flex md:w-max md:will-change-transform"
        >
          {horizontalFlowCards.map((card, index) => (
            <article
              key={card.title}
              className="flex min-h-82 w-full shrink-0 flex-col justify-between rounded-[28px] border border-[#e0d0c5] bg-[#fdf8f5] p-6 shadow-[0_18px_54px_rgba(26,23,20,0.10)] dark:border-white/10 dark:bg-white/5.5 dark:shadow-[0_18px_54px_rgba(0,0,0,0.26)] backdrop-blur md:h-[54vh] md:w-[min(78vw,720px)] md:rounded-[34px] md:p-8 md:shadow-[0_28px_90px_rgba(26,23,20,0.12)]"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="font-['DM_Mono',monospace] text-[10px] uppercase tracking-[0.18em] text-[#b84c2b] dark:text-[#e8816a]">
                  {card.eyebrow}
                </span>
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#d8c7bc] bg-[#f5ede4] dark:border-white/12 dark:bg-white/6 font-['DM_Mono',monospace] text-[12px]">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
              <div>
                <h3 className="font-['Playfair_Display',serif] text-[clamp(42px,6vw,76px)] font-black leading-[0.92] tracking-[-0.07em]">
                  {card.title}
                </h3>
                <p className="mt-5 max-w-130 text-[15px] leading-[1.75] text-[#6b5f58] dark:text-[#d8d6cf]">
                  {card.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
