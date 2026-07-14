import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '../../lib/cn';
import { canUseDOM } from '../../lib/storage/safe-storage';
import { subscribeToToasts, type IToastRecord, type ToastTone } from '../../lib/toast';

const toneClasses: Record<ToastTone, string> = {
  success: 'border-[color-mix(in_srgb,var(--success)_30%,var(--border-subtle))]',
  error: 'border-[color-mix(in_srgb,var(--danger)_34%,var(--border-subtle))]',
  warning: 'border-[color-mix(in_srgb,var(--warning)_34%,var(--border-subtle))]',
  info: 'border-[color-mix(in_srgb,var(--info)_30%,var(--border-subtle))]',
};

const dotClasses: Record<ToastTone, string> = {
  success: 'bg-[var(--success)]',
  error: 'bg-[var(--danger)]',
  warning: 'bg-[var(--warning)]',
  info: 'bg-[var(--info)]',
};

export default function ToastProvider() {
  const [items, setItems] = useState<IToastRecord[]>([]);
  const timers = useRef<Map<number, number>>(new Map());

  const remove = (id: number) => {
    const timer = timers.current.get(id);

    if (timer !== undefined) {
      window.clearTimeout(timer);
    }

    timers.current.delete(id);

    setItems((current) => current.filter((item) => item.id !== id));
  };

  useEffect(() => {
    // Capture the current map for this effect's full lifecycle.
    const activeTimers = timers.current;

    const clearTimer = (id: number) => {
      const timer = activeTimers.get(id);

      if (timer !== undefined) {
        window.clearTimeout(timer);
      }

      activeTimers.delete(id);
    };

    const clearAllTimers = () => {
      activeTimers.forEach((timer) => {
        window.clearTimeout(timer);
      });

      activeTimers.clear();
    };

    const unsubscribe = subscribeToToasts((event) => {
      if (event.type === 'clear') {
        clearAllTimers();
        setItems([]);
        return;
      }

      if (event.type === 'dismiss') {
        clearTimer(event.id);

        setItems((current) => current.filter((item) => item.id !== event.id));

        return;
      }

      const record = event.toast;

      clearTimer(record.id);

      setItems((current) => {
        const withoutCurrent = current.filter((item) => item.id !== record.id);

        return [...withoutCurrent.slice(-3), record];
      });

      if (record.duration > 0) {
        const timer = window.setTimeout(() => {
          setItems((current) => current.filter((item) => item.id !== record.id));

          activeTimers.delete(record.id);
        }, record.duration);

        activeTimers.set(record.id, timer);
      }
    });

    return () => {
      unsubscribe();
      clearAllTimers();
    };
  }, []);

  if (!canUseDOM()) {
    return null;
  }

  return createPortal(
    <div
      className="pointer-events-none fixed inset-x-3 top-3 z-200 flex flex-col items-end gap-2 sm:left-auto sm:right-4 sm:top-4 sm:w-[min(380px,calc(100vw-32px))]"
      aria-live="polite"
      aria-atomic="false"
    >
      {items.map((item) => (
        <div
          key={item.id}
          role={item.tone === 'error' ? 'alert' : 'status'}
          className={cn(
            'pointer-events-auto flex w-full items-start gap-3 rounded-md border bg-(--surface-elevated) p-3.5 text-(--text-primary) shadow-(--shadow-2) route-enter',
            toneClasses[item.tone]
          )}
        >
          <span
            className={cn(
              'mt-1.5 h-2 w-2 shrink-0 rounded-full',
              item.duration === 0 && 'animate-pulse',
              dotClasses[item.tone]
            )}
            aria-hidden="true"
          />

          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-[680] leading-5">{item.title}</div>

            {item.description && (
              <div className="mt-0.5 text-[12px] leading-5 text-(--text-secondary)">
                {item.description}
              </div>
            )}
          </div>

          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => remove(item.id)}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm text-(--text-muted) transition hover:bg-(--surface-muted) hover:text-(--text-primary)"
          >
            ×
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
}
