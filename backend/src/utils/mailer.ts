import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../config/env';
import { logger } from './logger';

/**
 * Lazily-built SMTP transport. If SMTP isn't configured (no host), we fall back
 * to a "console transport" that logs the message — so flows still work in dev
 * and the app can send real email simply by setting SMTP_* env vars later.
 */
let transporter: Transporter | null | undefined;

function getTransport(): Transporter | null {
  if (transporter !== undefined) return transporter;
  if (!env.mail.host) {
    transporter = null;
    return null;
  }
  transporter = nodemailer.createTransport({
    host: env.mail.host,
    port: env.mail.port,
    secure: env.mail.port === 465,
    auth: env.mail.user ? { user: env.mail.user, pass: env.mail.pass } : undefined,
  });
  return transporter;
}

export async function sendMail(opts: { to: string; subject: string; html: string; text?: string }): Promise<{ delivered: boolean }> {
  const t = getTransport();
  if (!t) {
    logger.info(
      `📧 [mail:console] (SMTP not configured) → To: ${opts.to} | Subject: ${opts.subject}\n${opts.text ?? opts.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}`,
    );
    return { delivered: false };
  }
  await t.sendMail({ from: env.mail.from, ...opts });
  return { delivered: true };
}

const wrap = (title: string, body: string) => `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#0b0f14;color:#dfe5ee;padding:32px">
    <div style="max-width:480px;margin:0 auto;background:#0d131a;border:1px solid #1a2430;border-radius:16px;padding:28px">
      <h2 style="font-family:'Sora',Arial,sans-serif;color:#fff;margin:0 0 6px">${title}</h2>
      ${body}
      <p style="font-size:12px;color:#6b7686;margin-top:24px">GWL Creators Hub</p>
    </div>
  </div>`;

export function sendPasswordResetEmail(to: string, link: string) {
  return sendMail({
    to,
    subject: 'Reset your GWL Creators Hub password',
    text: `Reset your password using this link (valid for 1 hour): ${link}\n\nIf you didn't request this, you can safely ignore this email.`,
    html: wrap(
      'Reset your password',
      `<p style="font-size:14px;line-height:1.6">We received a request to reset your password. Click the button below to choose a new one. This link is valid for <b>1 hour</b>.</p>
       <p style="margin:22px 0"><a href="${link}" style="display:inline-block;background:linear-gradient(95deg,#2A96A6,#36b6c9);color:#06222a;font-weight:700;text-decoration:none;padding:12px 22px;border-radius:10px">Reset password</a></p>
       <p style="font-size:12.5px;color:#A8B3C2;word-break:break-all">Or paste this link into your browser:<br/>${link}</p>
       <p style="font-size:12.5px;color:#6b7686">If you didn't request a reset, you can safely ignore this email — your password won't change.</p>`,
    ),
  });
}
