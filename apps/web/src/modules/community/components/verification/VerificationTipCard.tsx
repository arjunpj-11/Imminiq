export default function VerificationTipCard() {
  return (
    <div className="rounded-lg border-[1.5px] border-[rgba(196,154,44,0.18)] bg-[rgba(196,154,44,0.04)] p-5 dark:border-[rgba(196,154,44,0.15)] dark:bg-[rgba(196,154,44,0.04)] max-[860px]:col-span-2 max-[560px]:col-span-1">
      <div className="mb-3 flex items-center gap-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[#9b9a92]">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M9 18h6M12 2a7 7 0 017 7c0 2.5-1.3 4.7-3.3 6H8.3A7 7 0 015 9a7 7 0 017-7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M9 18v2a1 1 0 001 1h4a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        Scholar&apos;s tip
      </div>
      <p className="mb-2.5 font-ui text-[13px] italic leading-[1.65] text-(--text-primary) dark:text-[#e0d5cb]">
        &quot;Peer review is the backbone of reliable scholarship. Your vote shapes the knowledge commons.&quot;
      </p>
      <div className="text-right text-[11px] text-[#9b9a92]">
        — The Imminiq Team
      </div>
    </div>
  )
}
