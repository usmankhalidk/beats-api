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

export async function sendVerificationEmail(to: string, rawToken: string): Promise<void> {
  const link = `${config.frontend.url}/verify-email?token=${rawToken}`;
  await transporter.sendMail({
    from: config.mail.from,
    to,
    subject: 'Verify your Beatpillz account',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
        <h2>Welcome to Beatpillz!</h2>
        <p>Click the button below to verify your email address. The link expires in 24 hours.</p>
        <p style="text-align:center;margin:32px 0">
          <a href="${link}"
             style="background:#1a1a1a;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600">
            Verify Email
          </a>
        </p>
        <p style="color:#666;font-size:13px">Or copy this link into your browser:<br>${link}</p>
      </div>
    `,
  });
}
