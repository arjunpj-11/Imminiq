// apps/web/src/modules/auth/pages/VerifyEmailChangePage.tsx

import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { AxiosError } from 'axios'
import { useVerifyEmailChange } from '../../../hooks/settings/useSecuritySettings'

type ApiErrorResponse = {
  message?: string
}

type VerificationStatus =
  | 'loading'
  | 'success'
  | 'error'
  | 'missing-token'

export default function VerifyEmailChangePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const verifyEmailChange = useVerifyEmailChange()

  const token = searchParams.get('token')
  const hasStartedRef = useRef(false)

  const [status, setStatus] = useState<VerificationStatus>(
    token ? 'loading' : 'missing-token'
  )

  const [errorMessage, setErrorMessage] = useState(
    'This verification link is invalid, expired, or already used.'
  )

 useEffect(() => {
  if (!token || hasStartedRef.current) {
    return
  }

  hasStartedRef.current = true

  const verify = async () => {
    try {
      await verifyEmailChange.mutateAsync(token)


localStorage.setItem(
  'imminiq-auth-sync',
  JSON.stringify({
    type: 'EMAIL_CHANGED_LOGOUT',
    timestamp: Date.now(),
  })
)


      setStatus('success')
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>

      setErrorMessage(
        axiosError.response?.data?.message ??
          'This verification link is invalid, expired, or already used.'
      )

      setStatus('error')
    }
  }

  void verify()
}, [token, verifyEmailChange])

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5ede4] px-4 py-10 font-['DM_Sans',sans-serif] text-[#1a1714] dark:bg-[#141412] dark:text-[#f2f0eb]">
      <div className="pointer-events-none absolute -left-30 -top-30 h-85 w-85 rounded-full bg-[rgba(184,76,43,0.12)] blur-3xl dark:bg-[rgba(232,129,106,0.10)]" />
      <div className="pointer-events-none absolute -bottom-35 -right-30 h-90 w-90 rounded-full bg-[rgba(59,108,183,0.10)] blur-3xl dark:bg-[rgba(107,159,232,0.08)]" />

      <div className="relative w-full max-w-140 overflow-hidden rounded-[28px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] shadow-[0_24px_80px_rgba(26,23,20,0.14)] dark:border-white/9 dark:bg-[#1e1c19]">
        <div className="h-1.25 bg-[#b84c2b] dark:bg-[#e8816a]" />

        <div className="px-6 py-8 text-center sm:px-10 sm:py-10">
          <div className="mb-7">
            <div className="text-[30px] font-black tracking-[-0.8px] text-[#1a1714] dark:text-[#f2f0eb]">
              immin
              <span className="text-[#b84c2b] dark:text-[#e8816a]">
                iq
              </span>
            </div>

            <p className="mt-2 font-['DM_Mono',monospace] text-[10px] uppercase tracking-[0.18em] text-[#6b5f58] dark:text-[#9b9a92]">
              Email Change Verification
            </p>
          </div>

          {status === 'missing-token' && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(196,60,60,0.10)] text-[28px]">
                ⚠️
              </div>

              <h1 className="mt-5 font-['Playfair_Display',serif] text-[30px] font-extrabold tracking-[-0.7px] text-[#1a1714] dark:text-[#f2f0eb]">
                Invalid Verification Link
              </h1>

              <p className="mx-auto mt-4 max-w-107.5 text-[14px] leading-[1.75] text-[#6b5f58] dark:text-[#9b9a92]">
                The verification token is missing. Please open the complete
                verification link sent to your new email address.
              </p>

              <button
                type="button"
                onClick={() => navigate('/settings/security')}
                className="mt-7 rounded-[13px] bg-[#b84c2b] px-6 py-3 text-[14px] font-bold text-white transition hover:-translate-y-px hover:bg-[#963d22] dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a]"
              >
                Back to Security Settings
              </button>
            </>
          )}

          {status === 'loading' && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(184,76,43,0.10)] text-[28px] dark:bg-[rgba(232,129,106,0.12)]">
                ✉️
              </div>

              <h1 className="mt-5 font-['Playfair_Display',serif] text-[30px] font-extrabold tracking-[-0.7px] text-[#1a1714] dark:text-[#f2f0eb]">
                Verifying Your New Email
              </h1>

              <p className="mx-auto mt-4 max-w-107.5 text-[14px] leading-[1.75] text-[#6b5f58] dark:text-[#9b9a92]">
                Please wait while Imminiq confirms your email change request.
              </p>

              <div className="mx-auto mt-7 h-2 w-full max-w-[320px] overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                <div className="h-full w-1/2 animate-pulse rounded-full bg-[#b84c2b] dark:bg-[#e8816a]" />
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(45,106,71,0.12)] text-[30px]">
                ✅
              </div>

              <h1 className="mt-5 font-['Playfair_Display',serif] text-[30px] font-extrabold tracking-[-0.7px] text-[#2d6a47] dark:text-[#5cc98a]">
                Email Updated Successfully
              </h1>

              <p className="mx-auto mt-4 max-w-112.5 text-[14px] leading-[1.75] text-[#6b5f58] dark:text-[#9b9a92]">
                Your new email address has been verified and saved. For
                security, your active sessions were revoked. Please sign in
                again using your updated email.
              </p>

              <div className="mt-7 rounded-2xl border border-[rgba(45,106,71,0.18)] bg-[rgba(45,106,71,0.08)] px-4 py-3 text-[13px] font-semibold text-[#2d6a47] dark:text-[#5cc98a]">
                Verification complete.
              </div>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="mt-7 rounded-[13px] bg-[#b84c2b] px-6 py-3 text-[14px] font-bold text-white transition hover:-translate-y-px hover:bg-[#963d22] dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a]"
              >
                Go to Login
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(196,60,60,0.10)] text-[28px]">
                ❌
              </div>

              <h1 className="mt-5 font-['Playfair_Display',serif] text-[30px] font-extrabold tracking-[-0.7px] text-[#c43c3c] dark:text-[#e05252]">
                Verification Failed
              </h1>

              <p className="mx-auto mt-4 max-w-112.5 text-[14px] leading-[1.75] text-[#6b5f58] dark:text-[#9b9a92]">
                {errorMessage}
              </p>

              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/settings/security')}
                  className="rounded-[13px] border-[1.5px] border-[#e0d0c5] px-6 py-3 text-[14px] font-bold text-[#1a1714] transition hover:border-[#b84c2b] hover:text-[#b84c2b] dark:border-white/9 dark:text-[#f2f0eb] dark:hover:border-[#e8816a] dark:hover:text-[#e8816a]"
                >
                  Back to Security
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="rounded-[13px] bg-[#b84c2b] px-6 py-3 text-[14px] font-bold text-white transition hover:-translate-y-px hover:bg-[#963d22] dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a]"
                >
                  Go to Login
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}