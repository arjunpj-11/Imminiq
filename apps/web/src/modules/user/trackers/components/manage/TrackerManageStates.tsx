import EmptyState from '../../../../../components/feedback/EmptyState';
import SkeletonBlock from '../../../../../components/feedback/SkeletonBlock';
import Button from '../../../../../components/ui/Button';

export function TrackerManageLoadingState() {
  return (
    <div className="min-h-105 rounded-lg border border-(--border-subtle) bg-(--surface-card) p-6 shadow-[0_4px_24px_rgba(26,23,20,0.07)] dark:border-white/15 dark:bg-(--surface-card)">
      <div className="mx-auto flex max-w-lg flex-col items-center py-16 text-center">
        <div className="mb-5 h-10 w-10 animate-spin rounded-full border-2 border-transparent border-t-(--brand-500) dark:border-t-(--brand-500)" />
        <SkeletonBlock className="h-7 w-56" />
        <SkeletonBlock className="mt-3 h-4 w-full max-w-sm" />
      </div>
    </div>
  );
}

export function TrackerManageEmptyState({ message }: { message: string }) {
  return (
    <EmptyState
      title="Tracker unavailable"
      description={message}
      action={
        <Button variant="secondary" onClick={() => window.history.back()}>
          Go Back
        </Button>
      }
      className="min-h-80 border-solid shadow-[0_4px_24px_rgba(26,23,20,0.07)]"
    />
  );
}
