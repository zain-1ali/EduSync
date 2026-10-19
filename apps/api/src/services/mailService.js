import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

let transport;

function getTransport() {
  if (!env.SMTP_HOST) return null;
  if (!transport) {
    transport = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth:
        env.SMTP_USER && env.SMTP_PASS
          ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
          : undefined,
    });
  }
  return transport;
}

async function deliver({ to, subject, text }) {
  const mailer = getTransport();
  if (!mailer) {
    if (env.NODE_ENV === 'production') {
      throw new AppError(
        503,
        'EMAIL_NOT_CONFIGURED',
        'Email delivery must be configured before this operation'
      );
    }
    return { preview: text };
  }

  await mailer.sendMail({
    from: env.MAIL_FROM,
    to,
    subject,
    text,
  });
  return { preview: null };
}

export async function sendSetupInvitation({ email, name, token }) {
  const setupUrl = new URL('/setup-password', env.APP_URL);
  setupUrl.searchParams.set('token', token);
  const text = `Hello ${name},\n\nYour EduSync school account is ready. Set your password using this expiring link:\n${setupUrl}\n`;
  const result = await deliver({ to: email, subject: 'Set up your EduSync account', text });
  return { ...result, url: env.NODE_ENV === 'production' ? undefined : setupUrl.toString() };
}

export async function sendPasswordReset({ email, name, token }) {
  const resetUrl = new URL('/reset-password', env.APP_URL);
  resetUrl.searchParams.set('token', token);
  const text = `Hello ${name},\n\nReset your EduSync password using this expiring link:\n${resetUrl}\n`;
  const result = await deliver({ to: email, subject: 'Reset your EduSync password', text });
  return { ...result, url: env.NODE_ENV === 'production' ? undefined : resetUrl.toString() };
}
