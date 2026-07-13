export default function DashboardErrorState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-(--surface-canvas) px-4 dark:bg-(--surface-canvas)">
      <div className="max-w-md rounded-2xl border border-[rgba(200,50,50,0.22)] bg-(--surface-card) p-6 text-center shadow-(--shadow-2) dark:bg-(--surface-card)">
        <h1 className="font-ui text-[22px] font-extrabold text-(--text-primary) dark:text-(--text-primary)">
          Dashboard unavailable
        </h1>
        <p className="mt-2 text-[13px] leading-[1.6] text-(--text-secondary) dark:text-(--text-secondary)">
          Something went wrong while fetching your dashboard data.
        </p>
      </div>
    </div>
  )
}
