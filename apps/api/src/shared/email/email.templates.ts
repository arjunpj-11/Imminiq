type OtpEmailTemplateParams = {
  fullName?: string;
  otp: string;
  type: 'verify_account' | 'reset_password';
};

type EmailChangeVerificationTemplateParams = {
  fullName?: string;
  newEmail: string;
  verificationUrl: string;
  expiresMinutes: number;
};

type EmailChangeAlertTemplateParams = {
  fullName?: string;
  requestedNewEmail: string;
};

const CURRENT_YEAR = new Date().getFullYear();

const escapeHtml = (value: string) => {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
};

export const otpEmailTemplate = ({ fullName, otp, type }: OtpEmailTemplateParams) => {
  const isResetPassword = type === 'reset_password';

  const safeName = fullName ? escapeHtml(fullName) : 'there';
  const safeOtp = escapeHtml(otp);

  const title = isResetPassword ? 'Reset your Imminiq password' : 'Verify your Imminiq account';

  const eyebrow = isResetPassword ? 'Password Recovery' : 'Account Verification';

  const description = isResetPassword
    ? 'Use this one-time code to reset your password and securely get back into your learning dashboard.'
    : 'Use this one-time code to verify your account and start building personalized AI learning paths for any subject.';

  const footerNote = isResetPassword
    ? 'If you did not request a password reset, you can safely ignore this email.'
    : 'If you did not create an Imminiq account, you can safely ignore this email.';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>

<body style="margin:0; padding:0; background:#f5ede4; font-family:Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f5ede4; padding:34px 14px;">
    <tr>
      <td align="center">

        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:580px; background:#fdf8f5; border:1px solid #e0d0c5; border-radius:22px; overflow:hidden; box-shadow:0 16px 50px rgba(26,23,20,0.08);">
          
          <tr>
            <td style="height:5px; background:#b84c2b; font-size:0; line-height:0;">
              &nbsp;
            </td>
          </tr>

          <tr>
            <td style="padding:30px 28px 12px; text-align:center;">
              <div style="width:100%; text-align:center;">
                <div style="display:block; width:100%; margin:0 auto; color:#1a1714; font-size:28px; font-weight:900; letter-spacing:-0.8px; line-height:1; text-align:center;">
                  immin<span style="color:#b84c2b;">iq</span>
                </div>

                <div style="display:block; width:100%; margin:8px auto 0; color:#6b5f58; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1.7px; text-align:center;">
                  AI-powered learning OS
                </div>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:18px 32px 0; text-align:center;">
              <span style="display:inline-block; padding:7px 12px; border-radius:999px; background:rgba(184,76,43,0.08); border:1px solid rgba(184,76,43,0.16); color:#b84c2b; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1.4px;">
                ${eyebrow}
              </span>
            </td>
          </tr>

          <tr>
            <td style="padding:18px 34px 0; text-align:center;">
              <h1 style="margin:0; color:#1a1714; font-size:28px; line-height:1.25; font-weight:800; letter-spacing:-0.7px;">
                ${title}
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding:16px 36px 0; text-align:center;">
              <p style="margin:0; color:#6b5f58; font-size:15px; line-height:1.75;">
                Hi ${safeName},<br />
                ${description}
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:30px 32px 22px;">
              <table cellpadding="0" cellspacing="0" role="presentation" style="background:#fffaf6; border:1px solid #e0d0c5; border-radius:18px; box-shadow:0 8px 24px rgba(184,76,43,0.08);">
                <tr>
                  <td style="padding:18px 26px; text-align:center;">
                    <div style="color:#6b5f58; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:9px;">
                      Your secure code
                    </div>

                    <div style="color:#b84c2b; font-size:36px; line-height:1; font-weight:900; letter-spacing:8px;">
                      ${safeOtp}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 36px 26px; text-align:center;">
              <p style="margin:0; color:#6b5f58; font-size:13px; line-height:1.7;">
                This OTP will expire in <strong style="color:#1a1714;">10 minutes</strong>.
                Do not share this code with anyone.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:0 34px 32px;">
              <div style="border-top:1px solid #e0d0c5; padding-top:20px; text-align:center;">
                <p style="margin:0; color:#9f8f86; font-size:12px; line-height:1.65;">
                  ${footerNote}
                </p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="background:#1e1c19; padding:20px 24px; text-align:center;">
              <p style="margin:0; color:#f2f0eb; font-size:13px; font-weight:700; letter-spacing:-0.2px;">
                immin<span style="color:#e8816a;">iq</span><span style="color:#e8816a;">.</span>
              </p>

              <p style="margin:7px 0 0; color:#9b9a92; font-size:11px; line-height:1.5;">
                Your personal AI learning OS for mastering anything.
              </p>

              <p style="margin:7px 0 0; color:#6b6a62; font-size:11px; line-height:1.5;">
                © ${CURRENT_YEAR} Imminiq. Crafted for intentional learners.
              </p>
            </td>
          </tr>

        </table>

        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:580px;">
          <tr>
            <td style="padding:16px 16px 0; text-align:center;">
              <p style="margin:0; color:#9f8f86; font-size:11px; line-height:1.6;">
                AI Roadmaps • Mock Tests • Visual Learning • Progress Tracking
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
`;
};

export const emailChangeVerificationTemplate = ({
  fullName,
  newEmail,
  verificationUrl,
  expiresMinutes,
}: EmailChangeVerificationTemplateParams) => {
  const safeName = fullName ? escapeHtml(fullName) : 'there';
  const safeNewEmail = escapeHtml(newEmail);
  const safeVerificationUrl = escapeHtml(verificationUrl);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify your new Imminiq email</title>
</head>

<body style="margin:0; padding:0; background:#f5ede4; font-family:Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f5ede4; padding:34px 14px;">
    <tr>
      <td align="center">

        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:580px; background:#fdf8f5; border:1px solid #e0d0c5; border-radius:22px; overflow:hidden; box-shadow:0 16px 50px rgba(26,23,20,0.08);">
          
          <tr>
            <td style="height:5px; background:#b84c2b; font-size:0; line-height:0;">
              &nbsp;
            </td>
          </tr>

          <tr>
            <td style="padding:30px 28px 12px; text-align:center;">
              <div style="width:100%; text-align:center;">
                <div style="display:block; width:100%; margin:0 auto; color:#1a1714; font-size:28px; font-weight:900; letter-spacing:-0.8px; line-height:1; text-align:center;">
                  immin<span style="color:#b84c2b;">iq</span>
                </div>

                <div style="display:block; width:100%; margin:8px auto 0; color:#6b5f58; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1.7px; text-align:center;">
                  AI-powered learning OS
                </div>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:18px 32px 0; text-align:center;">
              <span style="display:inline-block; padding:7px 12px; border-radius:999px; background:rgba(184,76,43,0.08); border:1px solid rgba(184,76,43,0.16); color:#b84c2b; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1.4px;">
                Email Change Verification
              </span>
            </td>
          </tr>

          <tr>
            <td style="padding:18px 34px 0; text-align:center;">
              <h1 style="margin:0; color:#1a1714; font-size:28px; line-height:1.25; font-weight:800; letter-spacing:-0.7px;">
                Verify your new email address
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding:16px 36px 0; text-align:center;">
              <p style="margin:0; color:#6b5f58; font-size:15px; line-height:1.75;">
                Hi ${safeName},<br />
                We received a request to change the email address linked to your Imminiq account.
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:24px 32px 14px;">
              <table cellpadding="0" cellspacing="0" role="presentation" style="background:#fffaf6; border:1px solid #e0d0c5; border-radius:18px; box-shadow:0 8px 24px rgba(184,76,43,0.08); width:100%; max-width:440px;">
                <tr>
                  <td style="padding:18px 20px; text-align:center;">
                    <div style="color:#6b5f58; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:9px;">
                      New email address
                    </div>

                    <div style="color:#1a1714; font-size:16px; line-height:1.5; font-weight:800; word-break:break-word;">
                      ${safeNewEmail}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:18px 32px 24px;">
              <a
                href="${safeVerificationUrl}"
                style="display:inline-block; background:#b84c2b; color:#ffffff; text-decoration:none; font-size:15px; line-height:1; font-weight:800; padding:16px 24px; border-radius:14px; box-shadow:0 10px 28px rgba(184,76,43,0.20);"
              >
                Verify New Email
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding:0 36px 24px; text-align:center;">
              <p style="margin:0; color:#6b5f58; font-size:13px; line-height:1.7;">
                This verification link will expire in
                <strong style="color:#1a1714;">${expiresMinutes} minutes</strong>.
                Your current email will remain unchanged until this link is verified.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:0 34px 26px;">
              <div style="border-top:1px solid #e0d0c5; padding-top:20px; text-align:center;">
                <p style="margin:0; color:#9f8f86; font-size:12px; line-height:1.65;">
                  If you did not request this email change, you can safely ignore this message.
                </p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:0 34px 32px;">
              <div style="background:#fffaf6; border:1px solid #e0d0c5; border-radius:14px; padding:15px 16px; text-align:left;">
                <p style="margin:0 0 8px; color:#6b5f58; font-size:11px; line-height:1.6; font-weight:700; text-transform:uppercase; letter-spacing:1px;">
                  Button not working?
                </p>

                <p style="margin:0; color:#9f8f86; font-size:12px; line-height:1.7; word-break:break-all;">
                  ${safeVerificationUrl}
                </p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="background:#1e1c19; padding:20px 24px; text-align:center;">
              <p style="margin:0; color:#f2f0eb; font-size:13px; font-weight:700; letter-spacing:-0.2px;">
                immin<span style="color:#e8816a;">iq</span><span style="color:#e8816a;">.</span>
              </p>

              <p style="margin:7px 0 0; color:#9b9a92; font-size:11px; line-height:1.5;">
                Your personal AI learning OS for mastering anything.
              </p>

              <p style="margin:7px 0 0; color:#6b6a62; font-size:11px; line-height:1.5;">
                © ${CURRENT_YEAR} Imminiq. Crafted for intentional learners.
              </p>
            </td>
          </tr>

        </table>

        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:580px;">
          <tr>
            <td style="padding:16px 16px 0; text-align:center;">
              <p style="margin:0; color:#9f8f86; font-size:11px; line-height:1.6;">
                AI Roadmaps • Mock Tests • Visual Learning • Progress Tracking
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
`;
};

export const emailChangeAlertTemplate = ({
  fullName,
  requestedNewEmail,
}: EmailChangeAlertTemplateParams) => {
  const safeName = fullName ? escapeHtml(fullName) : 'there';
  const safeRequestedNewEmail = escapeHtml(requestedNewEmail);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Imminiq email change requested</title>
</head>

<body style="margin:0; padding:0; background:#f5ede4; font-family:Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f5ede4; padding:34px 14px;">
    <tr>
      <td align="center">

        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:580px; background:#fdf8f5; border:1px solid #e0d0c5; border-radius:22px; overflow:hidden; box-shadow:0 16px 50px rgba(26,23,20,0.08);">
          
          <tr>
            <td style="height:5px; background:#c43c3c; font-size:0; line-height:0;">
              &nbsp;
            </td>
          </tr>

          <tr>
            <td style="padding:30px 28px 12px; text-align:center;">
              <div style="width:100%; text-align:center;">
                <div style="display:block; width:100%; margin:0 auto; color:#1a1714; font-size:28px; font-weight:900; letter-spacing:-0.8px; line-height:1; text-align:center;">
                  immin<span style="color:#b84c2b;">iq</span>
                </div>

                <div style="display:block; width:100%; margin:8px auto 0; color:#6b5f58; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1.7px; text-align:center;">
                  Account Security Alert
                </div>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:18px 32px 0; text-align:center;">
              <span style="display:inline-block; padding:7px 12px; border-radius:999px; background:rgba(196,60,60,0.08); border:1px solid rgba(196,60,60,0.16); color:#c43c3c; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1.4px;">
                Email Change Requested
              </span>
            </td>
          </tr>

          <tr>
            <td style="padding:18px 34px 0; text-align:center;">
              <h1 style="margin:0; color:#1a1714; font-size:28px; line-height:1.25; font-weight:800; letter-spacing:-0.7px;">
                A new email change request was started
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding:16px 36px 0; text-align:center;">
              <p style="margin:0; color:#6b5f58; font-size:15px; line-height:1.75;">
                Hi ${safeName},<br />
                We received a request to change the email address connected to your Imminiq account.
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:24px 32px 20px;">
              <table cellpadding="0" cellspacing="0" role="presentation" style="background:#fff5f5; border:1px solid rgba(196,60,60,0.20); border-radius:18px; width:100%; max-width:440px;">
                <tr>
                  <td style="padding:18px 20px; text-align:center;">
                    <div style="color:#6b5f58; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:9px;">
                      Requested new email
                    </div>

                    <div style="color:#1a1714; font-size:16px; line-height:1.5; font-weight:800; word-break:break-word;">
                      ${safeRequestedNewEmail}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 36px 22px; text-align:center;">
              <p style="margin:0; color:#6b5f58; font-size:13px; line-height:1.7;">
                Your current email has <strong style="color:#1a1714;">not changed</strong>.
                It will only change if the verification link sent to the new email is approved.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:0 34px 32px;">
              <div style="border:1px solid rgba(196,60,60,0.18); background:rgba(196,60,60,0.06); border-radius:16px; padding:18px 18px; text-align:center;">
                <p style="margin:0; color:#c43c3c; font-size:13px; line-height:1.7; font-weight:700;">
                  If this was not you, change your password immediately and review your active sessions.
                </p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="background:#1e1c19; padding:20px 24px; text-align:center;">
              <p style="margin:0; color:#f2f0eb; font-size:13px; font-weight:700; letter-spacing:-0.2px;">
                immin<span style="color:#e8816a;">iq</span><span style="color:#e8816a;">.</span>
              </p>

              <p style="margin:7px 0 0; color:#9b9a92; font-size:11px; line-height:1.5;">
                Your personal AI learning OS for mastering anything.
              </p>

              <p style="margin:7px 0 0; color:#6b6a62; font-size:11px; line-height:1.5;">
                © ${CURRENT_YEAR} Imminiq. Crafted for intentional learners.
              </p>
            </td>
          </tr>

        </table>

        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:580px;">
          <tr>
            <td style="padding:16px 16px 0; text-align:center;">
              <p style="margin:0; color:#9f8f86; font-size:11px; line-height:1.6;">
                AI Roadmaps • Mock Tests • Visual Learning • Progress Tracking
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
`;
};
