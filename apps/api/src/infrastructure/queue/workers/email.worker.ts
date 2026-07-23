import { Worker } from 'bullmq';
import { redis } from '../../cache/redis.client';
import { sendMail } from '../../email/email.client';

type MockTestModerationEmailJob = {
  kind: 'mock_test_moderation';
  to: string;
  ownerName: string;
  testTitle: string;
  action: 'suspended' | 'deleted' | 'restored';
  reason: string;
};

type TrackerModerationEmailJob = {
  kind: 'tracker_moderation';
  to: string;
  ownerName: string;
  trackerTitle: string;
  action: 'suspended' | 'deleted' | 'restored';
  reason: string;
};

type AdminUserStatusEmailJob = {
  kind: 'admin_user_status';
  to: string;
  userName: string;
  status: 'active' | 'paused' | 'blocked';
  reason: string;
};

type AdminUserMessageEmailJob = {
  kind: 'admin_user_message';
  to: string;
  userName: string;
  subject: string;
  message: string;
};

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

export const emailWorker = new Worker<
  | MockTestModerationEmailJob
  | TrackerModerationEmailJob
  | AdminUserStatusEmailJob
  | AdminUserMessageEmailJob
>(
  'email',
  async (job) => {
    if (job.data.kind === 'admin_user_status') {
      const { to, userName, status, reason } = job.data;
      const action =
        status === 'active' ? 'restored' : status === 'paused' ? 'suspended' : 'blocked';
      await sendMail(
        to,
        `Your Imminiq account access was ${action}`,
        `<div style="font-family:Arial,sans-serif;line-height:1.65;color:#25211f"><h2>Account access ${escapeHtml(action)}</h2><p>Hello ${escapeHtml(userName)},</p><p>Your Imminiq account access was <strong>${escapeHtml(action)}</strong> by an administrator.</p><p><strong>Reason:</strong> ${escapeHtml(reason)}</p><p>If you disagree with this decision, use the appeal form shown on the restricted-account page.</p><p>— Imminiq Support</p></div>`
      );
      return;
    }
    if (job.data.kind === 'admin_user_message') {
      const { to, userName, subject, message } = job.data;
      await sendMail(
        to,
        subject,
        `<div style="font-family:Arial,sans-serif;line-height:1.65;color:#25211f"><h2>${escapeHtml(subject)}</h2><p>Hello ${escapeHtml(userName)},</p><p>${escapeHtml(message).replaceAll('\n', '<br>')}</p><p>— Imminiq Administration</p></div>`
      );
      return;
    }
    if (job.data.kind === 'tracker_moderation') {
      const { to, ownerName, trackerTitle, action, reason } = job.data;
      const actionLabel = action === 'deleted' ? 'removed' : action;
      await sendMail(
        to,
        `Your tracker “${trackerTitle}” was ${actionLabel}`,
        `<div style="font-family:Arial,sans-serif;line-height:1.65;color:#25211f"><h2>Tracker ${escapeHtml(actionLabel)} by Imminiq administration</h2><p>Hello ${escapeHtml(ownerName)},</p><p>Your tracker <strong>${escapeHtml(trackerTitle)}</strong> was ${escapeHtml(actionLabel)} after an administrative review.</p><p><strong>Reason:</strong> ${escapeHtml(reason)}</p><p>If you disagree with this decision, raise a support ticket from your account and include the tracker title.</p><p>— Imminiq Support</p></div>`
      );
      return;
    }
    const { to, ownerName, testTitle, action, reason } = job.data;
    const actionLabel =
      action === 'restored' ? 'restored' : action === 'suspended' ? 'suspended' : 'removed';
    const subject = `Your mock test “${testTitle}” was ${actionLabel}`;
    const html = `<div style="font-family:Arial,sans-serif;line-height:1.65;color:#25211f"><h2>Mock test ${actionLabel} by Imminiq administration</h2><p>Hello ${escapeHtml(ownerName)},</p><p>Your mock test <strong>${escapeHtml(testTitle)}</strong> was ${actionLabel} after an administrative review.</p><p><strong>Reason:</strong> ${escapeHtml(reason)}</p><p>If you believe this decision was incorrect, please raise a support ticket from your Imminiq account and include the mock test title.</p><p>— Imminiq Support</p></div>`;
    await sendMail(to, subject, html);
  },
  { connection: redis, concurrency: 5 }
);

export const startEmailWorker = async () => {
  await emailWorker.waitUntilReady();
};
