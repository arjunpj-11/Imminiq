import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

import { ADMIN_ROUTES, ROUTES } from '../../routes/config/route-paths';
import PageContainer from '../layout/PageContainer';
import SkeletonBlock from './SkeletonBlock';

type AppSkeletonKind =
  | 'dashboard'
  | 'profile'
  | 'cards'
  | 'detail'
  | 'settings'
  | 'table'
  | 'form'
  | 'editor'
  | 'lesson'
  | 'roadmap'
  | 'attempt'
  | 'workflow';

const S = ({ className }: { className: string }) => <SkeletonBlock className={className} />;

function SkeletonStatus({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" aria-label={label}>
      <span className="sr-only">{label}…</span>
      <div aria-hidden="true">{children}</div>
    </div>
  );
}

function PageHeadingSkeleton({ action = true }: { action?: boolean }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0 flex-1">
        <S className="h-3 w-24 rounded-full" />
        <S className="mt-3 h-9 w-[min(28rem,82%)] rounded-xl max-[640px]:h-8" />
        <S className="mt-3 h-4 w-[min(38rem,94%)]" />
      </div>
      {action && <S className="h-10 w-36 rounded-md max-[520px]:w-full" />}
    </div>
  );
}

function Card({ lines = 3, tall = false }: { lines?: number; tall?: boolean }) {
  return (
    <div
      className={`rounded-xl border border-(--border-subtle) bg-(--surface-card) p-5 shadow-(--shadow-1) ${tall ? 'min-h-64' : 'min-h-36'}`}
    >
      <div className="flex items-start gap-3">
        <S className="h-10 w-10 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1">
          <S className="h-5 w-2/5 rounded-md" />
          <S className="mt-2 h-3 w-3/5" />
        </div>
      </div>
      <div className="mt-6 space-y-3">
        {Array.from({ length: lines }, (_, index) => (
          <S key={index} className={`h-4 ${index === lines - 1 ? 'w-2/3' : 'w-full'}`} />
        ))}
      </div>
    </div>
  );
}

function ListRows({ count = 6, withAvatar = true }: { count?: number; withAvatar?: boolean }) {
  return (
    <div className="overflow-hidden rounded-xl border border-(--border-subtle) bg-(--surface-card)">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 border-b border-(--border-subtle) px-5 py-4 last:border-b-0 max-[520px]:px-4"
        >
          {withAvatar && <S className="h-11 w-11 shrink-0 rounded-full" />}
          <div className="min-w-0 flex-1">
            <S className="h-4 w-[min(15rem,55%)]" />
            <S className="mt-2 h-3 w-[min(28rem,82%)]" />
          </div>
          <S className="h-8 w-20 shrink-0 rounded-md max-[520px]:w-12" />
        </div>
      ))}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <div className="rounded-xl border border-(--border-subtle) bg-(--surface-card) p-6 shadow-(--shadow-1) max-[640px]:p-5">
        <S className="h-3 w-24" />
        <S className="mt-4 h-9 w-[min(30rem,82%)] rounded-xl" />
        <S className="mt-3 h-4 w-[min(38rem,96%)]" />
        <div className="mt-6 flex flex-wrap gap-3">
          <S className="h-9 w-32 rounded-md" />
          <S className="h-9 w-28 rounded-md" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4 max-[900px]:grid-cols-2 max-[520px]:grid-cols-1">
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index} lines={1} />
        ))}
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_300px] gap-4 max-[900px]:grid-cols-1">
        <Card tall />
        <Card tall />
      </div>
      <Card tall lines={5} />
    </>
  );
}

function ProfileSkeleton() {
  return (
    <>
      <div className="overflow-hidden rounded-xl border border-(--border-subtle) bg-(--surface-card)">
        <S className="h-44 w-full rounded-none max-[640px]:h-32" />
        <div className="flex gap-5 p-6 max-[640px]:flex-col max-[640px]:p-4">
          <S className="-mt-18 h-32 w-32 shrink-0 rounded-full border-4 border-(--surface-card) max-[640px]:-mt-14 max-[640px]:h-24 max-[640px]:w-24" />
          <div className="min-w-0 flex-1">
            <S className="h-8 w-[min(22rem,70%)] rounded-lg" />
            <S className="mt-3 h-4 w-36" />
            <S className="mt-4 h-4 w-[min(36rem,95%)]" />
          </div>
          <S className="h-10 w-32 rounded-md max-[640px]:w-full" />
        </div>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_18rem] gap-5 max-[900px]:grid-cols-1">
        <div className="space-y-5">
          <Card tall lines={4} />
          <Card tall />
        </div>
        <div className="space-y-5">
          <Card lines={2} />
          <Card lines={3} />
        </div>
      </div>
    </>
  );
}

function CardsSkeleton() {
  return (
    <>
      <PageHeadingSkeleton />
      <div className="grid grid-cols-3 gap-4 max-[980px]:grid-cols-2 max-[640px]:grid-cols-1">
        {Array.from({ length: 6 }, (_, index) => (
          <Card key={index} lines={3} tall />
        ))}
      </div>
    </>
  );
}

function DetailSkeleton() {
  return (
    <>
      <PageHeadingSkeleton />
      <div className="grid grid-cols-[minmax(0,1fr)_19rem] gap-5 max-[900px]:grid-cols-1">
        <div className="space-y-5">
          <Card tall lines={6} />
          <Card tall lines={4} />
        </div>
        <div className="space-y-5">
          <Card lines={3} />
          <Card lines={4} />
        </div>
      </div>
    </>
  );
}

function SettingsSkeleton() {
  return (
    <>
      <PageHeadingSkeleton action={false} />
      <div className="flex gap-2 overflow-hidden border-b border-(--border-subtle) pb-3">
        {Array.from({ length: 4 }, (_, index) => (
          <S key={index} className="h-9 w-28 shrink-0 rounded-md" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index} tall lines={3} />
        ))}
      </div>
    </>
  );
}

function TableSkeleton() {
  return (
    <>
      <PageHeadingSkeleton />
      <div className="flex flex-wrap gap-3">
        <S className="h-10 min-w-56 flex-1 rounded-md" />
        <S className="h-10 w-36 rounded-md" />
        <S className="h-10 w-28 rounded-md" />
      </div>
      <ListRows withAvatar={false} />
    </>
  );
}

function FormSkeleton() {
  return (
    <>
      <PageHeadingSkeleton action={false} />
      <div className="mx-auto w-full max-w-3xl rounded-xl border border-(--border-subtle) bg-(--surface-card) p-6 max-[640px]:p-4">
        <div className="space-y-5">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index}>
              <S className="h-3 w-28" />
              <S className={`${index === 3 ? 'h-28' : 'h-11'} mt-2 w-full rounded-md`} />
            </div>
          ))}
          <S className="h-11 w-36 rounded-md max-[520px]:w-full" />
        </div>
      </div>
    </>
  );
}

function EditorSkeleton() {
  return (
    <>
      <PageHeadingSkeleton />
      <div className="grid grid-cols-[17rem_minmax(0,1fr)] gap-5 max-[820px]:grid-cols-1">
        <div className="space-y-3 rounded-xl border border-(--border-subtle) bg-(--surface-card) p-4">
          {Array.from({ length: 7 }, (_, index) => (
            <S key={index} className="h-11 w-full rounded-md" />
          ))}
        </div>
        <Card tall lines={9} />
      </div>
    </>
  );
}

function LessonSkeleton() {
  return (
    <div className="mx-auto grid w-[min(1280px,calc(100%-48px))] grid-cols-[minmax(0,1fr)_340px] gap-6 py-6 max-[1024px]:grid-cols-1 max-[640px]:w-[calc(100%-20px)] max-[640px]:gap-4 max-[640px]:py-3">
      <div className="space-y-6 max-[640px]:space-y-4">
        <Card tall lines={6} />
        <Card tall lines={9} />
        <Card tall lines={5} />
      </div>
      <div className="space-y-6 max-[640px]:space-y-4">
        <Card tall lines={4} />
        <Card tall lines={6} />
      </div>
    </div>
  );
}

function RoadmapSkeleton() {
  return (
    <div className="mx-auto w-[min(900px,calc(100%-48px))] py-6 max-[640px]:w-[calc(100%-20px)] max-[640px]:py-3">
      <PageHeadingSkeleton action={false} />
      <div className="mt-8 flex flex-col items-center gap-0">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex flex-col items-center">
            {index > 0 && <S className="h-10 w-1 rounded-none" />}
            <div className="flex w-[min(36rem,calc(100vw-2rem))] items-center gap-4 rounded-xl border border-(--border-subtle) bg-(--surface-card) p-4 shadow-(--shadow-1)">
              <S className="h-12 w-12 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1">
                <S className="h-5 w-1/2" />
                <S className="mt-2 h-3 w-4/5" />
              </div>
              <S className="h-8 w-16 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AttemptSkeleton() {
  return (
    <div className="flex h-screen min-h-150 flex-col overflow-hidden bg-(--surface-canvas)">
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-(--border-subtle) px-5">
        <S className="h-9 w-40 rounded-lg" />
        <S className="h-9 w-28 rounded-md" />
      </div>
      <div className="mx-auto grid min-h-0 w-full max-w-7xl flex-1 grid-cols-[minmax(0,1fr)_17rem] gap-5 p-5 max-[850px]:grid-cols-1 max-[640px]:p-3">
        <div className="space-y-4 overflow-hidden">
          <Card tall lines={7} />
          <Card tall lines={5} />
        </div>
        <div className="rounded-xl border border-(--border-subtle) bg-(--surface-card) p-4 max-[850px]:hidden">
          <S className="h-5 w-2/3" />
          <div className="mt-5 grid grid-cols-5 gap-2">
            {Array.from({ length: 25 }, (_, index) => (
              <S key={index} className="aspect-square w-full rounded-md" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkflowSkeleton() {
  return (
    <div className="min-h-screen bg-(--surface-canvas) px-4 py-6 sm:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <S className="h-10 w-36 rounded-lg" />
        <S className="h-9 w-28 rounded-md" />
      </div>
      <div className="mx-auto mt-10 max-w-4xl">
        <div className="mb-8 flex items-center justify-center gap-2">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="flex items-center gap-2">
              <S className="h-8 w-8 rounded-full" />
              {index < 3 && <S className="h-1 w-16 rounded-none max-[520px]:w-8" />}
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-(--border-subtle) bg-(--surface-card) p-8 shadow-(--shadow-2) max-[640px]:p-5">
          <S className="mx-auto h-3 w-28" />
          <S className="mx-auto mt-4 h-9 w-[min(28rem,85%)] rounded-xl" />
          <S className="mx-auto mt-3 h-4 w-3/4" />
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index}>
                <S className="h-3 w-24" />
                <S className={`${index === 3 ? 'h-28' : 'h-12'} mt-2 w-full rounded-md`} />
              </div>
            ))}
          </div>
          <S className="mx-auto mt-8 h-12 w-44 rounded-md" />
        </div>
      </div>
    </div>
  );
}

function getAppSkeletonKind(pathname: string): AppSkeletonKind {
  if (pathname.startsWith('/trackers/create')) return 'workflow';
  if (pathname.includes('/lessons/')) return 'lesson';
  if (pathname.includes('/revision')) return 'lesson';
  if (pathname.includes('/roadmap')) return 'roadmap';
  if (/^\/mock-tests\/attempts\/[^/]+$/.test(pathname)) return 'attempt';
  if (pathname === ROUTES.dashboard) return 'dashboard';
  if (pathname === ROUTES.profile || pathname.startsWith(`${ROUTES.profile}/`)) return 'profile';
  if (pathname.startsWith(ROUTES.settingsRoot)) return 'settings';
  if (pathname === ROUTES.support) return 'form';
  if (pathname.includes('/manage')) return 'editor';
  if (
    pathname.startsWith('/community/trackers/') ||
    pathname.startsWith('/community/verify/') ||
    pathname.includes('/clan') ||
    pathname.startsWith('/mock-tests/attempts/') ||
    (/^\/mock-tests\/[^/]+$/.test(pathname) && pathname !== ROUTES.mockTests)
  )
    return 'detail';
  if (
    pathname === ROUTES.notifications ||
    pathname === ROUTES.activity ||
    pathname === ROUTES.friends ||
    pathname === ROUTES.friendsSearch
  )
    return 'table';
  return 'cards';
}

export function AppPageSkeleton({
  kind,
  label = 'Loading page',
}: {
  kind?: AppSkeletonKind;
  label?: string;
}) {
  const pathname = useLocation().pathname;
  const resolvedKind = kind ?? getAppSkeletonKind(pathname);
  const content = {
    dashboard: <DashboardSkeleton />,
    profile: <ProfileSkeleton />,
    cards: <CardsSkeleton />,
    detail: <DetailSkeleton />,
    settings: <SettingsSkeleton />,
    table: <TableSkeleton />,
    form: <FormSkeleton />,
    editor: <EditorSkeleton />,
    lesson: <LessonSkeleton />,
    roadmap: <RoadmapSkeleton />,
    attempt: <AttemptSkeleton />,
    workflow: <WorkflowSkeleton />,
  }[resolvedKind];

  const standalone = ['lesson', 'roadmap', 'attempt', 'workflow'].includes(resolvedKind);
  return (
    <SkeletonStatus label={label}>
      {standalone ? content : <PageContainer>{content}</PageContainer>}
    </SkeletonStatus>
  );
}

function AdminRouteSkeleton() {
  const pathname = useLocation().pathname;
  const detail =
    /\/[^/]+$/.test(pathname) &&
    (pathname.startsWith(`${ADMIN_ROUTES.users}/`) ||
      pathname.startsWith(`${ADMIN_ROUTES.trackers}/`) ||
      pathname.startsWith(`${ADMIN_ROUTES.mockTests}/`));

  return (
    <SkeletonStatus label="Loading admin page">
      <main className="mx-auto w-full max-w-360 px-4 py-7 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="min-w-0 flex-1">
            <div className="h-3 w-24 animate-pulse rounded bg-white/8" />
            <div className="mt-3 h-10 w-[min(28rem,75%)] animate-pulse rounded-lg bg-white/8" />
            <div className="mt-3 h-4 w-[min(42rem,92%)] animate-pulse rounded bg-white/8" />
          </div>
          <div className="h-10 w-32 animate-pulse rounded-lg bg-white/8" />
        </div>
        <div className="mt-7 grid grid-cols-4 gap-4 max-[1100px]:grid-cols-2 max-[560px]:grid-cols-1">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-xl border border-white/9 bg-white/4"
            />
          ))}
        </div>
        <div
          className={`mt-7 grid gap-5 ${detail ? 'grid-cols-[minmax(0,1fr)_20rem] max-[900px]:grid-cols-1' : 'grid-cols-1'}`}
        >
          <div className="overflow-hidden rounded-xl border border-white/9 bg-[#1c1a18]">
            <div className="flex gap-3 border-b border-white/9 p-5">
              <div className="h-10 flex-1 animate-pulse rounded-lg bg-white/8" />
              <div className="h-10 w-32 animate-pulse rounded-lg bg-white/8" />
            </div>
            {Array.from({ length: 7 }, (_, index) => (
              <div
                key={index}
                className="flex gap-5 border-b border-white/8 px-5 py-5 last:border-0"
              >
                <div className="h-4 w-1/4 animate-pulse rounded bg-white/8" />
                <div className="h-4 flex-1 animate-pulse rounded bg-white/8" />
                <div className="h-8 w-20 animate-pulse rounded bg-white/8" />
              </div>
            ))}
          </div>
          {detail && (
            <div className="h-80 animate-pulse rounded-xl border border-white/9 bg-white/4" />
          )}
        </div>
      </main>
    </SkeletonStatus>
  );
}

function AuthRouteSkeleton() {
  return (
    <SkeletonStatus label="Loading secure page">
      <div className="min-h-screen bg-(--surface-canvas) text-(--text-primary) lg:flex">
        <aside className="hidden w-1/2 flex-col justify-between p-12 lg:flex xl:p-18">
          <S className="h-11 w-40 rounded-lg" />
          <div>
            <S className="h-3 w-56" />
            <S className="mt-5 h-14 w-11/12 rounded-xl" />
            <S className="mt-3 h-14 w-3/4 rounded-xl" />
            <S className="mt-6 h-4 w-4/5" />
            <S className="mt-3 h-4 w-3/5" />
          </div>
          <S className="h-3 w-72" />
        </aside>
        <main className="flex min-h-screen flex-1 items-center justify-center px-4 py-8 sm:px-8">
          <div className="w-full max-w-120 rounded-xl border border-(--border-subtle) bg-(--surface-card) px-5 py-8 shadow-(--shadow-2) sm:px-9">
            <S className="mx-auto h-3 w-24" />
            <S className="mx-auto mt-3 h-8 w-56 rounded-lg" />
            <S className="mx-auto mt-3 h-4 w-4/5" />
            <div className="mt-8 space-y-5">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index}>
                  <S className="h-3 w-24" />
                  <S className="mt-2 h-11 w-full rounded-md" />
                </div>
              ))}
              <S className="h-11 w-full rounded-md" />
              <S className="mx-auto h-4 w-2/3" />
            </div>
          </div>
        </main>
      </div>
    </SkeletonStatus>
  );
}

function LegalRouteSkeleton() {
  return (
    <SkeletonStatus label="Loading document">
      <div className="h-screen overflow-hidden bg-(--surface-canvas)">
        <div className="flex h-16 items-center justify-between border-b border-(--border-subtle) px-5 lg:px-12">
          <S className="h-9 w-36 rounded-lg" />
          <S className="h-8 w-20 rounded-md" />
        </div>
        <div className="mx-auto grid h-[calc(100vh-4rem)] max-w-300 grid-cols-[15rem_minmax(0,1fr)] gap-12 px-5 lg:px-12 max-lg:grid-cols-1">
          <div className="space-y-3 py-8 max-lg:hidden">
            {Array.from({ length: 10 }, (_, index) => (
              <S key={index} className="h-9 w-full rounded-md" />
            ))}
          </div>
          <div className="overflow-hidden py-9">
            <S className="h-3 w-28" />
            <S className="mt-4 h-11 w-3/4 rounded-xl" />
            <S className="mt-4 h-4 w-full" />
            <S className="mt-2 h-4 w-5/6" />
            <div className="mt-10 space-y-8">
              {Array.from({ length: 5 }, (_, index) => (
                <div key={index}>
                  <S className="h-7 w-2/5 rounded-lg" />
                  <S className="mt-4 h-4 w-full" />
                  <S className="mt-2 h-4 w-11/12" />
                  <S className="mt-2 h-4 w-4/5" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SkeletonStatus>
  );
}

function LandingRouteSkeleton() {
  return (
    <SkeletonStatus label="Loading Imminiq home">
      <div className="min-h-screen bg-(--surface-canvas) px-5 py-5 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-300 items-center justify-between">
          <S className="h-10 w-36 rounded-lg" />
          <div className="flex gap-3">
            <S className="h-10 w-20 rounded-md max-[520px]:hidden" />
            <S className="h-10 w-28 rounded-md" />
          </div>
        </div>
        <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-300 items-center gap-10 py-12 lg:grid-cols-2">
          <div>
            <S className="h-4 w-48" />
            <S className="mt-6 h-16 w-full rounded-xl" />
            <S className="mt-3 h-16 w-4/5 rounded-xl" />
            <S className="mt-7 h-5 w-full" />
            <S className="mt-3 h-5 w-4/5" />
            <div className="mt-8 flex gap-3">
              <S className="h-12 w-36 rounded-md" />
              <S className="h-12 w-32 rounded-md" />
            </div>
          </div>
          <S className="h-120 w-full rounded-3xl max-lg:h-80" />
        </div>
      </div>
    </SkeletonStatus>
  );
}

function AppSkeletonChrome({ children, guest = false }: { children: ReactNode; guest?: boolean }) {
  return (
    <div className="min-h-screen bg-(--surface-canvas) text-(--text-primary)">
      {!guest && (
        <aside
          aria-hidden="true"
          className="fixed inset-y-0 left-0 hidden w-56 border-r border-(--border-subtle) bg-(--surface-card) p-4 lg:block"
        >
          <S className="h-10 w-36 rounded-lg" />
          <div className="mt-9 space-y-3">
            {Array.from({ length: 8 }, (_, index) => (
              <S key={index} className="h-11 w-full rounded-md" />
            ))}
          </div>
          <S className="absolute bottom-5 left-4 right-4 h-14 rounded-lg" />
        </aside>
      )}
      <div className={guest ? '' : 'lg:ml-56'}>
        <header
          aria-hidden="true"
          className="flex h-(--topbar-height) items-center gap-4 border-b border-(--border-subtle) px-4 sm:px-6"
        >
          <S className="h-9 w-32 rounded-lg" />
          {!guest && <S className="mx-auto hidden h-9 w-full max-w-md rounded-md md:block" />}
          <div className="ml-auto flex gap-2">
            <S className="h-9 w-9 rounded-full" />
            <S className="h-9 w-9 rounded-full" />
            <S className="h-9 w-9 rounded-full" />
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}

function AdminSkeletonChrome({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#141412] text-[#f2f0eb]">
      <aside
        aria-hidden="true"
        className="fixed inset-y-0 left-0 hidden w-68 border-r border-white/9 bg-[#18100e] p-4 lg:block"
      >
        <div className="h-11 w-40 animate-pulse rounded-lg bg-white/8" />
        <div className="mt-9 space-y-3">
          {Array.from({ length: 9 }, (_, index) => (
            <div key={index} className="h-11 w-full animate-pulse rounded-lg bg-white/6" />
          ))}
        </div>
      </aside>
      <div className="lg:pl-68">
        <header
          aria-hidden="true"
          className="flex h-17 items-center justify-between border-b border-white/9 bg-[#1c1a18] px-4 sm:px-8"
        >
          <div className="h-9 w-40 animate-pulse rounded-lg bg-white/8" />
          <div className="h-9 w-28 animate-pulse rounded-lg bg-white/8" />
        </header>
        {children}
      </div>
    </div>
  );
}

export function PublicRouteSkeleton() {
  const pathname = useLocation().pathname;
  if (pathname === ROUTES.privacy || pathname === ROUTES.terms) return <LegalRouteSkeleton />;
  if (pathname === ROUTES.home) return <LandingRouteSkeleton />;
  return <AuthRouteSkeleton />;
}

export function RouteSkeleton({ withChrome = false }: { withChrome?: boolean } = {}) {
  const pathname = useLocation().pathname;
  if (pathname.startsWith('/admin')) {
    const skeleton = <AdminRouteSkeleton />;
    return withChrome ? <AdminSkeletonChrome>{skeleton}</AdminSkeletonChrome> : skeleton;
  }
  if (
    pathname === ROUTES.home ||
    pathname === ROUTES.login ||
    pathname === ROUTES.register ||
    pathname === ROUTES.forgotPassword ||
    pathname === ROUTES.resetPassword ||
    pathname === ROUTES.verifyAccount ||
    pathname === ROUTES.verifyEmailChange ||
    pathname === ROUTES.twoFactorChallenge ||
    pathname === ROUTES.privacy ||
    pathname === ROUTES.terms
  )
    return <PublicRouteSkeleton />;
  const skeleton = <AppPageSkeleton />;
  const kind = getAppSkeletonKind(pathname);
  if (!withChrome || ['lesson', 'roadmap', 'attempt', 'workflow'].includes(kind)) return skeleton;
  return (
    <AppSkeletonChrome guest={pathname.startsWith(`${ROUTES.profile}/`)}>
      {skeleton}
    </AppSkeletonChrome>
  );
}
