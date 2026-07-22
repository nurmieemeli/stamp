import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.RESEND_FROM_EMAIL || "Stamp <onboarding@resend.dev>";

const MONO_STACK = "'JetBrains Mono', ui-monospace, 'SF Mono', 'Cascadia Code', Menlo, Consolas, monospace";

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type ResetEmailReason = "admin" | "self";

function resetIntro(reason: ResetEmailReason): string {
  return reason === "admin"
    ? "An admin at Stamp started a password reset for your account."
    : "We received a request to reset your Stamp password.";
}

function buildAvatarHtml(avatarUrl: string | null, initial: string): string {
  if (avatarUrl) {
    return `<img src="${avatarUrl}" width="64" height="64" alt="" style="display:block;width:64px;height:64px;border-radius:50%;object-fit:cover;border:1px solid #2a2c30;" />`;
  }
  return `<div style="width:64px;height:64px;border-radius:50%;background:#1d1f23;border:1px solid #2a2c30;color:#e8a33d;font-size:26px;font-weight:700;line-height:64px;text-align:center;font-family:${MONO_STACK};">${initial}</div>`;
}

export function buildResetEmailHtml(params: {
  displayName: string;
  initial: string;
  avatarUrl: string | null;
  resetUrl: string;
  reason: ResetEmailReason;
}): string {
  const name = escapeHtml(params.displayName);
  const intro = resetIntro(params.reason);
  const avatar = buildAvatarHtml(params.avatarUrl, escapeHtml(params.initial));

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#0b0c0d;font-family:${MONO_STACK};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b0c0d;padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="width:480px;max-width:100%;background:#17181b;border:1px solid #2a2c30;">
            <tr>
              <td style="padding:20px 28px;border-bottom:1px solid #2a2c30;">
                <span style="color:#e8a33d;font-size:13px;">&gt;</span>
                <span style="color:#e4e1d8;font-size:13px;font-weight:700;letter-spacing:0.02em;"> Stamp</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 28px 8px;text-align:center;">
                ${avatar}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 28px 0;text-align:center;">
                <p style="margin:0 0 6px;color:#e4e1d8;font-size:15px;font-weight:700;">Hi ${name},</p>
                <p style="margin:0;color:#82858c;font-size:13px;line-height:1.6;">${intro}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 28px 8px;text-align:center;">
                <a href="${params.resetUrl}" style="display:inline-block;background:#e8a33d;color:#1a1300;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;text-decoration:none;padding:12px 28px;">Reset password</a>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 28px 0;text-align:center;">
                <p style="margin:0;color:#52555c;font-size:11px;line-height:1.6;">
                  Or paste this link into your browser:<br />
                  <a href="${params.resetUrl}" style="color:#e8a33d;word-break:break-all;">${params.resetUrl}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 28px 28px;text-align:center;">
                <p style="margin:0;color:#52555c;font-size:11px;line-height:1.6;">
                  This link expires in one hour and works once. If you didn&rsquo;t expect this, you can ignore it
                  — your password stays the same until you open the link above.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 28px;border-top:1px solid #2a2c30;text-align:center;">
                <p style="margin:0;color:#52555c;font-size:10px;letter-spacing:0.04em;text-transform:uppercase;">stamp.rip</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function buildResetEmailText(params: { displayName: string; resetUrl: string; reason: ResetEmailReason }): string {
  const intro = resetIntro(params.reason);
  return `Hi ${params.displayName},\n\n${intro}\n\nSet a new password here: ${params.resetUrl}\n\nThis link expires in one hour and works once. If you didn't expect this, you can ignore it — your password stays the same until you open the link above.`;
}

function buildVerificationEmailHtml(params: { displayName: string; code: string }): string {
  const name = escapeHtml(params.displayName);
  const spacedCode = params.code.split("").join(" ");

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#0b0c0d;font-family:${MONO_STACK};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b0c0d;padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="width:480px;max-width:100%;background:#17181b;border:1px solid #2a2c30;">
            <tr>
              <td style="padding:20px 28px;border-bottom:1px solid #2a2c30;">
                <span style="color:#e8a33d;font-size:13px;">&gt;</span>
                <span style="color:#e4e1d8;font-size:13px;font-weight:700;letter-spacing:0.02em;"> Stamp</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 28px 0;text-align:center;">
                <p style="margin:0 0 6px;color:#e4e1d8;font-size:15px;font-weight:700;">Hi ${name},</p>
                <p style="margin:0;color:#82858c;font-size:13px;line-height:1.6;">
                  Confirm this is your email address by entering the code below.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 28px;text-align:center;">
                <span style="display:inline-block;background:#0f1012;border:1px solid #2a2c30;color:#e8a33d;font-size:28px;font-weight:700;letter-spacing:6px;padding:16px 20px;">${spacedCode}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 28px;text-align:center;">
                <p style="margin:0;color:#52555c;font-size:11px;line-height:1.6;">
                  This code expires in 30 minutes and works once. If you didn&rsquo;t sign up for Stamp, you can
                  ignore this email.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 28px;border-top:1px solid #2a2c30;text-align:center;">
                <p style="margin:0;color:#52555c;font-size:10px;letter-spacing:0.04em;text-transform:uppercase;">stamp.rip</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function buildVerificationEmailText(params: { displayName: string; code: string }): string {
  return `Hi ${params.displayName},\n\nConfirm this is your email address by entering this code on Stamp: ${params.code}\n\nThis code expires in 30 minutes and works once. If you didn't sign up for Stamp, you can ignore this email.`;
}

export async function sendVerificationEmail(params: { to: string; displayName: string; code: string }): Promise<void> {
  if (!resend) {
    throw new Error("Email sending isn't configured (missing RESEND_API_KEY).");
  }

  const displayName = params.displayName.trim() || params.to.split("@")[0];

  const { error } = await resend.emails.send({
    from: FROM,
    to: params.to,
    subject: `${params.code} is your Stamp verification code`,
    html: buildVerificationEmailHtml({ displayName, code: params.code }),
    text: buildVerificationEmailText({ displayName, code: params.code }),
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function sendPasswordResetEmail(params: {
  to: string;
  resetUrl: string;
  displayName: string;
  avatarUrl?: string | null;
  reason: ResetEmailReason;
}): Promise<void> {
  if (!resend) {
    throw new Error("Email sending isn't configured (missing RESEND_API_KEY).");
  }

  const displayName = params.displayName.trim() || params.to.split("@")[0];
  const initial = displayName.charAt(0).toUpperCase();

  const { error } = await resend.emails.send({
    from: FROM,
    to: params.to,
    subject: "Reset your Stamp password",
    html: buildResetEmailHtml({
      displayName,
      initial,
      avatarUrl: params.avatarUrl ?? null,
      resetUrl: params.resetUrl,
      reason: params.reason,
    }),
    text: buildResetEmailText({ displayName, resetUrl: params.resetUrl, reason: params.reason }),
  });

  if (error) {
    throw new Error(error.message);
  }
}
