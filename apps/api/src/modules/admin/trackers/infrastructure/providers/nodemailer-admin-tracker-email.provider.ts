import { sendMail } from '../../../../../infrastructure/email/email.client';
import type { IAdminTrackerEmailProvider } from '../../domain/services/admin-tracker-email-provider.interface';

export class NodemailerAdminTrackerEmailProvider implements IAdminTrackerEmailProvider {
  async sendTrackerDeleted(to: string, input: { ownerName: string; trackerTitle: string }) {
    await sendMail(
      to,
      `Your tracker “${input.trackerTitle}” was removed`,
      `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#25211f"><h2>Tracker removed by Imminiq administration</h2><p>Hello ${input.ownerName},</p><p>Your tracker <strong>${input.trackerTitle}</strong> was removed by an administrator after a platform review.</p><p>If you believe this was a mistake, please raise a support ticket from your Imminiq account menu.</p><p>— Imminiq Support</p></div>`
    );
  }
}
export const nodemailerAdminTrackerEmailProvider = new NodemailerAdminTrackerEmailProvider();
