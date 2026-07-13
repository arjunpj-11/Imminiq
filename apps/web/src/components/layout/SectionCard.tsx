import type { ReactNode } from 'react';

import { cn } from '../../lib/cn';

interface ISectionCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'flat' | 'elevated' | 'spotlight';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variantClasses = {
  flat: 'surface-flat',
  elevated: 'surface-elevated',
  spotlight: 'surface-spotlight',
} as const;

const paddingClasses = {
  none: '',
  sm: 'p-3.5',
  md: 'p-5 max-[640px]:p-4',
  lg: 'p-6 max-[640px]:p-4.5',
} as const;

export default function SectionCard({
  children,
  className,
  variant = 'elevated',
  padding = 'md',
}: ISectionCardProps) {
  return (
    <section className={cn(variantClasses[variant], paddingClasses[padding], className)}>
      {children}
    </section>
  );
}
