import { SparklesIcon } from './icons/CommunityIcons'

interface VerificationHowItWorksProps {
  steps: string[]
}

export default function VerificationHowItWorks({
  steps,
}: VerificationHowItWorksProps) {
  return (
    <div className="rounded-[18px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 dark:border-white/9 dark:bg-[#1e1c19]">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-[#b84c2b] dark:text-[#e8816a]">
          <SparklesIcon />
        </span>
        <span className="font-['Playfair_Display',serif] text-[14px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">
          How it works
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {steps.map((text, index) => (
          <div key={`${index}-${text}`} className="flex items-start gap-3">
            <span className="mt-0.5 w-4 shrink-0 font-['DM_Mono',monospace] text-[9px] font-bold text-[#b84c2b] dark:text-[#e8816a]">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="text-[12px] leading-normal text-[#6b5f58] dark:text-[#9b9a92]">
              {text}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
