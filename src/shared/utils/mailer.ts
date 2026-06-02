import nodemailer from 'nodemailer';
import { config } from '@config/index';

const transporter = nodemailer.createTransport({
  host: config.mail.host,
  port: config.mail.port,
  secure: true, // port 465 = implicit SSL
  auth: {
    user: config.mail.user,
    pass: config.mail.pass,
  },
});

async function send(to: string, subject: string, html: string): Promise<void> {
  await transporter.sendMail({ from: config.mail.from, to, subject, html });
}

export async function sendVerificationEmail(to: string, rawToken: string): Promise<void> {
  const link = `${config.frontend.url}/verify-email?token=${encodeURIComponent(rawToken)}`;
  await send(
    to,
    'Verify your Beatpillz account',
    `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px">
      <h2 style="margin-bottom:8px">Welcome to Beatpillz!</h2>
      <p style="color:#555;margin-bottom:24px">
        Click the button below to verify your email address.
        This link expires in ${config.emailVerification.ttlMinutes / 60} hours.
      </p>
      <p style="text-align:center;margin:32px 0">
        <a href="${link}"
           style="background:#1a1a1a;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600">
          Verify Email
        </a>
      </p>
      <p style="color:#999;font-size:12px">
        If you didn't create an account, ignore this email.<br>
        Or copy this link: ${link}
      </p>
    </div>
    `,
  );
}

export async function sendPasswordResetEmail(to: string, rawToken: string): Promise<void> {
  const link = `${config.frontend.url}/reset-password?token=${encodeURIComponent(rawToken)}&email=${encodeURIComponent(to)}`;
  await send(
    to,
    'Reset your Beatpillz password',
    `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px">
      <h2 style="margin-bottom:8px">Reset your password</h2>
      <p style="color:#555;margin-bottom:24px">
        We received a request to reset your password.
        This link expires in ${config.passwordReset.ttlMinutes} minutes.
      </p>
      <p style="text-align:center;margin:32px 0">
        <a href="${link}"
           style="background:#1a1a1a;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600">
          Reset Password
        </a>
      </p>
      <p style="color:#999;font-size:12px">
        If you didn't request this, ignore this email — your password won't change.<br>
        Or copy this link: ${link}
      </p>
    </div>
    `,
  );
}
