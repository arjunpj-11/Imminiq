type EmptyCardProps = {
  title: string
  description: string
}

export default function EmptyCard({ title, description }: EmptyCardProps) {
  return (
    <div className="rounded-2xl border-[1.5px] border-dashed border-(--border-subtle) bg-(--surface-card)/70 px-5 py-6 text-center dark:border-(--border-subtle) dark:bg-(--surface-card)/70">
      <div className="text-[14px] font-bold text-(--text-primary) dark:text-(--text-primary)">
        {title}
      </div>
      <div className="mt-1 text-[12.5px] leading-[1.6] text-(--text-secondary) dark:text-(--text-secondary)">
        {description}
      </div>
    </div>
  )
}
