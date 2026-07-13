import { Construction } from 'lucide-react'

export default function AdminComingSoonPage() {
  return (
    <main className="grid min-h-[calc(100vh-68px)] place-items-center px-5 py-12">
      <section className="w-full max-w-md rounded-2xl border border-[#26344d] bg-[#111827] p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#172033] text-[#67e8f9]">
          <Construction size={26} aria-hidden="true" />
        </div>
        <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#67e8f9]">
          Under construction
        </p>
        <h1 className="font-editorial mt-2 text-3xl font-bold">
          This module is coming soon
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#94a3b8]">
          We’re still building this part of the admin console. Please check back later.
        </p>
      </section>
    </main>
  )
}
