import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import FormField from '../../../../components/forms/FormField';
import Input from '../../../../components/forms/Input';
import Select from '../../../../components/forms/Select';
import Textarea from '../../../../components/forms/Textarea';
import { AppShellBoundary } from '../../../../components/layout/AppShell';
import SectionHeader from '../../../../components/layout/SectionHeader';
import { cn } from '../../../../lib/cn';
import { getUserFacingError } from '../../../../lib/user-facing-error';
import { ROUTES } from '../../../../routes/config/route-paths';
import { safeLocalStorage } from '../../../../lib/storage/safe-storage';
import { STORAGE_KEYS } from '../../../../lib/storage/storage-keys';
import {
  parseTrackerOutlineJson,
  trackerOutlineExample,
  trackerOutlineTitleRules,
  validateTrackerTitle,
  DomainCombobox,
  useCreateTracker,
  useImportTrackerOutline,
  type TrackerLevel,
} from '../../trackers';

const fieldClass =
  'w-full rounded-xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) px-4 py-3 text-sm outline-none transition focus:border-(--brand-500) focus:ring-3 focus:ring-[rgba(184,76,43,.12)]';
const formFieldClass = 'grid gap-1.5';
const formLabelClass = 'mb-0 text-xs font-bold text-(--text-secondary)';

type ManualTrackerDraft = {
  title?: string;
  description?: string;
  goal?: string;
  domain?: string;
  level?: TrackerLevel;
  outlineJson?: string;
};

const readDraft = (): ManualTrackerDraft => {
  try {
    return JSON.parse(
      safeLocalStorage.get(STORAGE_KEYS.trackerCreationDraft) ?? '{}'
    ) as ManualTrackerDraft;
  } catch {
    return {};
  }
};

export default function ManualTrackerCreationPage() {
  const navigate = useNavigate();
  const createTracker = useCreateTracker();
  const importOutline = useImportTrackerOutline();
  const [draft] = useState(readDraft);
  const [title, setTitle] = useState(draft.title ?? '');
  const [description, setDescription] = useState(draft.description ?? '');
  const [goal, setGoal] = useState(draft.goal ?? '');
  const [domain, setDomain] = useState(draft.domain ?? 'development');
  const [level, setLevel] = useState<TrackerLevel>(draft.level ?? 'beginner');
  const [outlineJson, setOutlineJson] = useState(draft.outlineJson ?? '');
  const [outlineFileName, setOutlineFileName] = useState<string | null>(null);
  const [showOutlineRules, setShowOutlineRules] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pending = createTracker.isPending || importOutline.isPending;
  const titleError = title ? validateTrackerTitle(title) : null;

  useEffect(() => {
    safeLocalStorage.set(
      STORAGE_KEYS.trackerCreationDraft,
      JSON.stringify({ title, description, goal, domain, level, outlineJson })
    );
  }, [description, domain, goal, level, outlineJson, title]);

  const submit = async () => {
    const invalidTitle = validateTrackerTitle(title);
    if (invalidTitle || pending) {
      setError(invalidTitle);
      return;
    }

    let topics: ReturnType<typeof parseTrackerOutlineJson> | null = null;
    if (outlineJson.trim()) {
      try {
        topics = parseTrackerOutlineJson(outlineJson);
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : 'Unable to read this JSON outline. Check its structure and try again.'
        );
        return;
      }
    }

    try {
      setError(null);
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
      safeLocalStorage.remove(STORAGE_KEYS.trackerCreationDraft);
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
          <p className="font-mono text-[10px] font-bold uppercase tracking-[.16em] text-(--brand-500)">
            Manual builder · draft saved locally
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
            <SectionHeader title="Tracker details" className="mb-0" />
            <div className="mt-5 grid gap-4">
              <FormField
                label="Tracker title"
                required
                className={formFieldClass}
                labelClassName={formLabelClass}
              >
                <Input
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setError(null);
                  }}
                  className={fieldClass}
                  placeholder="e.g. Master TypeScript"
                  maxLength={120}
                  required
                  aria-invalid={Boolean(titleError)}
                  aria-describedby={titleError ? 'tracker-title-error' : undefined}
                />
              </FormField>
              {titleError && (
                <p id="tracker-title-error" className="-mt-2 text-xs font-semibold text-red-600">
                  {titleError}
                </p>
              )}
              <FormField
                label="Description"
                className={formFieldClass}
                labelClassName={formLabelClass}
              >
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={cn(fieldClass, 'min-h-24')}
                  placeholder="What will this tracker cover?"
                />
              </FormField>
              <FormField
                label="Learning goal"
                className={formFieldClass}
                labelClassName={formLabelClass}
              >
                <Textarea
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className={cn(fieldClass, 'min-h-20')}
                  placeholder="What should learners be able to do?"
                />
              </FormField>
              <FormField label="Domain" className={formFieldClass} labelClassName={formLabelClass}>
                <DomainCombobox
                  inputId="manual-tracker-domain"
                  value={domain}
                  disabled={pending}
                  onChange={setDomain}
                />
              </FormField>
              <FormField
                label="Difficulty"
                className={formFieldClass}
                labelClassName={formLabelClass}
              >
                <Select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as TrackerLevel)}
                  className={fieldClass}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </Select>
              </FormField>
            </div>
          </section>

          <section className="rounded-2xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-5 shadow-(--shadow-1) sm:p-6">
            <SectionHeader
              title={
                <>
                  JSON outline{' '}
                  <span className="text-sm font-normal text-(--text-secondary)">(optional)</span>
                </>
              }
              description={
                <>
                  Supports recursive <code>subtopics</code> or <code>children</code>.
                </>
              }
              action={
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setShowOutlineRules((current) => !current)}
                    aria-expanded={showOutlineRules}
                    aria-controls="manual-json-rules"
                    className={cn(
                      'rounded-lg border px-3 py-2 text-[11px] font-bold transition',
                      showOutlineRules
                        ? 'border-(--brand-500) bg-[rgba(184,76,43,.08)] text-(--brand-500)'
                        : 'border-(--border-subtle) hover:border-(--brand-500)'
                    )}
                  >
                    {showOutlineRules ? 'Hide rules' : 'JSON rules'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOutlineJson(trackerOutlineExample);
                      setOutlineFileName(null);
                      setError(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="rounded-lg border border-(--border-subtle) px-3 py-2 text-[11px] font-bold hover:border-(--brand-500)"
                  >
                    Use example
                  </button>
                </div>
              }
              className="mb-0"
            />
            {showOutlineRules && (
              <div
                id="manual-json-rules"
                className="mt-5 overflow-hidden rounded-xl border border-(--border-subtle)"
              >
                <div className="border-b border-(--border-subtle) bg-(--surface-muted) px-4 py-3">
                  <h3 className="text-xs font-bold text-(--text-primary)">Required title fields</h3>
                  <p className="mt-1 text-[11px] leading-5 text-(--text-secondary)">
                    Each layer owns a <code>title</code>. Do not put titles in a{' '}
                    <code>titleHandler</code> field.
                  </p>
                </div>
                <div className="grid grid-cols-[112px_minmax(0,1fr)] text-[11px]">
                  <div className="border-b border-r border-(--border-subtle) px-3 py-2 font-mono text-[9px] font-bold uppercase tracking-widest text-(--text-secondary)">
                    Layer
                  </div>
                  <div className="border-b border-(--border-subtle) px-3 py-2 font-mono text-[9px] font-bold uppercase tracking-widest text-(--text-secondary)">
                    Required JSON path
                  </div>
                  {trackerOutlineTitleRules.map((rule) => (
                    <div key={rule.level} className="contents">
                      <div className="border-b border-r border-(--border-subtle) px-3 py-3 font-semibold text-(--text-primary)">
                        {rule.level}
                      </div>
                      <div className="min-w-0 border-b border-(--border-subtle) px-3 py-3">
                        <code className="break-all text-[10px] text-(--brand-500)">
                          {rule.path}
                        </code>
                        <span className="mt-1 block text-[10px] text-(--text-secondary)">
                          {rule.purpose}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <ul className="grid gap-1.5 px-4 py-3 text-[11px] leading-5 text-(--text-secondary)">
                  <li>
                    • Start with <code>{'{ "topics": [...] }'}</code> or a direct topics array.
                  </li>
                  <li>
                    • Every item needs a non-empty <code>title</code>, up to 120 characters.
                  </li>
                  <li>
                    • <code>description</code> is optional. Put children in a <code>subtopics</code>{' '}
                    array and use <code>[]</code> when there are none.
                  </li>
                  <li>• The outline can contain up to 250 items and 8 nested levels.</li>
                </ul>
              </div>
            )}
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
            <Textarea
              value={outlineJson}
              onChange={(e) => {
                setOutlineJson(e.target.value);
                setOutlineFileName(null);
                setError(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className={cn(fieldClass, 'mt-4 min-h-96 font-mono text-[11px] leading-5')}
              placeholder={trackerOutlineExample}
              aria-describedby={showOutlineRules ? 'manual-json-rules' : undefined}
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
