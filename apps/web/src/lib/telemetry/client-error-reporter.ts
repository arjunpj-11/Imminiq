import api from '../axios';

type ClientErrorSource = 'render' | 'widget' | 'window' | 'unhandled-rejection' | 'invariant';

type ClientErrorContext = {
  source: ClientErrorSource;
  componentStack?: string | null;
};

const recentlyReported = new Map<string, number>();
const DEDUPE_WINDOW_MS = 60_000;

const toError = (value: unknown) => {
  if (value instanceof Error) return value;
  if (typeof value === 'string') return new Error(value);

  try {
    return new Error(JSON.stringify(value));
  } catch {
    return new Error('Unknown client error');
  }
};

export const reportClientError = (value: unknown, context: ClientErrorContext) => {
  const error = toError(value);
  const path = window.location.pathname || '/';
  const signature = `${context.source}:${path}:${error.message}`;
  const now = Date.now();

  if ((recentlyReported.get(signature) ?? 0) > now - DEDUPE_WINDOW_MS) return;
  recentlyReported.set(signature, now);

  if (import.meta.env.DEV) {
    console.error(`[${context.source}]`, error, context.componentStack ?? '');
    return;
  }

  void api
    .post(
      '/client-errors',
      {
        source: context.source,
        message: error.message.slice(0, 500),
        ...(error.stack ? { stack: error.stack.slice(0, 3_000) } : {}),
        ...(context.componentStack
          ? { componentStack: context.componentStack.slice(0, 2_000) }
          : {}),
        path: path.slice(0, 500),
        occurredAt: new Date(now).toISOString(),
      },
      { timeout: 5_000 }
    )
    .catch(() => undefined);
};

export const installGlobalErrorReporting = () => {
  const reportWindowError = (event: ErrorEvent) => {
    reportClientError(event.error ?? event.message, { source: 'window' });
  };
  const reportUnhandledRejection = (event: PromiseRejectionEvent) => {
    reportClientError(event.reason, { source: 'unhandled-rejection' });
  };

  window.addEventListener('error', reportWindowError);
  window.addEventListener('unhandledrejection', reportUnhandledRejection);

  return () => {
    window.removeEventListener('error', reportWindowError);
    window.removeEventListener('unhandledrejection', reportUnhandledRejection);
  };
};
