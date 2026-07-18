export default function IntroSection() {
  const words =
    'Imminiq brings personalized roadmaps, AI-guided lessons, collaborative guilds, live challenges, mock tests, and progress intelligence into one focused learning system.'.split(
      ' '
    );

  return (
    <section
      id="system"
      className="render-lazy-section bg-[#f5ede4] px-4 py-18 text-[#1a1714] dark:bg-[#141412] dark:text-[#f2f0eb] sm:px-8 sm:py-24 lg:px-10"
    >
      <div className="mx-auto max-w-340">
        <h2 className="max-w-285 font-['Playfair_Display',serif] text-[clamp(34px,6vw,76px)] font-extrabold leading-[1.02] tracking-[-0.06em]">
          <span className="mr-10 inline-block -translate-y-3 overflow-hidden font-['DM_Mono',monospace] text-[11px] uppercase tracking-[0.18em] text-[#b84c2b] dark:text-[#e8816a] lg:mr-80">
            <span className="landing-reveal block">What it is</span>
          </span>
          <span>
            {words.map((word, index) => (
              <span key={`${word}-${index}`} className="mr-3 inline-block overflow-hidden">
                <span
                  className="landing-reveal inline-block"
                  style={{ '--delay': `${Math.min(index * 18, 520)}ms` } as React.CSSProperties}
                >
                  {word}
                </span>
              </span>
            ))}
          </span>
        </h2>

        <div className="mt-12 grid gap-4 sm:mt-20 md:grid-cols-3">
          {[
            [
              'Personal by design',
              'Every roadmap begins with your goal, level, pace, language, and learning preferences.',
            ],
            [
              'Built for active learning',
              'Lessons, voice input, coding, answer checks, revision, and mock tests reinforce one another.',
            ],
            ['Better together', 'Guilds let learners collaborate on roadmaps, contribute safely, and compete in real time.'],
          ].map(([title, body], index) => (
            <article
              key={title}
              className="landing-reveal rounded-3xl border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-6 shadow-[0_16px_54px_rgba(26,23,20,0.08)] dark:border-white/9 dark:bg-[#1e1c19]"
              style={{ '--delay': `${index * 120}ms` } as React.CSSProperties}
            >
              <div className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.16em] text-[#b84c2b] dark:text-[#e8816a]">
                0{index + 1}
              </div>
              <h3 className="mt-5 font-['Playfair_Display',serif] text-3xl font-extrabold tracking-[-0.04em]">
                {title}
              </h3>
              <p className="mt-3 text-[14px] leading-[1.65] text-[#6b5f58] dark:text-[#9b9a92]">
                {body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
