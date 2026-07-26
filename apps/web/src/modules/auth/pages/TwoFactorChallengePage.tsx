import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import axios from 'axios';

import { useVerifyTwoFactorLogin } from '../hooks/useVerifyTwoFactorLogin';
import { AlertIcon, LogoIcon } from '../components/icons/AuthIcons';
import { cn } from '../utils/auth-ui';
import { ROUTES } from '../../../routes/config/route-paths';
import ImminiqWordmark from '../../../components/ui/ImminiqWordmark';

const ShieldIcon = () => {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-5" />
    </svg>
  );
};

const normalizeCodeInput = (value: string) => {
  return value.toUpperCase().replace(/\s+/g, '').slice(0, 11);
};

const isValidTwoFactorCode = (value: string) => {
  const compact = value.trim().replace(/\s/g, '');

  const isTotp = /^\d{6}$/.test(compact);
  const isBackupCode = /^[A-F0-9]{5}-?[A-F0-9]{5}$/.test(compact);

  return isTotp || isBackupCode;
};

export default function TwoFactorChallengePage() {
  const verifyTwoFactor = useVerifyTwoFactorLogin();

  const [code, setCode] = useState('');
  const [touched, setTouched] = useState(false);

  const apiError = axios.isAxiosError<{ message?: string }>(verifyTwoFactor.error)
    ? verifyTwoFactor.error.response?.data?.message
    : undefined;

  const formError =
    touched && !isValidTwoFactorCode(code)
      ? 'Enter a valid 6-digit authenticator code or backup code.'
      : undefined;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched(true);

    if (!isValidTwoFactorCode(code)) {
      return;
    }

    verifyTwoFactor.mutate({
      code: code.trim(),
    });
  };

  return (
    <div
      className={cn(
        'min-h-screen bg-(--surface-canvas) text-(--text-primary) font-[DM_Sans,sans-serif]',
        'dark:bg-(--surface-canvas) dark:text-(--text-primary)',
        'lg:flex lg:min-h-screen lg:items-center lg:justify-center lg:px-8'
      )}
    >
      <div className="flex min-h-screen w-full flex-col lg:min-h-0 lg:max-w-280 lg:flex-row lg:items-stretch lg:overflow-hidden lg:rounded-xl lg:border lg:border-(--border-subtle) lg:bg-(--surface-card) lg:shadow-[0_24px_80px_rgba(26,23,20,0.14)] dark:lg:border-white/15 dark:lg:bg-[#1e1c19]">
        <aside className="relative hidden w-[48%] overflow-hidden bg-[#f1e6da] px-12 py-12 dark:bg-[#191714] lg:flex lg:flex-col lg:justify-between">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(184,76,43,0.12)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(232,129,106,0.14)_0%,transparent_70%)]" />

          <div className="relative">
            <div className="inline-flex items-center gap-3">
              <LogoIcon className="h-11 w-11" />

              <ImminiqWordmark lowercase className="text-[26px] font-bold tracking-[-0.5px]" />
            </div>
          </div>

          <div className="relative max-w-107.5">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-lg bg-[rgba(184,76,43,0.10)] text-(--brand-500) dark:bg-[rgba(232,129,106,0.12)] dark:text-(--brand-500)">
              <ShieldIcon />
            </div>

            <h1 className="font-serif text-[46px] font-extrabold leading-[1.08] tracking-[-1px]">
              Confirm it’s
              <br />
              really you.
            </h1>

            <p className="mt-5 text-[15px] leading-[1.75] text-(--text-secondary) dark:text-(--text-secondary)">
              Your password or OAuth login was accepted. Complete your second verification step to
              securely enter imminiq.
            </p>
          </div>

          <div className="relative rounded-lg border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] p-4 text-[13px] leading-[1.7] text-(--text-secondary) dark:border-[rgba(232,129,106,0.18)] dark:bg-[rgba(232,129,106,0.08)] dark:text-(--text-secondary)">
            Your login session is created only after this verification succeeds.
          </div>
        </aside>

        <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-8 lg:px-14">
          <div className="w-full max-w-120">
            <div className="mb-8 flex items-center justify-between lg:hidden">
              <Link to={ROUTES.home} className="inline-flex items-center gap-2.5">
                <LogoIcon className="h-10 w-10" />

                <ImminiqWordmark lowercase className="text-[23px] font-bold tracking-[-0.5px]" />
              </Link>
            </div>

            <form
              onSubmit={handleSubmit}
              noValidate
              className="rounded-xl border border-(--border-subtle) bg-(--surface-card) px-5 py-7 shadow-[0_8px_30px_rgba(26,23,20,0.08)] dark:border-white/15 dark:bg-(--surface-card) dark:shadow-[0_18px_60px_rgba(0,0,0,0.45)] sm:px-8 sm:py-9 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none dark:lg:bg-transparent dark:lg:shadow-none"
            >
              <div className="text-center font-mono text-[9.5px] uppercase tracking-[0.16em] text-(--text-secondary) dark:text-(--text-secondary)">
                Two-Step Verification
              </div>

              <h2 className="mt-2 text-center font-serif text-[clamp(25px,5vw,32px)] font-bold tracking-[-0.6px]">
                Enter your secure code
              </h2>

              <p className="mx-auto mt-3 max-w-97.5 text-center text-[13.5px] leading-[1.7] text-(--text-secondary) dark:text-(--text-secondary)">
                Use the 6-digit code from your authenticator app. You may also use one of your
                backup codes.
              </p>

              {apiError && (
                <div
                  className="mt-5 flex items-start gap-2.5 rounded-md border border-[rgba(217,69,53,0.2)] border-l-[3px] border-l-(--danger) bg-[rgba(217,69,53,0.07)] px-3.5 py-3 text-[13px] leading-normal text-(--danger) dark:border-l-(--danger) dark:bg-[rgba(255,107,95,0.10)] dark:text-(--danger)"
                  role="alert"
                >
                  <AlertIcon className="mt-1 h-3.5 w-3.5" />
                  <span>{apiError}</span>
                </div>
              )}

              <div className="mt-6">
                <label
                  htmlFor="twoFactorCode"
                  className="font-mono text-[9.5px] font-medium uppercase tracking-widest"
                >
                  Authenticator or Backup Code
                </label>

                <input
                  id="twoFactorCode"
                  value={code}
                  onChange={(event) => setCode(normalizeCodeInput(event.target.value))}
                  onBlur={() => setTouched(true)}
                  placeholder="123456 or ABCDE-12345"
                  autoFocus
                  autoComplete="one-time-code"
                  inputMode="text"
                  className={cn(
                    'mt-1.5 w-full rounded-xl border-[1.5px] bg-white px-4 py-3.5 text-center font-mono text-[17px] font-bold tracking-[0.12em] text-(--text-primary) outline-none transition',
                    'placeholder:text-[13px] placeholder:font-normal placeholder:tracking-normal placeholder:text-[#9f8f86]',
                    'focus:border-(--brand-500) focus:shadow-[0_0_0_3px_rgba(184,76,43,0.09)]',
                    'dark:border-white/15 dark:bg-(--surface-elevated) dark:text-(--text-primary) dark:placeholder:text-[#aaa59d]',
                    'dark:focus:border-(--brand-500) dark:focus:shadow-[0_0_0_3px_rgba(232,129,106,0.18)]',
                    formError &&
                      'border-(--danger) bg-[rgba(217,69,53,0.07)] shadow-[0_0_0_3px_rgba(217,69,53,0.08)] dark:border-(--danger) dark:bg-[rgba(255,107,95,0.10)]'
                  )}
                  aria-invalid={!!formError}
                  aria-describedby={formError ? 'two-factor-error' : undefined}
                />

                {formError && (
                  <div
                    id="two-factor-error"
                    role="alert"
                    className="mt-2 flex items-center gap-1.5 text-[11.5px] leading-normal text-(--danger) dark:text-(--danger)"
                  >
                    <AlertIcon />
                    <span>{formError}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={verifyTwoFactor.isPending || !isValidTwoFactorCode(code)}
                className={cn(
                  'mt-5 w-full rounded-xl bg-(--brand-500) px-5 py-3.5 text-[15px] font-bold text-[#f5ede4] transition',
                  'hover:-translate-y-px hover:bg-(--brand-600) hover:shadow-[0_6px_20px_rgba(184,76,43,0.30)]',
                  'disabled:cursor-not-allowed disabled:opacity-65 disabled:hover:translate-y-0 disabled:hover:shadow-none',
                  'dark:bg-(--brand-500) dark:text-[#141412] dark:hover:bg-(--brand-600)'
                )}
              >
                {verifyTwoFactor.isPending ? 'Verifying...' : 'Verify and Continue'}
              </button>

              <div className="mt-5 flex flex-col gap-2 text-center text-[12.5px] text-(--text-secondary) dark:text-(--text-secondary)">
                <p>Lost access to your authenticator? Use a saved backup code.</p>

                <Link
                  to={ROUTES.login}
                  className="font-medium text-(--brand-500) transition hover:underline dark:text-(--brand-500)"
                >
                  Back to sign in
                </Link>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
