import SkeletonBlock from '../../../../components/feedback/SkeletonBlock';

interface ISettingsContentLoadingProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  variant?: 'appearance' | 'notifications' | 'privacy' | 'security';
}

function CardHeader() {
  return (
    <div className="mb-4 flex items-start gap-3">
      <SkeletonBlock className="h-9 w-9 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1">
        <SkeletonBlock className="h-6 w-44 rounded-lg" />
        <SkeletonBlock className="mt-2 h-3 w-[min(42rem,92%)]" />
        <SkeletonBlock className="mt-2 h-3 w-[min(34rem,76%)]" />
      </div>
    </div>
  );
}

function ToggleSkeleton() {
  return (
    <div className="flex items-center justify-between gap-5 border-t border-(--border-subtle) py-4 first:border-t-0">
      <div className="min-w-0 flex-1">
        <SkeletonBlock className="h-4 w-[min(18rem,65%)]" />
        <SkeletonBlock className="mt-2 h-3 w-[min(38rem,90%)]" />
      </div>
      <SkeletonBlock className="h-7 w-12 shrink-0 rounded-full" />
    </div>
  );
}

function SettingsCardSkeleton({ rows = 2, fields = false }: { rows?: number; fields?: boolean }) {
  return (
    <section className="surface-elevated p-5 max-[640px]:p-4">
      <CardHeader />
      {fields ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: rows }, (_, index) => (
            <div key={index}><SkeletonBlock className="h-3 w-28" /><SkeletonBlock className="mt-2 h-11 w-full rounded-md" /></div>
          ))}
        </div>
      ) : Array.from({ length: rows }, (_, index) => <ToggleSkeleton key={index} />)}
    </section>
  );
}

function SaveBarSkeleton() {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border-[1.5px] border-(--border-subtle) bg-(--surface-card) px-5 py-4 shadow-(--shadow-1)">
      <SkeletonBlock className="h-3 w-[min(25rem,80%)]" />
      <div className="flex gap-2"><SkeletonBlock className="h-10 w-20 rounded-md" /><SkeletonBlock className="h-10 w-32 rounded-md" /></div>
    </div>
  );
}

export default function SettingsContentLoading({
  title = 'Preparing settings',
  variant = 'security',
}: ISettingsContentLoadingProps) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" aria-label={title}>
      <span className="sr-only">{title}…</span>
      <div aria-hidden="true">
        {variant === 'appearance' && (
          <><SettingsCardSkeleton rows={3} fields /><SaveBarSkeleton /></>
        )}
        {variant === 'notifications' && (
          <><SettingsCardSkeleton rows={2} /><SaveBarSkeleton /></>
        )}
        {variant === 'privacy' && (
          <div className="space-y-5"><SettingsCardSkeleton rows={3} /><SaveBarSkeleton /><SettingsCardSkeleton rows={2} fields /></div>
        )}
        {variant === 'security' && (
          <div className="space-y-5">
            <SettingsCardSkeleton rows={4} fields />
            <SettingsCardSkeleton rows={3} fields />
            <SettingsCardSkeleton rows={3} />
            <SettingsCardSkeleton rows={2} fields />
            <SettingsCardSkeleton rows={3} />
          </div>
        )}
      </div>
    </div>
  );
}
