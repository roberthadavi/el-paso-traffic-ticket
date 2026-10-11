// Cloudflare Worker for elpasotrafficticket.com
// - serves the static Astro build (ASSETS binding, run_worker_first = true so redirects/headers always run)
// - POST /api/lookup, /api/contact → email the lead via Cloudflare Email Sending (send_email binding "EMAIL")
// - POST /api/fight → email the hire request; if STRIPE_SECRET_KEY is set, create a Stripe Checkout session and return its URL
import { COURTS, WARRANT_FIRST, WARRANT_ADDITIONAL, MAX_TICKETS, MAX_EXTRA_CITATIONS, MAX_WARRANTS } from '../src/data/pricing';

interface SendEmailBinding { send(msg: { to: string | string[]; from: string | { email: string; name?: string }; subject: string; html?: string; text?: string }): Promise<{ messageId?: string }> }
export interface Env {
  ASSETS: { fetch: (req: Request) => Promise<Response> };
  EMAIL: SendEmailBinding;        // Cloudflare Email Sending binding
  LEAD_TO_EMAIL?: string;
  LEAD_FROM_EMAIL?: string;       // must be on a domain onboarded in Email Sending
  LEAD_FROM_NAME?: string;
  STRIPE_SECRET_KEY?: string;
}

const CANONICAL_HOST = 'elpasotrafficticket.com';
const DEFAULT_TO = 'help@elpasotrafficticket.com';
const DEFAULT_FROM = 'noreply@elpasotrafficticket.com';

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const json = (obj: unknown, status = 200) => new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

async function sendEmail(env: Env, subject: string, rows: [string, string][], message?: string, replyTo?: string) {
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

async function readForm(req: Request) {
  let data: FormData;
  try { data = await req.formData(); } catch { return null; }
  const get = (k: string) => String(data.get(k) ?? '').trim().slice(0, 2000);
  return { data, get };
}

async function handleLookup(req: Request, env: Env) {
  const f = await readForm(req); if (!f) return json({ ok: false, error: 'bad_form' }, 400);
  const { get } = f;
  if (get('website')) return json({ ok: true });
  const name = get('name'), dob = get('dob'), phone = get('phone'), dl = get('dl');
  if (!name || !dob || !phone || !dl) return json({ ok: false, error: 'missing_fields' }, 400);
  const rows: [string, string][] = [['Name', name], ['Date of birth', dob], ['Phone', phone], ['Email', get('email') || '—'], ['Citation number(s)', get('citations') || '—'], ["Driver's license", dl], ['Heard about us', get('source') || '—'], ['Page', get('page')], ['IP', req.headers.get('cf-connecting-ip') ?? ''], ['Received', new Date().toISOString()]];
  const ok = await sendEmail(env, `Warrant / Ticket Inquiry — ${name}`, rows, undefined, get('email'));
  return json(ok ? { ok: true } : { ok: false, error: 'send_failed' }, ok ? 200 : 502);
}

async function handleContact(req: Request, env: Env) {
  const f = await readForm(req); if (!f) return json({ ok: false, error: 'bad_form' }, 400);
  const { get } = f;
  if (get('website')) return json({ ok: true });
  const name = get('name'), phone = get('phone'), email = get('email');
  if (!name || !phone || !email) return json({ ok: false, error: 'missing_fields' }, 400);
  const rows: [string, string][] = [['Name', name], ['Phone', phone], ['Email', email], ['Ticket type', get('matter') || '—'], ['Page', get('page')], ['IP', req.headers.get('cf-connecting-ip') ?? ''], ['Received', new Date().toISOString()]];
  const ok = await sendEmail(env, `Website contact — ${name}`, rows, get('message'), email);
  return json(ok ? { ok: true } : { ok: false, error: 'send_failed' }, ok ? 200 : 502);
}

function priceOrder(tickets: { court: string; number: string; extra: number }[], warrants: number) {
  const lines: { name: string; amount: number }[] = [];
  tickets.slice(0, MAX_TICKETS).forEach((t, i) => {
    const c = COURTS.find((x) => x.id === t.court); if (!c) return;
    lines.push({ name: `${i === 0 ? 'Ticket' : `Ticket ${i + 1}`} — ${c.name} #${t.number}`, amount: i === 0 ? c.first : c.additional });
    const extra = Math.min(MAX_EXTRA_CITATIONS, Math.max(0, Number(t.extra) || 0));
    if (extra) lines.push({ name: `${extra} additional citation(s) — ${c.name}`, amount: extra * (i === 0 ? c.extraFirst : c.extraAdditional) });
  });
  const w = Math.min(MAX_WARRANTS, Math.max(0, warrants));
  if (w) lines.push({ name: `${w} warrant(s)`, amount: WARRANT_FIRST + (w - 1) * WARRANT_ADDITIONAL });
  return { lines, total: lines.reduce((s, l) => s + l.amount, 0) };
}

async function handleFight(req: Request, env: Env, origin: string) {
  const f = await readForm(req); if (!f) return json({ ok: false, error: 'bad_form' }, 400);
  const { get } = f;
  if (get('website')) return json({ ok: true });
  let tickets: any[] = [];
  try { tickets = JSON.parse(get('tickets_json') || '[]'); } catch { /* ignore */ }
  const first = get('first_name'), last = get('last_name'), dob = get('dob'), email = get('email'), phone = get('phone');
  if (!first || !last || !dob || !email || !phone || !tickets.length || !tickets[0].court || !tickets[0].number) return json({ ok: false, error: 'missing_fields' }, 400);
  const warrants = get('has_warrants') === 'yes' ? Math.max(1, parseInt(get('warrants') || '1', 10)) : 0;
  const { lines, total } = priceOrder(tickets, warrants);
  const name = `${first} ${last}`;
  const rows: [string, string][] = [['Name', name], ['Date of birth', dob], ["Driver's license", get('dl') || '—'], ['Email', email], ['Phone', phone], ['CDL', get('cdl') || '—'], ['Warrants', String(warrants)], ...lines.map((l): [string, string] => [l.name, `$${l.amount}`]), ['TOTAL', `$${total}`], ['Coupon', get('coupon') || '—'], ['Heard about us', get('source') || '—'], ['Page', get('page')], ['IP', req.headers.get('cf-connecting-ip') ?? ''], ['Received', new Date().toISOString()]];

  if (env.STRIPE_SECRET_KEY && total > 0) {
    const p = new URLSearchParams();
    p.set('mode', 'payment');
    p.set('success_url', `${origin}/thank-you/?paid=1`);
    p.set('cancel_url', `${origin}/fight-my-ticket/?canceled=1`);
    p.set('customer_email', email);
    p.set('metadata[name]', name); p.set('metadata[phone]', phone); p.set('metadata[dob]', dob);
    p.set('metadata[tickets]', tickets.map((t) => `${t.court}:${t.number}+${t.extra || 0}`).join(', ').slice(0, 490));
    p.set('metadata[warrants]', String(warrants)); p.set('metadata[cdl]', get('cdl')); p.set('metadata[coupon]', get('coupon'));
    lines.forEach((l, i) => {
      p.set(`line_items[${i}][quantity]`, '1');
      p.set(`line_items[${i}][price_data][currency]`, 'usd');
      p.set(`line_items[${i}][price_data][unit_amount]`, String(l.amount * 100));
      p.set(`line_items[${i}][price_data][product_data][name]`, l.name.slice(0, 120));
    });
    if (get('coupon')) p.set('allow_promotion_codes', 'true');
    const r = await fetch('https://api.stripe.com/v1/checkout/sessions', { method: 'POST', headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: p });
    const s: any = await r.json().catch(() => ({}));
    if (r.ok && s.url) {
      await sendEmail(env, `Fight My Ticket — ${name} ($${total}) — Stripe checkout started`, rows, undefined, email);
      return json({ ok: true, redirect: s.url });
    }
    console.error('Stripe error', r.status, JSON.stringify(s).slice(0, 500));
  }
  // No Stripe configured (or Stripe failed): email the order and have the office call for payment.
  const ok = await sendEmail(env, `Fight My Ticket — ${name} ($${total}) — CALL FOR PAYMENT`, rows, undefined, email);
  return json(ok ? { ok: true } : { ok: false, error: 'send_failed' }, ok ? 200 : 502);
}

// Old WordPress URLs → new locations (keys have no trailing slash)
const REDIRECTS: Record<string, string> = {
  '/hire-me': '/fight-my-ticket/',
  
  '/traffic-tickets-and-warrants-lookup-form-2': '/traffic-tickets-and-warrants-lookup-form/',
  '/traffic-ticket-and-warrants-lookup-form': '/traffic-tickets-and-warrants-lookup-form/',
  '/browse-submissions': '/',
  '/submission-confirmed': '/thank-you/',
  '/category/traffic-ticket-blog': '/blogs/',
  '/blog': '/blogs/',
  '/author/robertnavar': '/',
  '/author/dasia': '/',
  '/feed': '/',
  '/comments/feed': '/',
  '/wp-sitemap.xml': '/sitemap-index.xml',
  '/sitemap.xml': '/sitemap-index.xml',
  '/sitemap_index.xml': '/sitemap-index.xml',
  '/page-sitemap.xml': '/sitemap-index.xml',
  '/post-sitemap.xml': '/sitemap-index.xml',
  '/category-sitemap.xml': '/sitemap-index.xml',
};

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === '/api/lookup') return handleLookup(req, env);
    if (url.pathname === '/api/contact') return handleContact(req, env);
    if (url.pathname === '/api/fight') return handleFight(req, env, url.origin);
    if (url.hostname === `www.${CANONICAL_HOST}` || (url.hostname === CANONICAL_HOST && url.protocol === 'http:')) {
      url.hostname = CANONICAL_HOST; url.protocol = 'https:';
      return Response.redirect(url.toString(), 301);
    }
    const key = url.pathname.replace(/\/+$/, '') || '/';
    const target = REDIRECTS[key];
    if (target) return Response.redirect(new URL(target, url.origin).toString(), 301);
    if (/^\/(wp-content|wp-admin|wp-includes|wp-json|wp-login\.php|xmlrpc\.php|wp-cron\.php)/.test(url.pathname) || url.pathname.startsWith('/wp-sitemap-') || url.searchParams.has('author')) {
      return Response.redirect(new URL('/', url.origin).toString(), 302);
    }
    if (url.pathname.startsWith('/api/')) return new Response('Not found', { status: 404 });
    const res = await env.ASSETS.fetch(req);
    if (url.hostname.endsWith('.workers.dev')) {
      const h = new Headers(res.headers); h.set('X-Robots-Tag', 'noindex, nofollow');
      return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
    }
    return res;
  },
};
