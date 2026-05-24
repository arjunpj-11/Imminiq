export default function IntroSection() {
  const words =
    'Imminiq is built for learners who want structure, pressure, and feedback in one place. Start with a goal, generate a path, learn with AI, practice with intent, and keep improving until the skill becomes yours.'.split(
      ' '
    )

  return (
    <section id="system" className="min-h-screen bg-[#f5ede4] px-4 py-24 text-[#1a1714] dark:bg-[#141412] dark:text-[#f2f0eb] sm:px-8 lg:px-10">
      <div className="mx-auto max-w-340">
        <h2 className="max-w-285 font-['Playfair_Display',serif] text-[clamp(34px,6vw,76px)] font-extrabold leading-[1.02] tracking-[-0.06em]">
          <span className="mr-10 inline-block -translate-y-3 overflow-hidden font-['DM_Mono',monospace] text-[11px] uppercase tracking-[0.18em] text-[#b84c2b] dark:text-[#e8816a] lg:mr-80">
            <span className="landing-reveal block">What it is</span>
          </span>
          <span>
            {words.map((word, index) => (
              <span key={`${word}-${index}`} className="mr-3 inline-block overflow-hidden">
                <span className="landing-reveal inline-block" style={{ '--delay': `${Math.min(index * 18, 520)}ms` } as React.CSSProperties}>
                  {word}
                </span>
              </span>
            ))}
          </span>
        </h2>

        <div className="mt-20 grid gap-4 md:grid-cols-3">
          {[
            ['No fake promises', 'Launch-safe product messaging without inflated counts or demo achievements.'],
            ['Built around action', 'Lessons, coding, answers, roadmaps, and practice are part of one learning loop.'],
            ['Theme-native', 'Warm Imminiq cream, rust, blue, green, amber, and deep dark mode.'],
          ].map(([title, body], index) => (
            <article
              key={title}
              className="landing-reveal rounded-3xl border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-6 shadow-[0_16px_54px_rgba(26,23,20,0.08)] dark:border-white/9 dark:bg-[#1e1c19]"
              style={{ '--delay': `${index * 120}ms` } as React.CSSProperties}
            >
              <div className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.16em] text-[#b84c2b] dark:text-[#e8816a]">0{index + 1}</div>
              <h3 className="mt-5 font-['Playfair_Display',serif] text-3xl font-extrabold tracking-[-0.04em]">{title}</h3>
              <p className="mt-3 text-[14px] leading-[1.65] text-[#6b5f58] dark:text-[#9b9a92]">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
