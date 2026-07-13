import { useCallback, useRef } from 'react';

import { toast as globalToast } from '../../../../lib/toast';
import type { ToastTone } from '../types/settings-ui.types';

const toneFor = (tone: ToastTone) => (tone === 'loading' ? 'info' : tone);

/**
 * Compatibility adapter for existing settings pages. Visual rendering is now
 * handled by the root ToastProvider, so settings no longer creates a separate
 * fixed toast layer.
 */
export const useSettingsToast = () => {
  const activeToastId = useRef<number | null>(null);

  const showToast = useCallback((message: string, tone: ToastTone = 'info') => {
    const input = {
      title: message,
      tone: toneFor(tone),
      duration: tone === 'loading' ? 0 : undefined,
    } as const;

    if (activeToastId.current !== null) {
      globalToast.update(activeToastId.current, input);
    } else {
      activeToastId.current = globalToast.show(input);
    }

    if (tone !== 'loading') {
      activeToastId.current = null;
    }
  }, []);

  const hideToast = useCallback(() => {
    if (activeToastId.current !== null) {
      globalToast.dismiss(activeToastId.current);
      activeToastId.current = null;
    }
  }, []);

  return {
    message: '',
    tone: 'info' as ToastTone,
    visible: false,
    showToast,
    hideToast,
  };
};
