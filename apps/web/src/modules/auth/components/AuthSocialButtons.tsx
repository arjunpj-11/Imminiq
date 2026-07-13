import { webEnvironment } from '../../../config/env';

export default function AuthSocialButtons() {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <button
        className="flex min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-md border-[1.5px] border-(--border-subtle) bg-white px-2 py-2.75 text-[13px] font-medium text-(--text-primary) transition hover:-translate-y-px hover:border-(--brand-500) hover:shadow-[0_2px_10px_rgba(184,76,43,0.08)] active:translate-y-0 dark:border-white/15 dark:bg-(--surface-elevated) dark:text-(--text-primary)"
        type="button"
        aria-label="Continue with Google"
        onClick={() => {
          window.location.href = `${webEnvironment.apiUrl}/auth/oauth/google`;
        }}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Google
      </button>

      <button
        className="flex min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-md border-[1.5px] border-(--border-subtle) bg-white px-2 py-2.75 text-[13px] font-medium text-(--text-primary) transition hover:-translate-y-px hover:border-(--brand-500) hover:shadow-[0_2px_10px_rgba(184,76,43,0.08)] active:translate-y-0 dark:border-white/15 dark:bg-(--surface-elevated) dark:text-(--text-primary)"
        type="button"
        aria-label="Continue with GitHub"
        onClick={() => {
          window.location.href = `${webEnvironment.apiUrl}/auth/oauth/github`;
        }}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2C6.477 2 2 6.486 2 12.021c0 4.428 2.865 8.184 6.839 9.511.5.092.682-.217.682-.483 0-.238-.009-.868-.014-1.704-2.782.605-3.369-1.343-3.369-1.343-.455-1.158-1.11-1.466-1.11-1.466-.908-.621.069-.609.069-.609 1.004.071 1.532 1.033 1.532 1.033.892 1.531 2.341 1.089 2.91.833.091-.647.349-1.089.635-1.34-2.221-.253-4.555-1.113-4.555-4.953 0-1.094.39-1.989 1.029-2.689-.103-.253-.446-1.272.098-2.652 0 0 .84-.27 2.75 1.027A9.567 9.567 0 0 1 12 6.844c.85.004 1.705.115 2.504.338 1.909-1.297 2.747-1.027 2.747-1.027.546 1.38.202 2.399.1 2.652.64.7 1.028 1.595 1.028 2.689 0 3.85-2.337 4.697-4.566 4.946.359.31.678.921.678 1.857 0 1.34-.012 2.421-.012 2.75 0 .268.18.58.688.482A10.025 10.025 0 0 0 22 12.021C22 6.486 17.523 2 12 2Z" />
        </svg>
        GitHub
      </button>
    </div>
  );
}
