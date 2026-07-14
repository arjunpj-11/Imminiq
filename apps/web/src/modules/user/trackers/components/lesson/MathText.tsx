import { cn } from '../../utils/tracker-ui';
import { formatMathTextToHtml } from '../../utils/lesson-content.utils';

export default function MathText({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'math-text whitespace-pre-wrap',
        '[&_sup]:text-[0.72em] [&_sup]:align-super',
        '[&_sub]:text-[0.72em] [&_sub]:align-sub',
        className
      )}
      dangerouslySetInnerHTML={{ __html: formatMathTextToHtml(children) }}
    />
  );
}
