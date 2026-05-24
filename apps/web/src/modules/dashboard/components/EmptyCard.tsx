type EmptyCardProps = {
  title: string
  description: string
}

export default function EmptyCard({ title, description }: EmptyCardProps) {
  return (
    <div className="rounded-2xl border-[1.5px] border-dashed border-[#e0d0c5] bg-[#fdf8f5]/70 px-5 py-6 text-center dark:border-white/9 dark:bg-[#1e1c19]/70">
      <div className="text-[14px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">
        {title}
      </div>
      <div className="mt-1 text-[12.5px] leading-[1.6] text-[#6b5f58] dark:text-[#9b9a92]">
        {description}
      </div>
    </div>
  )
}
