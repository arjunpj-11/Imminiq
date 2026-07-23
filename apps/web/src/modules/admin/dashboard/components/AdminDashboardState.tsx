import { AdminCardSkeleton, AdminError, AdminTableSkeleton } from '../../../../components/admin';

interface IAdminDashboardStateProps {
  tone: 'loading' | 'error';
  error?: unknown;
}

export default function AdminDashboardState({ tone, error }: IAdminDashboardStateProps) {
  if (tone === 'error') {
    return (
      <main className="mx-auto max-w-310 px-5 py-9 sm:px-8">
        <AdminError error={error ?? new Error('The admin overview could not be loaded.')} />
      </main>
    );
  }

  return (
    <main
      className="mx-auto max-w-310 px-5 py-9 sm:px-8"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading admin overview"
    >
      <span className="sr-only">Loading admin overview…</span>
      <div aria-hidden="true">
        <header className="flex flex-wrap items-end justify-between gap-5">
          <div className="min-w-0 flex-1">
            <div className="admin-skeleton h-3 w-24" />
            <div className="admin-skeleton mt-3 h-10 w-[min(28rem,80%)] rounded-lg" />
            <div className="admin-skeleton mt-3 h-4 w-[min(34rem,92%)]" />
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="admin-skeleton h-10 w-44 rounded-lg" />
            <div className="admin-skeleton h-10 w-10 rounded-lg" />
          </div>
        </header>

        <div className="mt-7">
          <AdminCardSkeleton cards={5} />
        </div>

        <section className="mt-7 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="rounded-xl border border-white/9 bg-[#1c1a18] p-4 sm:p-5">
              <div className="admin-skeleton h-4 w-3/5" />
              <div className="admin-skeleton mt-4 h-8 w-16" />
              <div className="admin-skeleton mt-3 h-3 w-4/5" />
            </div>
          ))}
        </section>

        <section className="mt-7 grid gap-6 lg:grid-cols-[1.55fr_1fr]">
          <div className="rounded-xl border border-white/9 bg-[#1c1a18] p-6 sm:p-8">
            <div className="flex justify-between">
              <div className="admin-skeleton h-7 w-44" />
              <div className="admin-skeleton h-8 w-12 rounded-md" />
            </div>
            <div className="mt-8 flex h-64 items-end gap-3 border-b border-white/16 px-2 sm:gap-6">
              {[54, 76, 44, 88, 64, 72, 48].map((height, index) => (
                <div key={index} className="flex h-full flex-1 items-end">
                  <div
                    className="admin-skeleton w-full rounded-b-none rounded-t-md"
                    style={{ height: `${height}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-white/9 bg-[#1c1a18] p-6 sm:p-8">
            <div className="flex justify-between">
              <div className="admin-skeleton h-7 w-32" />
              <div className="admin-skeleton h-3 w-16" />
            </div>
            <div className="mt-6 space-y-3">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="rounded-lg border border-white/6 p-4">
                  <div className="admin-skeleton h-4 w-2/5" />
                  <div className="admin-skeleton mt-3 h-3 w-4/5" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-7 overflow-hidden rounded-xl border border-white/9 bg-[#1c1a18]">
          <div className="flex justify-between p-6 sm:p-8">
            <div className="admin-skeleton h-7 w-52" />
            <div className="admin-skeleton h-3 w-24" />
          </div>
          <div className="admin-table-scroll overflow-x-auto">
            <AdminTableSkeleton columns={4} rows={5} />
          </div>
        </section>
      </div>
    </main>
  );
}
