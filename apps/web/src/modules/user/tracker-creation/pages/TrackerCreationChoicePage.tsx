import { useNavigate } from 'react-router';

import { AppShellBoundary } from '../../../../components/layout/AppShell';
import { ROUTES } from '../../../../routes/config/route-paths';

export default function TrackerCreationChoicePage() {
  const navigate = useNavigate();
  return (
    <AppShellBoundary>
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 py-10 sm:px-6 md:px-10">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[.18em] text-(--brand-500)">
          New tracker
        </p>
        <h1 className="mt-2 max-w-2xl font-serif text-[clamp(34px,6vw,62px)] font-extrabold leading-[.98] tracking-[-.04em]">
          How would you like to build it?
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-(--text-secondary)">
          Start from your own outline, import recursive JSON, or let the learning agent design the
          roadmap with you.
        </p>

        <div className="mt-9 grid gap-5 md:grid-cols-2">
          <button
            type="button"
            onClick={() => navigate(ROUTES.trackerCreateManual)}
            className="group min-h-64 rounded-3xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-7 text-left shadow-(--shadow-1) transition hover:-translate-y-1 hover:border-(--brand-500) hover:shadow-(--shadow-2)"
          >
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[rgba(184,76,43,.12)] text-2xl">
              ✍
            </span>
            <h2 className="mt-8 font-serif text-3xl font-bold">Create manually</h2>
            <p className="mt-3 text-sm leading-6 text-(--text-secondary)">
              Create the tracker yourself, paste a full JSON outline if you have one, then add
              topics and nested subtopics at any depth.
            </p>
            <span className="mt-7 inline-flex font-mono text-[10px] font-bold uppercase tracking-[.16em] text-(--brand-500)">
              Open manual builder →
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate(ROUTES.trackerCreateAi)}
            className="group min-h-64 rounded-3xl border-[1.5px] border-[#1a1714] bg-[#1a1714] p-7 text-left text-[#fffaf5] shadow-(--shadow-2) transition hover:-translate-y-1 dark:border-white/15 dark:bg-[#0f0e0c]"
          >
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-2xl">
              ✦
            </span>
            <h2 className="mt-8 font-serif text-3xl font-bold">Create using AI</h2>
            <p className="mt-3 text-sm leading-6 text-white/65">
              Tell the learning agent your goal and level. It will research, structure, and prepare
              the roadmap for your review.
            </p>
            <span className="mt-7 inline-flex font-mono text-[10px] font-bold uppercase tracking-[.16em] text-[#f4c95d]">
              Start with AI →
            </span>
          </button>
        </div>
      </div>
    </AppShellBoundary>
  );
}
