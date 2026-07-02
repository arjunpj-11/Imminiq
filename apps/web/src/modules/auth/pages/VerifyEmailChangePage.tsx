import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { AxiosError } from 'axios'

import { useVerifyEmailChange } from '../../settings'
import type { AuthApiErrorResponse, VerificationStatus } from '../types/auth.types'
import { STORAGE_KEYS } from '../../../lib/storage/storage-keys'
import { safeLocalStorage } from '../../../lib/storage/safe-storage'

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
    if (!token || hasStartedRef.current) return

    hasStartedRef.current = true

    const verify = async () => {
      try {
        await verifyEmailChange.mutateAsync(token)

        safeLocalStorage.set(
          STORAGE_KEYS.authSync,
          JSON.stringify({
            type: 'EMAIL_CHANGED_LOGOUT',
            timestamp: Date.now(),
          })
        )

        setStatus('success')
      } catch (error) {
        const axiosError = error as AxiosError<AuthApiErrorResponse>

        setErrorMessage(
          axiosError.response?.data?.message ??
            'This verification link is invalid, expired, or already used.'
        )
        setStatus('error')
      }
    }

    void verify()
  }, [token, verifyEmailChange])

  const title =
    status === 'loading'
      ? 'Verifying email change'
      : status === 'success'
        ? 'Email changed successfully'
        : status === 'missing-token'
          ? 'Missing verification token'
          : 'Verification failed'

  const description =
    status === 'loading'
      ? 'Please wait while Imminiq verifies your new email address.'
      : status === 'success'
        ? 'Your email address was updated. For security, please sign in again.'
        : status === 'missing-token'
          ? 'The verification token is missing from this link.'
          : errorMessage

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5ede4] px-4 py-10 font-['DM_Sans',sans-serif] text-[#1a1714] dark:bg-[#141412] dark:text-[#f2f0eb]">
      <div className="pointer-events-none absolute -left-30 -top-30 h-85 w-85 rounded-full bg-[rgba(184,76,43,0.12)] blur-3xl dark:bg-[rgba(232,129,106,0.10)]" />
      <div className="pointer-events-none absolute -bottom-35 -right-30 h-90 w-90 rounded-full bg-[rgba(59,108,183,0.10)] blur-3xl dark:bg-[rgba(107,159,232,0.08)]" />

      <div className="relative w-full max-w-140 overflow-hidden rounded-[28px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] shadow-[0_24px_80px_rgba(26,23,20,0.14)] dark:border-white/9 dark:bg-[#1e1c19]">
        <div className="h-1.25 bg-[#b84c2b] dark:bg-[#e8816a]" />

        <div className="px-6 py-8 text-center sm:px-10 sm:py-10">
          <div className="mb-7">
            <div className="text-[30px] font-black tracking-[-0.8px] text-[#1a1714] dark:text-[#f2f0eb]">
              immin<span className="text-[#b84c2b] dark:text-[#e8816a]">iq</span>
            </div>
          </div>

          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(184,76,43,0.08)] text-[#b84c2b] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]">
            {status === 'loading' ? (
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : status === 'success' ? (
              '✓'
            ) : (
              '!'
            )}
          </div>

          <div className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-[#b84c2b] dark:text-[#e8816a]">
            Security Verification
          </div>

          <h1 className="font-serif text-[clamp(24px,5vw,32px)] font-bold tracking-[-0.5px]">
            {title}
          </h1>

          <p className="mx-auto mt-3 max-w-100 text-[13.5px] leading-[1.7] text-[#6b5f58] dark:text-[#9b9a92]">
            {description}
          </p>

          {status !== 'loading' && (
            <button
              type="button"
              onClick={() => navigate('/login', { replace: true })}
              className="mt-7 rounded-[11px] bg-[#b84c2b] px-6 py-3 text-[14px] font-bold text-[#f5ede4] transition hover:-translate-y-px hover:bg-[#963d22] dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a]"
            >
              Go to login
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
