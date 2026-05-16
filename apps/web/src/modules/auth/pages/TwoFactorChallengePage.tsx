import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import ThemeToggle from '../../../components/ui/ThemeToggle'
import { useVerifyTwoFactorLogin } from '../../../hooks/auth/useVerifyTwoFactorLogin'

const cn = (...classes: Array<string | false | null | undefined>) => {
  return classes.filter(Boolean).join(' ')
}

const LogoIcon = ({ className = '' }: { className?: string }) => {
  return (
    <svg
      className={cn('block shrink-0 rounded-xl', className)}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="10" y="10" width="80" height="80" rx="18" fill="#050505" />
      <g transform="translate(-5, 1)">
        <rect x="31" y="35" width="9" height="34" rx="4.5" fill="#fff8ed" />
        <circle cx="35.5" cy="28.5" r="5.3" fill="#f15a35" />
        <path
          d="M64 32.8 C73.8 34.7 79.5 42.2 79.5 51.5 C79.5 61.8 71.2 68 60.2 68 C53.2 68 48.2 65.5 45.1 60.8"
          fill="none"
          stroke="#fff8ed"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <line
          x1="63.8"
          y1="55.5"
          x2="75.8"
          y2="67.5"
          stroke="#f15a35"
          strokeWidth="9"
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
}

const AlertIcon = ({ className = '' }: { className?: string }) => {
  return (
    <svg
      className={cn('shrink-0', className)}
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

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
  )
}

const normalizeCodeInput = (value: string) => {
  return value
    .toUpperCase()
    .replace(/\s+/g, '')
    .slice(0, 11)
}

const isValidTwoFactorCode = (value: string) => {
  const compact = value.trim().replace(/\s/g, '')

  const isTotp = /^\d{6}$/.test(compact)
  const isBackupCode = /^[A-F0-9]{5}-?[A-F0-9]{5}$/.test(compact)

  return isTotp || isBackupCode
}

export default function TwoFactorChallengePage() {
  const verifyTwoFactor = useVerifyTwoFactorLogin()

  const [code, setCode] = useState('')
  const [touched, setTouched] = useState(false)

  const apiError = axios.isAxiosError<{ message?: string }>(
    verifyTwoFactor.error
  )
    ? verifyTwoFactor.error.response?.data?.message
    : undefined

  const formError =
    touched && !isValidTwoFactorCode(code)
      ? 'Enter a valid 6-digit authenticator code or backup code.'
      : undefined

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setTouched(true)

    if (!isValidTwoFactorCode(code)) {
      return
    }

    verifyTwoFactor.mutate({
      code: code.trim(),
    })
  }

  return (
    <div
      className={cn(
        'min-h-screen bg-[#f5ede4] text-[#1a1714] font-[DM_Sans,sans-serif]',
        'dark:bg-[#141412] dark:text-[#f2f0eb]',
        'lg:flex lg:min-h-screen lg:items-center lg:justify-center lg:px-8'
      )}
    >
      <div className="flex min-h-screen w-full flex-col lg:min-h-0 lg:max-w-280 lg:flex-row lg:items-stretch lg:overflow-hidden lg:rounded-[28px] lg:border lg:border-[#e0d0c5] lg:bg-[#fdf8f5] lg:shadow-[0_24px_80px_rgba(26,23,20,0.14)] dark:lg:border-white/15 dark:lg:bg-[#1e1c19]">
        {/* Left Panel */}
        <aside className="relative hidden w-[48%] overflow-hidden bg-[#f1e6da] px-12 py-12 dark:bg-[#191714] lg:flex lg:flex-col lg:justify-between">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(184,76,43,0.12)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(232,129,106,0.14)_0%,transparent_70%)]" />

          <div className="relative">
            <div className="inline-flex items-center gap-3">
              <LogoIcon className="h-11 w-11" />

              <span className="text-[26px] font-bold tracking-[-0.5px]">
                immin
                <span className="text-[#b84c2b] dark:text-[#e8816a]">iq</span>
                <span className="text-[#b84c2b] dark:text-[#e8816a]">.</span>
              </span>
            </div>

            <div className="mt-5">
              <ThemeToggle />
            </div>
          </div>

          <div className="relative max-w-107.5">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-[18px] bg-[rgba(184,76,43,0.10)] text-[#b84c2b] dark:bg-[rgba(232,129,106,0.12)] dark:text-[#e8816a]">
              <ShieldIcon />
            </div>

            <h1 className="font-serif text-[46px] font-extrabold leading-[1.08] tracking-[-1px]">
              Confirm it’s
              <br />
              really you.
            </h1>

            <p className="mt-5 text-[15px] leading-[1.75] text-[#6b5f58] dark:text-[#9b9a92]">
              Your password or OAuth login was accepted. Complete your second
              verification step to securely enter Imminiq.
            </p>
          </div>

          <div className="relative rounded-[18px] border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] p-4 text-[13px] leading-[1.7] text-[#6b5f58] dark:border-[rgba(232,129,106,0.18)] dark:bg-[rgba(232,129,106,0.08)] dark:text-[#9b9a92]">
            Your login session is created only after this verification succeeds.
          </div>
        </aside>

        {/* Right Panel */}
        <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-8 lg:px-14">
          <div className="w-full max-w-120">
            {/* Mobile Brand */}
            <div className="mb-8 flex items-center justify-between lg:hidden">
              <Link to="/" className="inline-flex items-center gap-2.5">
                <LogoIcon className="h-10 w-10" />

                <span className="text-[23px] font-bold tracking-[-0.5px]">
                  immin
                  <span className="text-[#b84c2b] dark:text-[#e8816a]">iq</span>
                  <span className="text-[#b84c2b] dark:text-[#e8816a]">.</span>
                </span>
              </Link>

              <ThemeToggle />
            </div>

            <form
              onSubmit={handleSubmit}
              noValidate
              className="rounded-[22px] border border-[#e0d0c5] bg-[#fdf8f5] px-5 py-7 shadow-[0_8px_30px_rgba(26,23,20,0.08)] dark:border-white/15 dark:bg-[#1e1c19] dark:shadow-[0_18px_60px_rgba(0,0,0,0.45)] sm:px-8 sm:py-9 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none dark:lg:bg-transparent dark:lg:shadow-none"
            >
              <div className="text-center font-mono text-[9.5px] uppercase tracking-[0.16em] text-[#6b5f58] dark:text-[#9b9a92]">
                Two-Step Verification
              </div>

              <h2 className="mt-2 text-center font-serif text-[clamp(25px,5vw,32px)] font-bold tracking-[-0.6px]">
                Enter your secure code
              </h2>

              <p className="mx-auto mt-3 max-w-97.5 text-center text-[13.5px] leading-[1.7] text-[#6b5f58] dark:text-[#9b9a92]">
                Use the 6-digit code from your authenticator app. You may also
                use one of your backup codes.
              </p>

              {apiError && (
                <div
                  className="mt-5 flex items-start gap-2.5 rounded-[10px] border border-[rgba(217,69,53,0.2)] border-l-[3px] border-l-[#d94535] bg-[rgba(217,69,53,0.07)] px-3.5 py-3 text-[13px] leading-normal text-[#d94535] dark:border-l-[#ff6b5f] dark:bg-[rgba(255,107,95,0.10)] dark:text-[#ff6b5f]"
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
                  onChange={(event) =>
                    setCode(normalizeCodeInput(event.target.value))
                  }
                  onBlur={() => setTouched(true)}
                  placeholder="123456 or ABCDE-12345"
                  autoFocus
                  autoComplete="one-time-code"
                  inputMode="text"
                  className={cn(
                    'mt-1.5 w-full rounded-xl border-[1.5px] bg-white px-4 py-3.5 text-center font-mono text-[17px] font-bold tracking-[0.12em] text-[#1a1714] outline-none transition',
                    'placeholder:text-[13px] placeholder:font-normal placeholder:tracking-normal placeholder:text-[#9f8f86]',
                    'focus:border-[#b84c2b] focus:shadow-[0_0_0_3px_rgba(184,76,43,0.09)]',
                    'dark:border-white/15 dark:bg-[#252320] dark:text-[#f2f0eb] dark:placeholder:text-[#aaa59d]',
                    'dark:focus:border-[#e8816a] dark:focus:shadow-[0_0_0_3px_rgba(232,129,106,0.18)]',
                    formError &&
                      'border-[#d94535] bg-[rgba(217,69,53,0.07)] shadow-[0_0_0_3px_rgba(217,69,53,0.08)] dark:border-[#ff6b5f] dark:bg-[rgba(255,107,95,0.10)]'
                  )}
                  aria-invalid={!!formError}
                  aria-describedby={formError ? 'two-factor-error' : undefined}
                />

                {formError && (
                  <div
                    id="two-factor-error"
                    role="alert"
                    className="mt-2 flex items-center gap-1.5 text-[11.5px] leading-normal text-[#d94535] dark:text-[#ff6b5f]"
                  >
                    <AlertIcon />
                    <span>{formError}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={
                  verifyTwoFactor.isPending ||
                  !isValidTwoFactorCode(code)
                }
                className={cn(
                  'mt-5 w-full rounded-xl bg-[#b84c2b] px-5 py-3.5 text-[15px] font-bold text-[#f5ede4] transition',
                  'hover:-translate-y-px hover:bg-[#963d22] hover:shadow-[0_6px_20px_rgba(184,76,43,0.30)]',
                  'disabled:cursor-not-allowed disabled:opacity-65 disabled:hover:translate-y-0 disabled:hover:shadow-none',
                  'dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a]'
                )}
              >
                {verifyTwoFactor.isPending
                  ? 'Verifying...'
                  : 'Verify and Continue'}
              </button>

              <div className="mt-5 flex flex-col gap-2 text-center text-[12.5px] text-[#6b5f58] dark:text-[#9b9a92]">
                <p>
                  Lost access to your authenticator? Use a saved backup code.
                </p>

                <Link
                  to="/login"
                  className="font-medium text-[#b84c2b] transition hover:underline dark:text-[#e8816a]"
                >
                  Back to sign in
                </Link>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}