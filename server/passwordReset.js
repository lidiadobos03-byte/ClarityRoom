import crypto from 'node:crypto';
import { config } from './config.js';

export const PASSWORD_RESET_TTL_MS = 1000 * 60 * 30;

export function createPasswordResetToken() {
  return crypto.randomBytes(32).toString('base64url');
}

export function hashPasswordResetToken(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
}

export function buildPasswordResetLink(token) {
  const url = new URL(config.appUrl);
  url.searchParams.set('reset_password', token);
  url.hash = 'join';
  return url.toString();
}

export async function sendPasswordResetEmail(to, resetLink) {
  if (!config.resendApiKey) return { sent: false, reason: 'missing_resend_api_key' };

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: config.emailFrom,
      to,
      subject: 'Reset your ClarityRoom password',
      text: [
        'We received a request to reset your ClarityRoom password.',
        '',
        `Use this link within 30 minutes: ${resetLink}`,
        '',
        'If you did not request this, you can ignore this email.',
      ].join('\n'),
      html: `
        <p>We received a request to reset your ClarityRoom password.</p>
        <p><a href="${resetLink}">Reset your password</a></p>
        <p>This link expires in 30 minutes. If you did not request this, you can ignore this email.</p>
      `,
    }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    return {
      sent: false,
      reason: payload.message || payload.error || 'Could not send password reset email.',
    };
  }

  return { sent: true };
}
