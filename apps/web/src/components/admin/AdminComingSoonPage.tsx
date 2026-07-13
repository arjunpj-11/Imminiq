import { Construction } from 'lucide-react'

export default function AdminComingSoonPage() {
  return (
    <main className="grid min-h-[calc(100vh-68px)] place-items-center px-5 py-12">
      <section className="w-full max-w-md rounded-2xl border border-[rgba(255,255,255,0.09)] bg-[#1c1a18] p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#2a2723] text-[#e8816a]">
          <Construction size={26} aria-hidden="true" />
        </div>
        <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#e8816a]">
          Under construction
        </p>
        <h1 className="font-editorial mt-2 text-3xl font-bold">
          This module is coming soon
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#aaa59d]">
          We’re still building this part of the admin console. Please check back later.
        </p>
      </section>
    </main>
  )
}
