import { AlertIcon, SpinnerIcon } from "./icons/FriendsIcons";

interface IEmptyStateProps {
  title: string;
  message: string;
}

export const FriendsEmptyState = ({ title, message }: IEmptyStateProps) => (
  <div className="rounded-lg border border-dashed border-(--border-subtle) px-5 py-10 text-center dark:border-(--border-subtle)">
    <p className="font-ui text-[19px] font-extrabold text-(--text-primary) dark:text-(--text-primary)">
      {title}
    </p>
    <p className="mx-auto mt-2 max-w-sm text-[13px] leading-[1.6] text-(--text-secondary) dark:text-(--text-secondary)">
      {message}
    </p>
  </div>
);

interface IErrorStateProps {
  message?: string | undefined;
  onRetry?: () => void;
}

export const FriendsErrorState = ({
  message = "We could not load your friends right now.",
  onRetry,
}: IErrorStateProps) => (
  <div
    role="alert"
    className="rounded-lg border border-[rgba(217,69,53,0.22)] bg-[rgba(217,69,53,0.06)] px-5 py-8 text-center dark:border-[rgba(255,107,95,0.2)] dark:bg-[rgba(255,107,95,0.06)]"
  >
    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(217,69,53,0.1)] text-(--danger) dark:text-(--danger)">
      <AlertIcon />
    </div>
    <p className="mt-3 font-ui text-[18px] font-extrabold">
      Something went wrong
    </p>
    <p className="mx-auto mt-2 max-w-md text-[13px] leading-6 text-(--text-secondary) dark:text-(--text-secondary)">
      {message}
    </p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-md bg-(--brand-500) px-4 py-2 text-[12px] font-bold text-white transition hover:bg-(--brand-600) dark:bg-(--brand-500) dark:text-[#141412] dark:hover:bg-(--brand-600)"
      >
        Try again
      </button>
    )}
  </div>
);

export const FriendsActionError = ({
  message,
}: {
  message?: string | undefined;
}) => {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-xl border border-[rgba(217,69,53,0.22)] bg-[rgba(217,69,53,0.06)] px-4 py-3 text-[12px] leading-5 text-[#a9362c] dark:border-[rgba(255,107,95,0.2)] dark:bg-[rgba(255,107,95,0.06)] dark:text-[#ff8a80]"
    >
      <AlertIcon className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
};

export const FriendsLoadMoreButton = ({
  loading,
  onClick,
  label = "Load more",
}: {
  loading: boolean;
  onClick: () => void;
  label?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={loading}
    className="mx-auto inline-flex min-h-10 items-center justify-center gap-2 rounded-md border-[1.5px] border-(--border-subtle) bg-(--surface-card) px-5 py-2.5 text-[12px] font-bold text-(--text-secondary) transition hover:border-[rgba(184,76,43,0.3)] hover:text-(--brand-500) disabled:cursor-not-allowed disabled:opacity-55 dark:border-(--border-subtle) dark:bg-(--surface-card) dark:text-(--text-secondary) dark:hover:text-(--brand-500)"
  >
    {loading && <SpinnerIcon className="animate-spin" />}
    {loading ? "Loading…" : label}
  </button>
);

const SkeletonBlock = ({ className }: { className: string }) => (
  <div
    className={`animate-pulse rounded-xl bg-[#e8ddd6] dark:bg-white/8 ${className}`}
  />
);

export const FriendsListSkeleton = ({ count = 4 }: { count?: number }) => (
  <div
    className="grid gap-3 sm:grid-cols-2"
    role="status"
    aria-label="Loading friends"
  >
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        className="flex items-center gap-3.5 rounded-lg border border-[#e8ddd6] bg-white/45 p-4 dark:border-white/8 dark:bg-white/3"
      >
        <SkeletonBlock className="h-11 w-11 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <SkeletonBlock className="h-3.5 w-3/5" />
          <SkeletonBlock className="h-3 w-2/5" />
          <SkeletonBlock className="h-4 w-24 rounded-full" />
        </div>
      </div>
    ))}
  </div>
);

export const FriendsRequestsSkeleton = () => (
  <div className="space-y-3" role="status" aria-label="Loading friend invites">
    {Array.from({ length: 3 }).map((_, index) => (
      <div
        key={index}
        className="flex items-center gap-3.5 rounded-lg border border-[#e8ddd6] bg-white/45 p-4 dark:border-white/8 dark:bg-white/3"
      >
        <SkeletonBlock className="h-11 w-11 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <SkeletonBlock className="h-3.5 w-2/5" />
          <SkeletonBlock className="h-3 w-1/3" />
        </div>
        <SkeletonBlock className="h-9 w-28" />
      </div>
    ))}
  </div>
);
