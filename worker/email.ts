// Shared: Env type + Cloudflare Email Sending helper used by the forms and by Chuy.
interface SendEmailBinding { send(msg: { to: string | string[]; from: string | { email: string; name?: string }; subject: string; html?: string; text?: string }): Promise<{ messageId?: string }> }
export type ExecutionContext = { waitUntil(p: Promise<unknown>): void };
export interface Env {
  AI?: { run: (model: string, input: Record<string, unknown>) => Promise<any> };   // Workers AI (Chuy chatbot)
  CHAT_RL?: { limit: (o: { key: string }) => Promise<{ success: boolean }> };     // rate limiter for /api/chat
  ASSETS: { fetch: (req: Request) => Promise<Response> };
  EMAIL: SendEmailBinding;        // Cloudflare Email Sending binding
  LEAD_TO_EMAIL?: string;
  LEAD_FROM_EMAIL?: string;       // must be on a domain onboarded in Email Sending
  LEAD_FROM_NAME?: string;
  STRIPE_SECRET_KEY?: string;
}

const DEFAULT_TO = 'help@elpasotrafficticket.com';
const DEFAULT_FROM = 'noreply@elpasotrafficticket.com';

export const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
export const json = (obj: unknown, status = 200) => new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export async function sendEmail(env: Env, subject: string, rows: [string, string][], message?: string, replyTo?: string) {
  if (!env.EMAIL) { console.error('EMAIL binding missing'); return false; }
  if (replyTo) rows = [['Reply to', replyTo], ...rows];
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#111"><h2 style="margin:0 0 12px">${esc(subject)}</h2><table cellpadding="6" style="border-collapse:collapse">${rows.map(([k, v]) => `<tr><td style="color:#666;padding-right:14px;vertical-align:top"><b>${esc(k)}</b></td><td>${esc(v)}</td></tr>`).join('')}</table>${message ? `<h3 style="margin:18px 0 6px">Message</h3><p style="white-space:pre-wrap;background:#f6f6f6;padding:12px;border-radius:6px">${esc(message)}</p>` : ''}</div>`;
  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n') + (message ? `\n\nMessage:\n${message}` : '');
  try {
    const r = await env.EMAIL.send({ to: env.LEAD_TO_EMAIL || DEFAULT_TO, from: { email: env.LEAD_FROM_EMAIL || DEFAULT_FROM, name: env.LEAD_FROM_NAME || 'El Paso Traffic Ticket Firm' }, subject, html, text });
    console.log('email sent', r?.messageId, subject);
    return true;
  } catch (e) {
    console.error('Email send failed', (e as Error).message, subject);
    return false;
  }
}

