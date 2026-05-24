import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { AxiosError } from 'axios'

import SettingsShell from '../components/SettingsShell'
import SettingsContentLoading from '../components/SettingsContentLoading'
import {
  MonoLabel,
  SettingsCard,
  SettingsToast,
  TextField,
} from '../components/SettingsUi'
import { useSettingsToast } from '../hooks/useSettingsToast'

import {
  useChangeEmail,
  useChangePassword,
  useDeleteAccount,
  useDisableTwoFactor,
  useSecurityOverview,
  useSetupTwoFactor,
  useTerminateSession,
  useVerifyTwoFactorSetup,
} from '../../../hooks/settings/useSecuritySettings'

import type {
  ChangeEmailPayload,
  DeleteAccountPayload,
  TwoFactorSetupResponse,
} from '../../../types/settings.types'

import { useAuthStore } from '../../../store/useAuthStore'

type ApiErrorResponse = {
  message?: string
  error?: {
    message?: string
  }
  errors?: Array<{
    message?: string
  }>
}

type PendingEmailTimer = {
  email: string
  expiresAt: number
}

const EMAIL_CHANGE_EXPIRY_MINUTES = 10
const EMAIL_CHANGE_EXPIRY_MS =
  EMAIL_CHANGE_EXPIRY_MINUTES * 60 * 1000

const PENDING_EMAIL_TIMER_STORAGE_KEY =
  'imminiq_pending_email_change_timer'

const getApiErrorMessage = (
  error: unknown,
  fallbackMessage: string
): string => {
  const axiosError = error as AxiosError<ApiErrorResponse>

  return (
    axiosError.response?.data?.message ??
    axiosError.response?.data?.error?.message ??
    axiosError.response?.data?.errors?.[0]?.message ??
    fallbackMessage
  )
}

const normalizeEmail = (email?: string | null) => {
  return email?.trim().toLowerCase() ?? ''
}

const getSecondsRemaining = (expiresAt: number) => {
  return Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000))
}

const formatCountdown = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(
    remainingSeconds
  ).padStart(2, '0')}`
}

const readPendingEmailTimer = (): PendingEmailTimer | null => {
  try {
    const raw = localStorage.getItem(PENDING_EMAIL_TIMER_STORAGE_KEY)

    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as PendingEmailTimer

    if (
      !parsed ||
      typeof parsed.email !== 'string' ||
      typeof parsed.expiresAt !== 'number'
    ) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

const savePendingEmailTimer = (timer: PendingEmailTimer) => {
  localStorage.setItem(
    PENDING_EMAIL_TIMER_STORAGE_KEY,
    JSON.stringify(timer)
  )
}

function passwordScore(password: string) {
  let score = 0

  if (password.length >= 8) score += 30
  if (password.length >= 12) score += 20
  if (/[A-Z]/.test(password)) score += 15
  if (/[0-9]/.test(password)) score += 15
  if (/[^A-Za-z0-9]/.test(password)) score += 20

  return Math.min(100, score)
}

const InlineError = ({ message }: { message: string }) => {
  return (
    <div
      role="alert"
      className="rounded-xl border border-[rgba(196,60,60,0.24)] bg-[rgba(196,60,60,0.08)] px-3.5 py-2.5 text-[12.5px] font-semibold leading-[1.55] text-[#c43c3c] dark:text-[#e05252]"
    >
      {message}
    </div>
  )
}

export default function AccountSecuritySettingsPage() {
  const navigate = useNavigate()
  const clearAuth = useAuthStore((state) => state.clearAuth)

  const securityQuery = useSecurityOverview()
  const changeEmail = useChangeEmail()
  const changePassword = useChangePassword()
  const terminateSession = useTerminateSession()
  const setupTwoFactor = useSetupTwoFactor()
  const verifyTwoFactorSetup = useVerifyTwoFactorSetup()
  const disableTwoFactor = useDisableTwoFactor()
  const deleteAccount = useDeleteAccount()
  const toast = useSettingsToast()

  const [newEmail, setNewEmail] = useState('')
  const [emailChangePassword, setEmailChangePassword] = useState('')
  const [emailChangeTwoFactorCode, setEmailChangeTwoFactorCode] = useState('')
  const [emailChangeError, setEmailChangeError] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const [pendingEmailTimer, setPendingEmailTimer] =
    useState<PendingEmailTimer | null>(() => readPendingEmailTimer())

  const [pendingEmailSecondsLeft, setPendingEmailSecondsLeft] =
    useState<number>(() => {
      const savedTimer = readPendingEmailTimer()

      return savedTimer
        ? getSecondsRemaining(savedTimer.expiresAt)
        : 0
    })

  const [twoFactorSetupOpen, setTwoFactorSetupOpen] = useState(false)
  const [twoFactorSetupData, setTwoFactorSetupData] =
    useState<TwoFactorSetupResponse | null>(null)
  const [twoFactorVerifyToken, setTwoFactorVerifyToken] = useState('')
  const [twoFactorVerifyError, setTwoFactorVerifyError] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])

  const [disableTwoFactorOpen, setDisableTwoFactorOpen] = useState(false)
  const [disableTwoFactorToken, setDisableTwoFactorToken] = useState('')
  const [disableTwoFactorError, setDisableTwoFactorError] = useState('')

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [deleteCurrentPassword, setDeleteCurrentPassword] = useState('')
  const [deleteTwoFactorCode, setDeleteTwoFactorCode] = useState('')
  const [deleteAccountError, setDeleteAccountError] = useState('')

  const score = useMemo(() => passwordScore(newPassword), [newPassword])

  const scoreLabel =
    score >= 80 ? 'Strong' : score >= 50 ? 'Medium' : 'Weak'

  const security = securityQuery.data

  const providerLabel =
    security?.authProvider === 'google'
      ? 'Google'
      : security?.authProvider === 'github'
        ? 'GitHub'
        : 'Imminiq'

  const stepUpRequiresPassword = Boolean(security?.canChangePassword)
  const stepUpRequiresTwoFactor = Boolean(security?.twoFactorEnabled)

  const sensitiveActionUnavailableForSocialAccount =
    Boolean(security) &&
    !stepUpRequiresPassword &&
    !stepUpRequiresTwoFactor

  const pendingEmail = normalizeEmail(security?.pendingEmail)

  const timerMatchesPendingEmail =
    !!pendingEmailTimer &&
    normalizeEmail(pendingEmailTimer.email) === pendingEmail

  const pendingEmailTimerExpired =
    timerMatchesPendingEmail &&
    pendingEmailSecondsLeft <= 0

  const showPendingEmailNotice =
    !!security?.pendingEmail && !pendingEmailTimerExpired

  const showPendingEmailTimer =
    showPendingEmailNotice &&
    timerMatchesPendingEmail &&
    pendingEmailSecondsLeft > 0

  const emailChangeStepUpReady =
    (!stepUpRequiresPassword || !!emailChangePassword) &&
    (!stepUpRequiresTwoFactor || emailChangeTwoFactorCode.length === 6)

  const deleteStepUpReady =
    (!stepUpRequiresPassword || !!deleteCurrentPassword) &&
    (!stepUpRequiresTwoFactor || deleteTwoFactorCode.length === 6)

  useEffect(() => {
    if (!pendingEmailTimer) {
      return
    }

    const updateCountdown = () => {
      const remaining = getSecondsRemaining(
        pendingEmailTimer.expiresAt
      )

      setPendingEmailSecondsLeft(remaining)
    }

    updateCountdown()

    const intervalId = window.setInterval(() => {
      updateCountdown()
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [pendingEmailTimer])

  if (securityQuery.isLoading) {
    return (
      <SettingsShell
        title="Account Security"
        subtitle="Manage your email, password, sessions, two-factor authentication and account safety."
      >
        <SettingsContentLoading
          eyebrow="Loading Security"
          title="Preparing account security"
          description="Fetching your email, password options, sessions, and two-factor settings."
        />
      </SettingsShell>
    )
  }

  const handleEmailUpdate = async () => {
    try {
      setEmailChangeError('')

      const payload: ChangeEmailPayload = {
        newEmail,
        ...(stepUpRequiresPassword
          ? { currentPassword: emailChangePassword }
          : {}),
        ...(stepUpRequiresTwoFactor
          ? { twoFactorCode: emailChangeTwoFactorCode }
          : {}),
      }

      const result = await changeEmail.mutateAsync(payload)

      const timer: PendingEmailTimer = {
        email: normalizeEmail(result.pendingEmail),
        expiresAt: Date.now() + EMAIL_CHANGE_EXPIRY_MS,
      }

      savePendingEmailTimer(timer)
      setPendingEmailTimer(timer)
      setPendingEmailSecondsLeft(
        getSecondsRemaining(timer.expiresAt)
      )

      setNewEmail('')
      setEmailChangePassword('')
      setEmailChangeTwoFactorCode('')

      toast.showToast(
        'Verification link sent to the new email. Your current email will stay unchanged until it is verified.',
        'success'
      )
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        'Unable to send email verification link.'
      )

      setEmailChangeError(message)
      toast.showToast(message, 'error')
    }
  }

  const handlePasswordUpdate = async () => {
    try {
      await changePassword.mutateAsync({
        currentPassword,
        newPassword,
      })

      setCurrentPassword('')
      setNewPassword('')

      toast.showToast(
        'Password updated successfully. Your sessions may need to sign in again.',
        'success'
      )
    } catch (error) {
      toast.showToast(
        getApiErrorMessage(error, 'Unable to update password.'),
        'error'
      )
    }
  }

  const handleTerminateSession = async (sessionId: string) => {
    try {
      await terminateSession.mutateAsync(sessionId)
      toast.showToast('Session terminated.', 'success')
    } catch (error) {
      toast.showToast(
        getApiErrorMessage(error, 'Unable to terminate session.'),
        'error'
      )
    }
  }

  const handleStartTwoFactorSetup = async () => {
    try {
      const setup = await setupTwoFactor.mutateAsync()

      setTwoFactorSetupData(setup)
      setTwoFactorVerifyToken('')
      setTwoFactorVerifyError('')
      setBackupCodes([])
      setTwoFactorSetupOpen(true)

      toast.showToast('Scan the QR code to finish 2FA setup.', 'success')
    } catch (error) {
      toast.showToast(
        getApiErrorMessage(error, 'Unable to start 2FA setup.'),
        'error'
      )
    }
  }

  const handleVerifyTwoFactorSetup = async () => {
    try {
      setTwoFactorVerifyError('')

      const result = await verifyTwoFactorSetup.mutateAsync({
        token: twoFactorVerifyToken,
      })

      setBackupCodes(result.backupCodes)
      setTwoFactorVerifyToken('')

      toast.showToast(
        'Two-factor authentication enabled successfully.',
        'success'
      )
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        'Unable to verify authenticator code.'
      )

      setTwoFactorVerifyError(message)
      toast.showToast(message, 'error')
    }
  }

  const handleCloseTwoFactorSetup = () => {
    setTwoFactorSetupOpen(false)
    setTwoFactorSetupData(null)
    setTwoFactorVerifyToken('')
    setTwoFactorVerifyError('')
    setBackupCodes([])
  }

  const handleDisableTwoFactor = async () => {
    try {
      setDisableTwoFactorError('')

      await disableTwoFactor.mutateAsync({
        token: disableTwoFactorToken,
      })

      setDisableTwoFactorToken('')
      setDisableTwoFactorError('')
      setDisableTwoFactorOpen(false)

      toast.showToast(
        'Two-factor authentication disabled.',
        'success'
      )
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unable to disable 2FA.')

      setDisableTwoFactorError(message)
      toast.showToast(message, 'error')
    }
  }

  const resetDeleteModal = () => {
    setDeleteModalOpen(false)
    setDeleteConfirmation('')
    setDeleteCurrentPassword('')
    setDeleteTwoFactorCode('')
    setDeleteAccountError('')
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      const message = 'Type DELETE to confirm account deletion.'

      setDeleteAccountError(message)
      toast.showToast(message, 'error')
      return
    }

    try {
      setDeleteAccountError('')

      const payload: DeleteAccountPayload = {
        confirmation: 'DELETE',
        ...(stepUpRequiresPassword
          ? { currentPassword: deleteCurrentPassword }
          : {}),
        ...(stepUpRequiresTwoFactor
          ? { twoFactorCode: deleteTwoFactorCode }
          : {}),
      }

      await deleteAccount.mutateAsync(payload)

      resetDeleteModal()
      clearAuth()

      navigate('/login', {
        replace: true,
      })
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        'Unable to schedule account deletion.'
      )

      setDeleteAccountError(message)
      toast.showToast(message, 'error')
    }
  }

  return (
    <SettingsShell
      title="Account Security"
      subtitle="Manage your email, password, sessions, two-factor authentication and account safety."
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          {/* ─── EMAIL ADDRESS ───────────────────────────── */}
          <SettingsCard
            title="Email Address"
            description="Your primary scholarly identifier."
            icon="✉️"
          >
            <div className="mb-4 flex flex-wrap items-center gap-2 rounded-[14px] bg-[#f9f3ef] px-4 py-3 dark:bg-[#1a1816]">
              <strong className="text-[14px]">
                {security?.email ?? 'Email not loaded'}
              </strong>

              {security?.emailVerified ? (
                <span className="rounded-full bg-[rgba(45,106,71,0.12)] px-2.5 py-1 text-[11px] font-bold text-[#2d6a47] dark:text-[#5cc98a]">
                  Verified
                </span>
              ) : (
                <span className="rounded-full bg-[rgba(196,60,60,0.10)] px-2.5 py-1 text-[11px] font-bold text-[#c43c3c] dark:text-[#e05252]">
                  Unverified
                </span>
              )}
            </div>

            {showPendingEmailNotice && security?.pendingEmail && (
              <div className="mb-4 rounded-[14px] border border-[rgba(184,76,43,0.22)] bg-[rgba(184,76,43,0.08)] px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.16em] text-[#b84c2b] dark:text-[#e8816a]">
                    Pending Email Change
                  </div>

                  {showPendingEmailTimer && (
                    <div className="rounded-full border border-[rgba(184,76,43,0.22)] bg-white/70 px-2.5 py-1 font-['DM_Mono',monospace] text-[10px] font-bold uppercase tracking-[0.08em] text-[#b84c2b] dark:bg-[#1a1816]/80 dark:text-[#e8816a]">
                      Link expires in {formatCountdown(pendingEmailSecondsLeft)}
                    </div>
                  )}
                </div>

                <p className="mt-2 text-[13px] leading-[1.6] text-[#6b5f58] dark:text-[#9b9a92]">
                  A verification link was sent to{' '}
                  <strong className="text-[#1a1714] dark:text-[#f2f0eb]">
                    {security.pendingEmail}
                  </strong>
                  . Your current email will remain active until that link is
                  verified.
                </p>
              </div>
            )}

            {sensitiveActionUnavailableForSocialAccount && (
              <div className="mb-4 rounded-[14px] border border-[rgba(59,108,183,0.20)] bg-[rgba(59,108,183,0.08)] px-4 py-3 text-[13px] leading-[1.65] text-[#6b5f58] dark:text-[#9b9a92]">
                This {providerLabel} account has no local password. Enable
                two-factor authentication first to securely change your email.
              </div>
            )}

            <div className="grid gap-3">
              <TextField
                label="New Email Address"
                value={newEmail}
                onChange={(value) => {
                  setNewEmail(value)
                  setEmailChangeError('')
                }}
                type="email"
                placeholder="you@example.com"
              />

              {stepUpRequiresPassword && (
                <TextField
                  label="Current Password"
                  value={emailChangePassword}
                  onChange={(value) => {
                    setEmailChangePassword(value)
                    setEmailChangeError('')
                  }}
                  type="password"
                  placeholder="Re-enter your password"
                />
              )}

              {stepUpRequiresTwoFactor && (
                <TextField
                  label="Two-Factor Code"
                  value={emailChangeTwoFactorCode}
                  onChange={(value) => {
                    setEmailChangeTwoFactorCode(value)
                    setEmailChangeError('')
                  }}
                  placeholder="123456"
                />
              )}

              {emailChangeError && (
                <InlineError message={emailChangeError} />
              )}

              <div>
                <button
                  type="button"
                  onClick={handleEmailUpdate}
                  disabled={
                    !newEmail ||
                    !emailChangeStepUpReady ||
                    sensitiveActionUnavailableForSocialAccount ||
                    changeEmail.isPending
                  }
                  className="h-11.5 rounded-[11px] bg-[#b84c2b] px-5 text-[13px] font-bold text-[#fdf8f5] transition disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#e8816a] dark:text-[#141412]"
                >
                  {changeEmail.isPending ? 'Sending...' : 'Send Verify Link'}
                </button>
              </div>
            </div>
          </SettingsCard>

          {/* ─── PASSWORD ───────────────────────────────── */}
          <SettingsCard
            title="Security & Password"
            description="Maintain the integrity of your archive."
            icon="🔐"
          >
            {security?.canChangePassword ? (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <TextField
                    label="Current Password"
                    value={currentPassword}
                    onChange={setCurrentPassword}
                    type="password"
                    placeholder="Current password"
                  />

                  <TextField
                    label="New Password"
                    value={newPassword}
                    onChange={setNewPassword}
                    type="password"
                    placeholder="New password"
                  />
                </div>

                <div className="mt-5 rounded-2xl bg-[#f9f3ef] p-4 dark:bg-[#1a1816]">
                  <div className="mb-2 flex items-center justify-between">
                    <MonoLabel>Password Strength</MonoLabel>

                    <span className="text-[12px] font-bold text-[#b84c2b] dark:text-[#e8816a]">
                      {scoreLabel} · {score}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-[#b84c2b] transition-all dark:bg-[#e8816a]"
                      style={{ width: `${score}%` }}
                    />
                  </div>

                  <div className="mt-4 grid gap-2 text-[12px] text-[#6b5f58] dark:text-[#9b9a92]">
                    <div>• At least 8 characters</div>
                    <div>• Includes a number or symbol</div>
                    <div>• Uses uppercase letters for stronger protection</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePasswordUpdate}
                  disabled={
                    !currentPassword ||
                    !newPassword ||
                    changePassword.isPending
                  }
                  className="mt-4 rounded-[11px] bg-[#b84c2b] px-5 py-3 text-[13px] font-bold text-[#fdf8f5] transition disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#e8816a] dark:text-[#141412]"
                >
                  {changePassword.isPending
                    ? 'Updating...'
                    : 'Update Password'}
                </button>
              </>
            ) : (
              <div className="rounded-2xl border border-[rgba(59,108,183,0.20)] bg-[rgba(59,108,183,0.08)] p-5">
                <div className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.16em] text-[#3b6cb7] dark:text-[#6b9fe8]">
                  Password Managed Externally
                </div>

                <h3 className="mt-2 text-[16px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">
                  Password managed by {providerLabel}
                </h3>

                <p className="mt-2 max-w-2xl text-[13px] leading-[1.7] text-[#6b5f58] dark:text-[#9b9a92]">
                  This account signs in using {providerLabel} OAuth, so there is
                  no separate Imminiq password to change here.
                </p>
              </div>
            )}
          </SettingsCard>

          {/* ─── ACTIVE SESSIONS ─────────────────────────── */}
          <SettingsCard
            title="Active Sessions"
            description="Review logged-in devices and terminate suspicious sessions."
            icon="💻"
          >
            <div className="space-y-3">
              {(security?.activeSessions ?? []).length === 0 && (
                <div className="rounded-[14px] border border-dashed border-[#e0d0c5] p-4 text-[13px] text-[#6b5f58] dark:border-white/9 dark:text-[#9b9a92]">
                  No active sessions found.
                </div>
              )}

              {(security?.activeSessions ?? []).map((session) => (
                <div
                  key={session.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-[1.5px] border-[#e0d0c5] p-4 dark:border-white/9"
                >
                  <div>
                    <div className="flex items-center gap-2 text-[14px] font-bold">
                      {session.deviceName}

                      {session.current && (
                        <span className="rounded-full bg-[rgba(45,106,71,0.12)] px-2 py-0.5 text-[10px] text-[#2d6a47] dark:text-[#5cc98a]">
                          Current
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-[12.5px] text-[#6b5f58] dark:text-[#9b9a92]">
                      {session.location} · {session.client} ·{' '}
                      {session.lastActive}
                    </p>
                  </div>

                  {!session.current && (
                    <button
                      type="button"
                      onClick={() => handleTerminateSession(session.id)}
                      disabled={terminateSession.isPending}
                      className="rounded-[10px] border-[1.5px] border-[#e0d0c5] px-4 py-2 text-[12px] font-bold text-[#6b5f58] transition hover:border-[#e8816a] hover:text-[#b84c2b] disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/9 dark:text-[#9b9a92]"
                    >
                      Terminate
                    </button>
                  )}
                </div>
              ))}
            </div>
          </SettingsCard>

          {/* ─── TWO FACTOR AUTH ─────────────────────────── */}
          <SettingsCard
            title="Two-Factor Authentication"
            description="Add a second layer of security to protect your account."
            icon="🛡️"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-[15px] font-bold">
                  {security?.twoFactorEnabled ? '2FA Enabled' : '2FA Disabled'}
                </div>

                <p className="mt-1 max-w-2xl text-[13px] text-[#6b5f58] dark:text-[#9b9a92]">
                  Secure your Imminiq archive with a verification step beyond
                  your password.
                </p>
              </div>

              {security?.twoFactorEnabled ? (
                <button
                  type="button"
                  onClick={() => {
                    setDisableTwoFactorOpen(true)
                    setDisableTwoFactorError('')
                  }}
                  className="rounded-[11px] border-[1.5px] border-[rgba(196,60,60,0.30)] bg-[rgba(196,60,60,0.08)] px-5 py-3 text-[13px] font-bold text-[#c43c3c] transition hover:bg-[rgba(196,60,60,0.12)] dark:text-[#e05252]"
                >
                  Disable 2FA
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartTwoFactorSetup}
                  disabled={setupTwoFactor.isPending}
                  className="rounded-[11px] bg-[#2d6a47] px-5 py-3 text-[13px] font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#5cc98a] dark:text-[#141412]"
                >
                  {setupTwoFactor.isPending ? 'Preparing...' : 'Enable 2FA'}
                </button>
              )}
            </div>
          </SettingsCard>

          {/* ─── DANGER ZONE ─────────────────────────────── */}
          <div className="rounded-[18px] border-[1.5px] border-[rgba(196,60,60,0.22)] bg-[rgba(196,60,60,0.08)] p-5">
            <h2 className="font-['Playfair_Display',serif] text-[20px] font-extrabold text-[#c43c3c] dark:text-[#e05252]">
              Danger Zone
            </h2>

            <p className="mt-2 text-[13px] leading-[1.6] text-[#6b5f58] dark:text-[#9b9a92]">
              Deleting your account starts a <strong>30-day recovery period</strong>.
              Your active sessions will be signed out immediately, and the
              account will be scheduled for deletion. Signing in again within
              30 days automatically cancels the deletion request.
            </p>

            {sensitiveActionUnavailableForSocialAccount && (
              <p className="mt-3 rounded-xl border border-[rgba(59,108,183,0.20)] bg-[rgba(59,108,183,0.08)] px-3 py-2 text-[12.5px] leading-[1.6] text-[#6b5f58] dark:text-[#9b9a92]">
                Enable two-factor authentication first before deleting this
                {` ${providerLabel}`} account.
              </p>
            )}

            <button
              type="button"
              onClick={() => {
                setDeleteModalOpen(true)
                setDeleteAccountError('')
              }}
              disabled={sensitiveActionUnavailableForSocialAccount}
              className="mt-4 rounded-[11px] bg-[#c43c3c] px-5 py-3 text-[13px] font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              Delete My Archive
            </button>
          </div>
        </div>

        {/* ─── RIGHT SUMMARY ───────────────────────────── */}
        <aside className="space-y-5">
          <SettingsCard title="Security Overview" icon="📌">
            <div className="space-y-4 text-[13px]">
              <div>
                <MonoLabel>Email</MonoLabel>
                <strong>{security?.email ?? 'Unavailable'}</strong>
              </div>

              <div>
                <MonoLabel>Email Status</MonoLabel>
                <strong>
                  {security?.emailVerified ? 'Verified' : 'Unverified'}
                </strong>
              </div>

              {showPendingEmailNotice && security?.pendingEmail && (
                <div>
                  <MonoLabel>Pending New Email</MonoLabel>
                  <strong>{security.pendingEmail}</strong>

                  {showPendingEmailTimer && (
                    <p className="mt-1 font-['DM_Mono',monospace] text-[11px] font-bold text-[#b84c2b] dark:text-[#e8816a]">
                      Expires in {formatCountdown(pendingEmailSecondsLeft)}
                    </p>
                  )}
                </div>
              )}

              <div>
                <MonoLabel>Two-Factor</MonoLabel>
                <strong>
                  {security?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </strong>
              </div>

              <div>
                <MonoLabel>Active Sessions</MonoLabel>
                <strong>{security?.activeSessions?.length ?? 0}</strong>
              </div>
            </div>
          </SettingsCard>
        </aside>
      </div>

      {/* ─── 2FA SETUP MODAL ─────────────────────────── */}
      {twoFactorSetupOpen && twoFactorSetupData && (
        <div className="fixed inset-0 z-160 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-160 overflow-y-auto rounded-3xl border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-6 shadow-2xl dark:border-white/9 dark:bg-[#1e1c19]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.18em] text-[#b84c2b] dark:text-[#e8816a]">
                  Two-Factor Setup
                </p>

                <h2 className="mt-2 font-['Playfair_Display',serif] text-[26px] font-extrabold">
                  Scan this QR code
                </h2>
              </div>

              <button
                type="button"
                onClick={handleCloseTwoFactorSetup}
                className="rounded-full border border-[#e0d0c5] px-3 py-1.5 text-[13px] font-bold dark:border-white/9"
              >
                ✕
              </button>
            </div>

            {backupCodes.length === 0 ? (
              <>
                <div className="mt-6 grid gap-6 md:grid-cols-[220px_1fr]">
                  <div className="rounded-[18px] bg-white p-4 dark:bg-white">
                    <img
                      src={twoFactorSetupData.qrCodeDataUrl}
                      alt="Two-factor authentication QR code"
                      className="h-full w-full"
                    />
                  </div>

                  <div>
                    <p className="text-[13px] leading-[1.7] text-[#6b5f58] dark:text-[#9b9a92]">
                      Open Google Authenticator, Microsoft Authenticator, Authy,
                      or another TOTP app and scan this QR code.
                    </p>

                    <div className="mt-4 rounded-[14px] bg-[#f9f3ef] p-4 dark:bg-[#1a1816]">
                      <MonoLabel>Manual Setup Key</MonoLabel>

                      <div className="mt-2 break-all font-['DM_Mono',monospace] text-[13px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">
                        {twoFactorSetupData.manualEntryKey}
                      </div>
                    </div>

                    <div className="mt-4">
                      <TextField
                        label="6-Digit Authenticator Code"
                        value={twoFactorVerifyToken}
                        onChange={(value) => {
                          setTwoFactorVerifyToken(value)
                          setTwoFactorVerifyError('')
                        }}
                        placeholder="123456"
                      />
                    </div>

                    {twoFactorVerifyError && (
                      <div className="mt-3">
                        <InlineError message={twoFactorVerifyError} />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleVerifyTwoFactorSetup}
                      disabled={
                        twoFactorVerifyToken.length !== 6 ||
                        verifyTwoFactorSetup.isPending
                      }
                      className="mt-4 rounded-[11px] bg-[#2d6a47] px-5 py-3 text-[13px] font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#5cc98a] dark:text-[#141412]"
                    >
                      {verifyTwoFactorSetup.isPending
                        ? 'Verifying...'
                        : 'Verify and Enable 2FA'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="mt-6">
                <div className="rounded-2xl border border-[rgba(45,106,71,0.20)] bg-[rgba(45,106,71,0.08)] p-4">
                  <h3 className="text-[16px] font-bold text-[#2d6a47] dark:text-[#5cc98a]">
                    2FA is enabled
                  </h3>

                  <p className="mt-2 text-[13px] leading-[1.7] text-[#6b5f58] dark:text-[#9b9a92]">
                    Save these backup codes somewhere safe. Each code can be
                    used once if you lose access to your authenticator app.
                  </p>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {backupCodes.map((code) => (
                    <div
                      key={code}
                      className="rounded-xl border-[1.5px] border-[#e0d0c5] bg-[#fffaf6] px-4 py-3 font-['DM_Mono',monospace] text-[14px] font-bold text-[#1a1714] dark:border-white/9 dark:bg-[#252320] dark:text-[#f2f0eb]"
                    >
                      {code}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleCloseTwoFactorSetup}
                  className="mt-6 rounded-[11px] bg-[#b84c2b] px-5 py-3 text-[13px] font-bold text-white dark:bg-[#e8816a] dark:text-[#141412]"
                >
                  I Saved My Backup Codes
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── DISABLE 2FA MODAL ───────────────────────── */}
      {disableTwoFactorOpen && (
        <div className="fixed inset-0 z-160 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-120 rounded-[22px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-6 shadow-2xl dark:border-white/9 dark:bg-[#1e1c19]">
            <h2 className="font-['Playfair_Display',serif] text-[24px] font-extrabold">
              Disable Two-Factor Authentication
            </h2>

            <p className="mt-3 text-[13px] leading-[1.65] text-[#6b5f58] dark:text-[#9b9a92]">
              Enter a current 6-digit authenticator code to disable 2FA.
            </p>

            <div className="mt-4">
              <TextField
                label="Authenticator Code"
                value={disableTwoFactorToken}
                onChange={(value) => {
                  setDisableTwoFactorToken(value)
                  setDisableTwoFactorError('')
                }}
                placeholder="123456"
              />
            </div>

            {disableTwoFactorError && (
              <div className="mt-3">
                <InlineError message={disableTwoFactorError} />
              </div>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setDisableTwoFactorOpen(false)
                  setDisableTwoFactorToken('')
                  setDisableTwoFactorError('')
                }}
                className="rounded-[10px] border-[1.5px] border-[#e0d0c5] px-4 py-2.5 text-[13px] font-semibold dark:border-white/9"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  disableTwoFactorToken.length !== 6 ||
                  disableTwoFactor.isPending
                }
                onClick={handleDisableTwoFactor}
                className="rounded-[10px] bg-[#c43c3c] px-4 py-2.5 text-[13px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {disableTwoFactor.isPending ? 'Disabling...' : 'Disable 2FA'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── DELETE ACCOUNT MODAL ─────────────────────── */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-140 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-120 rounded-[22px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-6 shadow-2xl dark:border-white/9 dark:bg-[#1e1c19]">
            <h2 className="font-['Playfair_Display',serif] text-[24px] font-extrabold text-[#c43c3c] dark:text-[#e05252]">
              Schedule Account Deletion
            </h2>

            <p className="mt-3 text-[13px] leading-[1.65] text-[#6b5f58] dark:text-[#9b9a92]">
              Type <strong>DELETE</strong> to continue. Your account will be
              scheduled for deletion after <strong>30 days</strong>. Signing in
              again during that 30-day recovery window automatically cancels
              the deletion request.
            </p>

            <div className="mt-4 space-y-4">
              <TextField
                label="Confirmation"
                value={deleteConfirmation}
                onChange={(value) => {
                  setDeleteConfirmation(value)
                  setDeleteAccountError('')
                }}
                placeholder="DELETE"
              />

              {stepUpRequiresPassword && (
                <TextField
                  label="Current Password"
                  value={deleteCurrentPassword}
                  onChange={(value) => {
                    setDeleteCurrentPassword(value)
                    setDeleteAccountError('')
                  }}
                  type="password"
                  placeholder="Re-enter your password"
                />
              )}

              {stepUpRequiresTwoFactor && (
                <TextField
                  label="Two-Factor Code"
                  value={deleteTwoFactorCode}
                  onChange={(value) => {
                    setDeleteTwoFactorCode(value)
                    setDeleteAccountError('')
                  }}
                  placeholder="123456"
                />
              )}
            </div>

            {deleteAccountError && (
              <div className="mt-3">
                <InlineError message={deleteAccountError} />
              </div>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={resetDeleteModal}
                className="rounded-[10px] border-[1.5px] border-[#e0d0c5] px-4 py-2.5 text-[13px] font-semibold dark:border-white/9"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  deleteConfirmation !== 'DELETE' ||
                  !deleteStepUpReady ||
                  deleteAccount.isPending
                }
                onClick={handleDeleteAccount}
                className="rounded-[10px] bg-[#c43c3c] px-4 py-2.5 text-[13px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleteAccount.isPending
                  ? 'Scheduling...'
                  : 'Schedule Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}

      <SettingsToast
        visible={toast.visible}
        message={toast.message}
        tone={toast.tone}
      />
    </SettingsShell>
  )
}