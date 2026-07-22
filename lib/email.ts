import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.RESEND_FROM_EMAIL || "Stamp <onboarding@resend.dev>";

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  if (!resend) {
    throw new Error("Email sending isn't configured (missing RESEND_API_KEY).");
  }

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: "Reset your Stamp password",
    text: `An admin started a password reset for your Stamp account.\n\nSet a new password here: ${resetUrl}\n\nThis link expires in one hour and can only be used once. If you didn't expect this, you can ignore it — your password won't change unless you open the link above.`,
  });

  if (error) {
    throw new Error(error.message);
  }
}
