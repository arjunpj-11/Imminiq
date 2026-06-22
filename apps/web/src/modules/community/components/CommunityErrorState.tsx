interface CommunityErrorStateProps {
  title: string
  message: string
  actionLabel?: string
  onAction?: () => void
}

export default function CommunityErrorState({
  title,
  message,
  actionLabel,
  onAction,
}: CommunityErrorStateProps) {
  return (
    <div className="flex min-h-[calc(100vh-180px)] items-center justify-center px-4">
      <div className="max-w-md rounded-2xl border border-[rgba(200,50,50,0.22)] bg-[#fdf8f5] p-6 text-center shadow-[0_12px_40px_rgba(26,23,20,0.08)] dark:bg-[#1e1c19]">
        <h1 className="font-['Playfair_Display',serif] text-[22px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">
          {title}
        </h1>
        <p className="mt-2 text-[13px] leading-[1.6] text-[#6b5f58] dark:text-[#9b9a92]">
          {message}
        </p>
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="mt-5 rounded-[10px] border-[1.5px] border-[rgba(184,76,43,0.22)] bg-[rgba(184,76,43,0.07)] px-5 py-2.5 text-[13px] font-bold text-[#b84c2b] transition hover:-translate-y-px hover:bg-[rgba(184,76,43,0.12)] dark:border-[rgba(232,129,106,0.25)] dark:text-[#e8816a]"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  )
}
