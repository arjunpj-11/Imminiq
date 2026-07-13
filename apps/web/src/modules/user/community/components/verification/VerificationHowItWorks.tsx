import { SparklesIcon } from '../icons/CommunityIcons';

interface IVerificationHowItWorksProps {
  steps: string[];
}

export default function VerificationHowItWorks({ steps }: IVerificationHowItWorksProps) {
  return (
    <div className="rounded-lg border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-5 dark:border-(--border-subtle) dark:bg-(--surface-card)">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-(--brand-500) dark:text-(--brand-500)">
          <SparklesIcon />
        </span>
        <span className="font-ui text-[14px] font-extrabold text-(--text-primary) dark:text-(--text-primary)">
          How it works
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {steps.map((text, index) => (
          <div key={`${index}-${text}`} className="flex items-start gap-3">
            <span className="mt-0.5 w-4 shrink-0 font-mono text-[9px] font-bold text-(--brand-500) dark:text-(--brand-500)">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="text-[12px] leading-normal text-(--text-secondary) dark:text-(--text-secondary)">
              {text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
