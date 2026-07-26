import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { AppShellBoundary } from '../../../../components/layout/AppShell';
import { cn } from '../../../../lib/cn';
import { getUserFacingError } from '../../../../lib/user-facing-error';
import { ROUTES } from '../../../../routes/config/route-paths';
import {
  parseTrackerOutlineJson,
  trackerOutlineExample,
  validateTrackerTitle,
  DomainCombobox,
  useCreateTracker,
  useImportTrackerOutline,
  type TrackerLevel,
} from '../../trackers';

const inputClass =
  'w-full rounded-xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) px-4 py-3 text-sm outline-none transition focus:border-(--brand-500) focus:ring-3 focus:ring-[rgba(184,76,43,.12)]';

export default function ManualTrackerCreationPage() {
  const navigate = useNavigate();
  const createTracker = useCreateTracker();
  const importOutline = useImportTrackerOutline();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('');
  const [domain, setDomain] = useState('development');
  const [level, setLevel] = useState<TrackerLevel>('beginner');
  const [outlineJson, setOutlineJson] = useState('');
  const [outlineFileName, setOutlineFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pending = createTracker.isPending || importOutline.isPending;
  const titleError = title ? validateTrackerTitle(title) : null;

  const submit = async () => {
    const invalidTitle = validateTrackerTitle(title);
    if (invalidTitle || pending) {
      setError(invalidTitle);
      return;
    }
    try {
      setError(null);
      const topics = outlineJson.trim() ? parseTrackerOutlineJson(outlineJson) : null;
      const response = await createTracker.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        goal: goal.trim(),
        domain,
        level,
      });
      const trackerId = response.data._id;
      if (topics)
        await importOutline.mutateAsync({
          trackerId,
          kind: 'topics',
          topics,
          uploadAsFile: Boolean(outlineFileName),
        });
      navigate(ROUTES.trackerManage(trackerId), { replace: true });
    } catch (cause) {
      setError(
        getUserFacingError(
          cause,
          'Unable to create this tracker. Your JSON may need a small correction.'
        )
      );
    }
  };

  return (
    <AppShellBoundary>
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 pb-28 sm:px-6 md:px-10">
        <button
          type="button"
          onClick={() => navigate(ROUTES.trackerCreate)}
          className="text-xs font-bold text-(--text-secondary) hover:text-(--brand-500)"
        >
          ← Creation options
        </button>
        <div className="mt-5">
          <p className="font-mono text-[9px] font-bold uppercase tracking-[.16em] text-(--brand-500)">
            Manual builder
          </p>
          <h1 className="mt-2 font-serif text-4xl font-extrabold tracking-[-.04em] sm:text-5xl">
            Build the tracker your way
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-(--text-secondary)">
            Create an empty tracker and continue in Manage, or paste a complete recursive JSON
            outline to create every topic and nested subtopic in one flow.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-200">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
          <section className="rounded-2xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-5 shadow-(--shadow-1) sm:p-6">
            <h2 className="font-serif text-2xl font-bold">Tracker details</h2>
            <div className="mt-5 grid gap-4">
              <label className="grid gap-1.5 text-xs font-bold text-(--text-secondary)">
                Tracker title
                <input
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setError(null);
                  }}
                  className={inputClass}
                  placeholder="e.g. Master TypeScript"
                  maxLength={120}
                  required
                  aria-invalid={Boolean(titleError)}
                  aria-describedby={titleError ? 'tracker-title-error' : undefined}
                />
              </label>
              {titleError && (
                <p id="tracker-title-error" className="-mt-2 text-xs font-semibold text-red-600">
                  {titleError}
                </p>
              )}
              <label className="grid gap-1.5 text-xs font-bold text-(--text-secondary)">
                Description
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={cn(inputClass, 'min-h-24 resize-y')}
                  placeholder="What will this tracker cover?"
                />
              </label>
              <label className="grid gap-1.5 text-xs font-bold text-(--text-secondary)">
                Learning goal
                <textarea
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className={cn(inputClass, 'min-h-20 resize-y')}
                  placeholder="What should learners be able to do?"
                />
              </label>
              <div className="grid gap-1.5 text-xs font-bold text-(--text-secondary)">
                <label htmlFor="manual-tracker-domain">Domain</label>
                <DomainCombobox
                  inputId="manual-tracker-domain"
                  value={domain}
                  disabled={pending}
                  onChange={setDomain}
                />
              </div>
              <label className="grid gap-1.5 text-xs font-bold text-(--text-secondary)">
                Difficulty
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as TrackerLevel)}
                  className={inputClass}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </label>
            </div>
          </section>

          <section className="rounded-2xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-5 shadow-(--shadow-1) sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-serif text-2xl font-bold">
                  JSON outline{' '}
                  <span className="text-sm font-normal text-(--text-secondary)">(optional)</span>
                </h2>
                <p className="mt-1 text-xs text-(--text-secondary)">
                  Supports recursive <code>subtopics</code> or <code>children</code>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOutlineJson(trackerOutlineExample);
                  setOutlineFileName(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="rounded-lg border border-(--border-subtle) px-3 py-2 text-[11px] font-bold hover:border-(--brand-500)"
              >
                Use example
              </button>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-(--border-subtle) bg-(--surface-muted) p-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  if (file.size > 1024 * 1024) {
                    setError('The JSON file must be 1 MB or smaller.');
                    event.target.value = '';
                    return;
                  }
                  void file
                    .text()
                    .then((content) => {
                      parseTrackerOutlineJson(content);
                      setOutlineJson(content);
                      setOutlineFileName(file.name);
                      setError(null);
                    })
                    .catch((cause) => {
                      setOutlineFileName(null);
                      event.target.value = '';
                      setError(
                        cause instanceof Error
                          ? cause.message
                          : 'The selected JSON file could not be read.'
                      );
                    });
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg border border-(--border-subtle) bg-(--surface-card) px-3 py-2 text-[11px] font-bold hover:border-(--brand-500)"
              >
                Upload JSON file
              </button>
              <span className="min-w-0 truncate text-[11px] text-(--text-secondary)">
                {outlineFileName ?? 'Up to 1 MB; sent as a file to avoid request-size limits.'}
              </span>
            </div>
            <textarea
              value={outlineJson}
              onChange={(e) => {
                setOutlineJson(e.target.value);
                setOutlineFileName(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className={cn(inputClass, 'mt-4 min-h-96 resize-y font-mono text-[11px] leading-5')}
              placeholder={trackerOutlineExample}
              spellCheck={false}
            />
            <p className="mt-3 text-[11px] leading-5 text-(--text-secondary)">
              Leave this empty to create the tracker first and build its hierarchy manually in
              Manage.
            </p>
          </section>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(ROUTES.trackerCreate)}
            className="rounded-xl border border-(--border-subtle) px-5 py-3 text-sm font-bold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void submit()}
            disabled={Boolean(validateTrackerTitle(title)) || pending}
            className="rounded-xl bg-[#1a1714] px-6 py-3 text-sm font-bold text-white disabled:opacity-50 dark:bg-white dark:text-[#141412]"
          >
            {pending
              ? 'Creating roadmap...'
              : outlineJson.trim()
                ? 'Create & import outline'
                : 'Create & manage topics'}
          </button>
        </div>
      </div>
    </AppShellBoundary>
  );
}
