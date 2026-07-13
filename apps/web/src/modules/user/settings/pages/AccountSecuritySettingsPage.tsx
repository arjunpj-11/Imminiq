import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import SettingsShell from '../components/SettingsShell';
import SettingsContentLoading from '../components/SettingsContentLoading';
import { MonoLabel, SettingsCard, SettingsToast, TextField } from '../components/SettingsUi';
import { useSettingsToast } from '../hooks/useSettingsToast';
import { usePendingEmailChangeTimer } from '../hooks/usePendingEmailChangeTimer';
import {
  DeleteAccountDialog,
  DisableTwoFactorDialog,
  InlineSecurityError,
  TwoFactorSetupDialog,
} from '../components/security/SecurityDialogs';

import {
  useChangeEmail,
  useChangePassword,
  useDeleteAccount,
  useDisableTwoFactor,
  useSecurityOverview,
  useSetupTwoFactor,
  useTerminateSession,
  useVerifyTwoFactorSetup,
} from '../hooks/useSecuritySettings';

import type {
  IChangeEmailPayload,
  IDeleteAccountPayload,
  ITwoFactorSetupResponse,
} from '../types/settings.types';

import { useAuthStore } from '../../../../store/useAuthStore';
import {
  formatCountdown,
  getApiErrorMessage,
  getPasswordScore,
  normalizeEmail,
} from '../utils/security-settings.utils';

export default function AccountSecuritySettingsPage() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const securityQuery = useSecurityOverview();
  const changeEmail = useChangeEmail();
  const changePassword = useChangePassword();
  const terminateSession = useTerminateSession();
  const setupTwoFactor = useSetupTwoFactor();
  const verifyTwoFactorSetup = useVerifyTwoFactorSetup();
  const disableTwoFactor = useDisableTwoFactor();
  const deleteAccount = useDeleteAccount();
  const toast = useSettingsToast();

  const [newEmail, setNewEmail] = useState('');
  const [emailChangePassword, setEmailChangePassword] = useState('');
  const [emailChangeTwoFactorCode, setEmailChangeTwoFactorCode] = useState('');
  const [emailChangeError, setEmailChangeError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const {
    timer: pendingEmailTimer,
    secondsLeft: pendingEmailSecondsLeft,
    start: startPendingEmailTimer,
  } = usePendingEmailChangeTimer();

  const [twoFactorSetupOpen, setTwoFactorSetupOpen] = useState(false);
  const [twoFactorSetupData, setTwoFactorSetupData] = useState<ITwoFactorSetupResponse | null>(
    null
  );
  const [twoFactorVerifyToken, setTwoFactorVerifyToken] = useState('');
  const [twoFactorVerifyError, setTwoFactorVerifyError] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const [disableTwoFactorOpen, setDisableTwoFactorOpen] = useState(false);
  const [disableTwoFactorToken, setDisableTwoFactorToken] = useState('');
  const [disableTwoFactorError, setDisableTwoFactorError] = useState('');

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteCurrentPassword, setDeleteCurrentPassword] = useState('');
  const [deleteTwoFactorCode, setDeleteTwoFactorCode] = useState('');
  const [deleteAccountError, setDeleteAccountError] = useState('');

  const score = useMemo(() => getPasswordScore(newPassword), [newPassword]);

  const scoreLabel = score >= 80 ? 'Strong' : score >= 50 ? 'Medium' : 'Weak';

  const security = securityQuery.data;

  const providerLabel =
    security?.authProvider === 'google'
      ? 'Google'
      : security?.authProvider === 'github'
        ? 'GitHub'
        : 'Imminiq';

  const stepUpRequiresPassword = Boolean(security?.canChangePassword);
  const stepUpRequiresTwoFactor = Boolean(security?.twoFactorEnabled);

  const sensitiveActionUnavailableForSocialAccount =
    Boolean(security) && !stepUpRequiresPassword && !stepUpRequiresTwoFactor;

  const pendingEmail = normalizeEmail(security?.pendingEmail);

  const timerMatchesPendingEmail =
    !!pendingEmailTimer && normalizeEmail(pendingEmailTimer.email) === pendingEmail;

  const pendingEmailTimerExpired = timerMatchesPendingEmail && pendingEmailSecondsLeft <= 0;

  const showPendingEmailNotice = !!security?.pendingEmail && !pendingEmailTimerExpired;

  const showPendingEmailTimer =
    showPendingEmailNotice && timerMatchesPendingEmail && pendingEmailSecondsLeft > 0;

  const emailChangeStepUpReady =
    (!stepUpRequiresPassword || !!emailChangePassword) &&
    (!stepUpRequiresTwoFactor || emailChangeTwoFactorCode.length === 6);

  const deleteStepUpReady =
    (!stepUpRequiresPassword || !!deleteCurrentPassword) &&
    (!stepUpRequiresTwoFactor || deleteTwoFactorCode.length === 6);

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
    );
  }

  const handleEmailUpdate = async () => {
    try {
      setEmailChangeError('');

      const payload: IChangeEmailPayload = {
        newEmail,
        ...(stepUpRequiresPassword ? { currentPassword: emailChangePassword } : {}),
        ...(stepUpRequiresTwoFactor ? { twoFactorCode: emailChangeTwoFactorCode } : {}),
      };

      const result = await changeEmail.mutateAsync(payload);

      startPendingEmailTimer(result.pendingEmail);

      setNewEmail('');
      setEmailChangePassword('');
      setEmailChangeTwoFactorCode('');

      toast.showToast(
        'Verification link sent to the new email. Your current email will stay unchanged until it is verified.',
        'success'
      );
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unable to send email verification link.');

      setEmailChangeError(message);
      toast.showToast(message, 'error');
    }
  };

  const handlePasswordUpdate = async () => {
    try {
      await changePassword.mutateAsync({
        currentPassword,
        newPassword,
      });

      setCurrentPassword('');
      setNewPassword('');

      toast.showToast(
        'Password updated successfully. Your sessions may need to sign in again.',
        'success'
      );
    } catch (error) {
      toast.showToast(getApiErrorMessage(error, 'Unable to update password.'), 'error');
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    try {
      await terminateSession.mutateAsync(sessionId);
      toast.showToast('Session terminated.', 'success');
    } catch (error) {
      toast.showToast(getApiErrorMessage(error, 'Unable to terminate session.'), 'error');
    }
  };

  const handleStartTwoFactorSetup = async () => {
    try {
      const setup = await setupTwoFactor.mutateAsync();

      setTwoFactorSetupData(setup);
      setTwoFactorVerifyToken('');
      setTwoFactorVerifyError('');
      setBackupCodes([]);
      setTwoFactorSetupOpen(true);

      toast.showToast('Scan the QR code to finish 2FA setup.', 'success');
    } catch (error) {
      toast.showToast(getApiErrorMessage(error, 'Unable to start 2FA setup.'), 'error');
    }
  };

  const handleVerifyTwoFactorSetup = async () => {
    try {
      setTwoFactorVerifyError('');

      const result = await verifyTwoFactorSetup.mutateAsync({
        token: twoFactorVerifyToken,
      });

      setBackupCodes(result.backupCodes);
      setTwoFactorVerifyToken('');

      toast.showToast('Two-factor authentication enabled successfully.', 'success');
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unable to verify authenticator code.');

      setTwoFactorVerifyError(message);
      toast.showToast(message, 'error');
    }
  };

  const handleCloseTwoFactorSetup = () => {
    setTwoFactorSetupOpen(false);
    setTwoFactorSetupData(null);
    setTwoFactorVerifyToken('');
    setTwoFactorVerifyError('');
    setBackupCodes([]);
  };

  const handleDisableTwoFactor = async () => {
    try {
      setDisableTwoFactorError('');

      await disableTwoFactor.mutateAsync({
        token: disableTwoFactorToken,
      });

      setDisableTwoFactorToken('');
      setDisableTwoFactorError('');
      setDisableTwoFactorOpen(false);

      toast.showToast('Two-factor authentication disabled.', 'success');
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unable to disable 2FA.');

      setDisableTwoFactorError(message);
      toast.showToast(message, 'error');
    }
  };

  const resetDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeleteConfirmation('');
    setDeleteCurrentPassword('');
    setDeleteTwoFactorCode('');
    setDeleteAccountError('');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      const message = 'Type DELETE to confirm account deletion.';

      setDeleteAccountError(message);
      toast.showToast(message, 'error');
      return;
    }

    try {
      setDeleteAccountError('');

      const payload: IDeleteAccountPayload = {
        confirmation: 'DELETE',
        ...(stepUpRequiresPassword ? { currentPassword: deleteCurrentPassword } : {}),
        ...(stepUpRequiresTwoFactor ? { twoFactorCode: deleteTwoFactorCode } : {}),
      };

      await deleteAccount.mutateAsync(payload);

      resetDeleteModal();
      clearAuth();

      navigate('/login', {
        replace: true,
      });
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unable to schedule account deletion.');

      setDeleteAccountError(message);
      toast.showToast(message, 'error');
    }
  };

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
            <div className="mb-4 flex flex-wrap items-center gap-2 rounded-md bg-[#f9f3ef] px-4 py-3 dark:bg-(--surface-card)">
              <strong className="text-[14px]">{security?.email ?? 'Email not loaded'}</strong>

              {security?.emailVerified ? (
                <span className="rounded-full bg-[rgba(45,106,71,0.12)] px-2.5 py-1 text-[11px] font-bold text-(--success) dark:text-(--success)">
                  Verified
                </span>
              ) : (
                <span className="rounded-full bg-[rgba(196,60,60,0.10)] px-2.5 py-1 text-[11px] font-bold text-(--danger) dark:text-(--danger)">
                  Unverified
                </span>
              )}
            </div>

            {showPendingEmailNotice && security?.pendingEmail && (
              <div className="mb-4 rounded-md border border-[rgba(184,76,43,0.22)] bg-[rgba(184,76,43,0.08)] px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-(--brand-500) dark:text-(--brand-500)">
                    Pending Email Change
                  </div>

                  {showPendingEmailTimer && (
                    <div className="rounded-full border border-[rgba(184,76,43,0.22)] bg-white/70 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-(--brand-500) dark:bg-(--surface-card)/80 dark:text-(--brand-500)">
                      Link expires in {formatCountdown(pendingEmailSecondsLeft)}
                    </div>
                  )}
                </div>

                <p className="mt-2 text-[13px] leading-[1.6] text-(--text-secondary) dark:text-(--text-secondary)">
                  A verification link was sent to{' '}
                  <strong className="text-(--text-primary) dark:text-(--text-primary)">
                    {security.pendingEmail}
                  </strong>
                  . Your current email will remain active until that link is verified.
                </p>
              </div>
            )}

            {sensitiveActionUnavailableForSocialAccount && (
              <div className="mb-4 rounded-md border border-[rgba(59,108,183,0.20)] bg-[rgba(59,108,183,0.08)] px-4 py-3 text-[13px] leading-[1.65] text-(--text-secondary) dark:text-(--text-secondary)">
                This {providerLabel} account has no local password. Enable two-factor authentication
                first to securely change your email.
              </div>
            )}

            <div className="grid gap-3">
              <TextField
                label="New Email Address"
                value={newEmail}
                onChange={(value) => {
                  setNewEmail(value);
                  setEmailChangeError('');
                }}
                type="email"
                placeholder="you@example.com"
              />

              {stepUpRequiresPassword && (
                <TextField
                  label="Current Password"
                  value={emailChangePassword}
                  onChange={(value) => {
                    setEmailChangePassword(value);
                    setEmailChangeError('');
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
                    setEmailChangeTwoFactorCode(value);
                    setEmailChangeError('');
                  }}
                  placeholder="123456"
                />
              )}

              {emailChangeError && <InlineSecurityError message={emailChangeError} />}

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
                  className="h-11.5 rounded-md bg-(--brand-500) px-5 text-[13px] font-bold text-[#fdf8f5] transition disabled:cursor-not-allowed disabled:opacity-60 dark:bg-(--brand-500) dark:text-[#141412]"
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

                <div className="mt-5 rounded-2xl bg-[#f9f3ef] p-4 dark:bg-(--surface-card)">
                  <div className="mb-2 flex items-center justify-between">
                    <MonoLabel>Password Strength</MonoLabel>

                    <span className="text-[12px] font-bold text-(--brand-500) dark:text-(--brand-500)">
                      {scoreLabel} · {score}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-(--brand-500) transition-all dark:bg-(--brand-500)"
                      style={{ width: `${score}%` }}
                    />
                  </div>

                  <div className="mt-4 grid gap-2 text-[12px] text-(--text-secondary) dark:text-(--text-secondary)">
                    <div>• At least 8 characters</div>
                    <div>• Includes a number or symbol</div>
                    <div>• Uses uppercase letters for stronger protection</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePasswordUpdate}
                  disabled={!currentPassword || !newPassword || changePassword.isPending}
                  className="mt-4 rounded-md bg-(--brand-500) px-5 py-3 text-[13px] font-bold text-[#fdf8f5] transition disabled:cursor-not-allowed disabled:opacity-60 dark:bg-(--brand-500) dark:text-[#141412]"
                >
                  {changePassword.isPending ? 'Updating...' : 'Update Password'}
                </button>
              </>
            ) : (
              <div className="rounded-2xl border border-[rgba(59,108,183,0.20)] bg-[rgba(59,108,183,0.08)] p-5">
                <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-(--info) dark:text-(--info)">
                  Password Managed Externally
                </div>

                <h3 className="mt-2 text-[16px] font-bold text-(--text-primary) dark:text-(--text-primary)">
                  Password managed by {providerLabel}
                </h3>

                <p className="mt-2 max-w-2xl text-[13px] leading-[1.7] text-(--text-secondary) dark:text-(--text-secondary)">
                  This account signs in using {providerLabel} OAuth, so there is no separate Imminiq
                  password to change here.
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
                <div className="rounded-md border border-dashed border-(--border-subtle) p-4 text-[13px] text-(--text-secondary) dark:border-(--border-subtle) dark:text-(--text-secondary)">
                  No active sessions found.
                </div>
              )}

              {(security?.activeSessions ?? []).map((session) => (
                <div
                  key={session.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-[1.5px] border-(--border-subtle) p-4 dark:border-(--border-subtle)"
                >
                  <div>
                    <div className="flex items-center gap-2 text-[14px] font-bold">
                      {session.deviceName}

                      {session.current && (
                        <span className="rounded-full bg-[rgba(45,106,71,0.12)] px-2 py-0.5 text-[10px] text-(--success) dark:text-(--success)">
                          Current session
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-[12.5px] text-(--text-secondary) dark:text-(--text-secondary)">
                      {session.location} · {session.client} · {session.lastActive}
                    </p>
                  </div>

                  {!session.current && (
                    <button
                      type="button"
                      onClick={() => handleTerminateSession(session.id)}
                      disabled={terminateSession.isPending}
                      className="rounded-md border-[1.5px] border-(--border-subtle) px-4 py-2 text-[12px] font-bold text-(--text-secondary) transition hover:border-(--brand-500) hover:text-(--brand-500) disabled:cursor-not-allowed disabled:opacity-60 dark:border-(--border-subtle) dark:text-(--text-secondary)"
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

                <p className="mt-1 max-w-2xl text-[13px] text-(--text-secondary) dark:text-(--text-secondary)">
                  Secure your Imminiq archive with a verification step beyond your password.
                </p>
              </div>

              {security?.twoFactorEnabled ? (
                <button
                  type="button"
                  onClick={() => {
                    setDisableTwoFactorOpen(true);
                    setDisableTwoFactorError('');
                  }}
                  className="rounded-md border-[1.5px] border-[rgba(196,60,60,0.30)] bg-[rgba(196,60,60,0.08)] px-5 py-3 text-[13px] font-bold text-(--danger) transition hover:bg-[rgba(196,60,60,0.12)] dark:text-(--danger)"
                >
                  Disable 2FA
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartTwoFactorSetup}
                  disabled={setupTwoFactor.isPending}
                  className="rounded-md bg-(--success) px-5 py-3 text-[13px] font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60 dark:bg-(--success) dark:text-[#141412]"
                >
                  {setupTwoFactor.isPending ? 'Preparing...' : 'Enable 2FA'}
                </button>
              )}
            </div>
          </SettingsCard>

          {/* ─── DANGER ZONE ─────────────────────────────── */}
          <div className="rounded-lg border-[1.5px] border-[rgba(196,60,60,0.22)] bg-[rgba(196,60,60,0.08)] p-5">
            <h2 className="font-ui text-[20px] font-extrabold text-(--danger) dark:text-(--danger)">
              Danger Zone
            </h2>

            <p className="mt-2 text-[13px] leading-[1.6] text-(--text-secondary) dark:text-(--text-secondary)">
              Deleting your account starts a <strong>30-day recovery period</strong>. Your active
              sessions will be signed out immediately, and the account will be scheduled for
              deletion. Signing in again within 30 days automatically cancels the deletion request.
            </p>

            {sensitiveActionUnavailableForSocialAccount && (
              <p className="mt-3 rounded-xl border border-[rgba(59,108,183,0.20)] bg-[rgba(59,108,183,0.08)] px-3 py-2 text-[12.5px] leading-[1.6] text-(--text-secondary) dark:text-(--text-secondary)">
                Enable two-factor authentication first before deleting this
                {` ${providerLabel}`} account.
              </p>
            )}

            <button
              type="button"
              onClick={() => {
                setDeleteModalOpen(true);
                setDeleteAccountError('');
              }}
              disabled={sensitiveActionUnavailableForSocialAccount}
              className="mt-4 rounded-md bg-(--danger) px-5 py-3 text-[13px] font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
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
                <strong>{security?.emailVerified ? 'Verified' : 'Unverified'}</strong>
              </div>

              {showPendingEmailNotice && security?.pendingEmail && (
                <div>
                  <MonoLabel>Pending New Email</MonoLabel>
                  <strong>{security.pendingEmail}</strong>

                  {showPendingEmailTimer && (
                    <p className="mt-1 font-mono text-[11px] font-bold text-(--brand-500) dark:text-(--brand-500)">
                      Expires in {formatCountdown(pendingEmailSecondsLeft)}
                    </p>
                  )}
                </div>
              )}

              <div>
                <MonoLabel>Two-Factor</MonoLabel>
                <strong>{security?.twoFactorEnabled ? 'Enabled' : 'Disabled'}</strong>
              </div>

              <div>
                <MonoLabel>Active Sessions</MonoLabel>
                <strong>{security?.activeSessions?.length ?? 0}</strong>
              </div>
            </div>
          </SettingsCard>
        </aside>
      </div>

      <TwoFactorSetupDialog
        open={twoFactorSetupOpen}
        data={twoFactorSetupData}
        backupCodes={backupCodes}
        token={twoFactorVerifyToken}
        error={twoFactorVerifyError}
        isVerifying={verifyTwoFactorSetup.isPending}
        onTokenChange={(value) => {
          setTwoFactorVerifyToken(value);
          setTwoFactorVerifyError('');
        }}
        onVerify={handleVerifyTwoFactorSetup}
        onClose={handleCloseTwoFactorSetup}
      />

      <DisableTwoFactorDialog
        open={disableTwoFactorOpen}
        token={disableTwoFactorToken}
        error={disableTwoFactorError}
        isPending={disableTwoFactor.isPending}
        onTokenChange={(value) => {
          setDisableTwoFactorToken(value);
          setDisableTwoFactorError('');
        }}
        onConfirm={handleDisableTwoFactor}
        onClose={() => {
          setDisableTwoFactorOpen(false);
          setDisableTwoFactorToken('');
          setDisableTwoFactorError('');
        }}
      />

      <DeleteAccountDialog
        open={deleteModalOpen}
        confirmation={deleteConfirmation}
        currentPassword={deleteCurrentPassword}
        twoFactorCode={deleteTwoFactorCode}
        requirePassword={stepUpRequiresPassword}
        requireTwoFactor={stepUpRequiresTwoFactor}
        error={deleteAccountError}
        isPending={deleteAccount.isPending}
        canSubmit={deleteConfirmation === 'DELETE' && deleteStepUpReady}
        onConfirmationChange={(value) => {
          setDeleteConfirmation(value);
          setDeleteAccountError('');
        }}
        onCurrentPasswordChange={(value) => {
          setDeleteCurrentPassword(value);
          setDeleteAccountError('');
        }}
        onTwoFactorCodeChange={(value) => {
          setDeleteTwoFactorCode(value);
          setDeleteAccountError('');
        }}
        onConfirm={handleDeleteAccount}
        onClose={resetDeleteModal}
      />

      <SettingsToast visible={toast.visible} message={toast.message} tone={toast.tone} />
    </SettingsShell>
  );
}
