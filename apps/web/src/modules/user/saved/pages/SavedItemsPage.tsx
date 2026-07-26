import { Bookmark, BookOpen, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router';

import { AppShellBoundary } from '../../../../components/layout/AppShell';
import PageContainer from '../../../../components/layout/PageContainer';
import PageHeader from '../../../../components/layout/PageHeader';
import { ROUTES } from '../../../../routes/config/route-paths';
import { useSavedItemsStore } from '../../../../store/useSavedItemsStore';

export default function SavedItemsPage() {
  const [search, setSearch] = useState('');
  const trackers = useSavedItemsStore((state) => state.trackers);
  const lessons = useSavedItemsStore((state) => state.lessons);
  const toggleTracker = useSavedItemsStore((state) => state.toggleTracker);
  const toggleLesson = useSavedItemsStore((state) => state.toggleLesson);
  const normalizedSearch = search.trim().toLowerCase();
  const filteredTrackers = useMemo(
    () =>
      trackers.filter((item) =>
        `${item.title} ${item.description}`.toLowerCase().includes(normalizedSearch)
      ),
    [normalizedSearch, trackers]
  );
  const filteredLessons = useMemo(
    () =>
      lessons.filter((item) =>
        `${item.lessonTitle} ${item.trackerTitle}`.toLowerCase().includes(normalizedSearch)
      ),
    [lessons, normalizedSearch]
  );
  const empty = trackers.length === 0 && lessons.length === 0;

  return (
    <AppShellBoundary>
      <PageContainer>
        <PageHeader
          eyebrow="Your library"
          title="Saved"
          description="Return to the trackers and lessons you bookmarked for later."
        />
        <div className="mb-6 max-w-2xl rounded-2xl border border-(--border-subtle) bg-(--surface-card) p-3 shadow-(--shadow-1)">
          <label className="flex min-w-0 items-center gap-3 rounded-xl border border-(--border-subtle) bg-(--surface-elevated) px-4 transition focus-within:border-(--brand-500)">
            <Search size={17} className="shrink-0 text-(--text-muted)" aria-hidden="true" />
            <span className="sr-only">Search saved items</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search saved trackers and lessons"
              className="min-h-11 w-full min-w-0 bg-transparent text-[13px] outline-none"
            />
          </label>
        </div>

        {empty ? (
          <div className="rounded-3xl border border-dashed border-(--border-subtle) bg-(--surface-card) px-6 py-16 text-center">
            <Bookmark size={34} className="mx-auto text-(--brand-500)" />
            <h2 className="mt-4 text-xl font-extrabold">Save what you want to revisit</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-(--text-secondary)">
              Bookmark useful community trackers and lessons to keep them close at hand.
            </p>
            <Link
              to={ROUTES.community}
              className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-(--brand-500) px-5 text-sm font-bold text-(--brand-contrast) no-underline"
            >
              Browse trackers
            </Link>
          </div>
        ) : (
          <div className="grid items-start gap-6 md:grid-cols-2">
            <SavedSection
              title="Trackers"
              icon={<Bookmark size={17} />}
              count={filteredTrackers.length}
            >
              {filteredTrackers.map((tracker) => (
                <SavedCard
                  key={tracker.id}
                  title={tracker.title}
                  description={tracker.description}
                  to={ROUTES.communityTracker(tracker.id)}
                  onRemove={() => toggleTracker(tracker)}
                />
              ))}
            </SavedSection>

            <SavedSection
              title="Lessons"
              icon={<BookOpen size={17} />}
              count={filteredLessons.length}
            >
              {filteredLessons.map((lesson) => (
                <SavedCard
                  key={`${lesson.trackerId}:${lesson.subtopicId}`}
                  title={lesson.lessonTitle}
                  description={lesson.trackerTitle}
                  to={ROUTES.trackerLesson(lesson.trackerId, lesson.subtopicId)}
                  onRemove={() => toggleLesson(lesson)}
                />
              ))}
            </SavedSection>
          </div>
        )}
      </PageContainer>
    </AppShellBoundary>
  );
}

function SavedSection({
  title,
  icon,
  count,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-(--border-subtle) bg-(--surface-card) p-4 shadow-(--shadow-1)">
      <header className="mb-4 flex items-center gap-2">
        <span className="text-(--brand-500)">{icon}</span>
        <h2 className="m-0 flex-1 text-base font-extrabold">{title}</h2>
        <span className="rounded-full bg-(--surface-muted) px-2 py-1 text-[11px] font-bold text-(--text-muted)">
          {count}
        </span>
      </header>
      <div className="space-y-2">
        {count ? (
          children
        ) : (
          <p className="py-8 text-center text-sm text-(--text-muted)">Nothing matches this view.</p>
        )}
      </div>
    </section>
  );
}

function SavedCard({
  title,
  description,
  to,
  onRemove,
}: {
  title: string;
  description: string;
  to: string;
  onRemove?: () => void;
}) {
  return (
    <article className="rounded-xl border border-(--border-subtle) bg-(--surface-elevated) p-3">
      <Link to={to} className="block min-w-0 no-underline">
        <h3 className="m-0 line-clamp-2 text-sm font-bold text-(--text-primary)">{title}</h3>
        <p className="mb-0 mt-1 line-clamp-2 text-xs text-(--text-secondary)">{description}</p>
      </Link>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="mt-2 min-h-9 text-xs font-bold text-(--brand-500)"
        >
          Remove
        </button>
      )}
    </article>
  );
}
