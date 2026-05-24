export default function DashboardErrorState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5ede4] px-4 dark:bg-[#141412]">
      <div className="max-w-md rounded-2xl border border-[rgba(200,50,50,0.22)] bg-[#fdf8f5] p-6 text-center shadow-[0_10px_40px_rgba(26,23,20,0.10)] dark:bg-[#1e1c19]">
        <h1 className="font-['Playfair_Display',serif] text-[22px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">
          Dashboard unavailable
        </h1>
        <p className="mt-2 text-[13px] leading-[1.6] text-[#6b5f58] dark:text-[#9b9a92]">
          Something went wrong while fetching your dashboard data.
        </p>
      </div>
    </div>
  )
}
