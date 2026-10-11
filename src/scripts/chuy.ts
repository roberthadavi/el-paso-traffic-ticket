// Chuy chat widget — talks to /api/chat (SSE). Conversation + captured lead persist in sessionStorage across pages.
(() => {
  const root = document.getElementById('chuy'); if (!root) return;
  const launch = document.getElementById('chuy-launch')!, panel = document.getElementById('chuy-panel')!, closeBtn = document.getElementById('chuy-close')!;
  const log = document.getElementById('chuy-log')!, chips = document.getElementById('chuy-chips')!, form = document.getElementById('chuy-form') as HTMLFormElement, input = document.getElementById('chuy-input') as HTMLInputElement;
  const phone = root.dataset.phone || '915-503-1600';
  type Msg = { role: 'user' | 'assistant'; content: string };
  type State = { messages: Msg[]; lead: Record<string, string>; leadSent: boolean; open: boolean };
  const KEY = 'chuy-v1';
  const load = (): State => { try { return { messages: [], lead: {}, leadSent: false, open: false, ...JSON.parse(sessionStorage.getItem(KEY) || '{}') }; } catch { return { messages: [], lead: {}, leadSent: false, open: false }; } };
  const state = load();
  const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch { /* private mode */ } };
  let busy = false;

  const GREETING = "Hi, I'm Chuy 👍 I help people in El Paso with traffic tickets and warrants. What's going on with yours? (Si prefieres, escríbeme en español.)";

  // Render helpers — plain text, with URLs and phone turned into links.
  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
  const linkify = (s: string) => esc(s)
    .replace(/https?:\/\/[^\s<)]+/g, (u) => { const clean = u.replace(/[.,!?]+$/, ''); const path = clean.replace(/^https?:\/\/elpasotrafficticket\.com/, '') || '/'; const tail = u.slice(clean.length); const label = path.replace(/\/$/, '').split('/').pop()?.replace(/-/g, ' ') || 'elpasotrafficticket.com'; return `<a href="${path}">${label}</a>${tail}`; })
    .replace(/\b(915)[-. ](\d{3})[-. ](\d{4})\b/g, (m) => `<a href="tel:${m.replace(/\D/g, '')}">${m}</a>`)
    .replace(/\n/g, '<br>');
  const bubble = (role: 'user' | 'assistant', html: string) => {
    const el = document.createElement('div'); el.className = `chuy-msg chuy-${role}`; el.innerHTML = html; log.appendChild(el); log.scrollTop = log.scrollHeight; return el;
  };
  const render = () => {
    log.innerHTML = '';
    if (!state.messages.length) bubble('assistant', linkify(GREETING));
    state.messages.forEach((m) => bubble(m.role, m.role === 'user' ? esc(m.content) : linkify(m.content)));
    chips.hidden = state.messages.length > 0;
  };

  const setOpen = (open: boolean) => {
    state.open = open; save();
    panel.hidden = !open; launch.setAttribute('aria-expanded', String(open)); root.classList.toggle('is-open', open); document.body.classList.toggle('chuy-open', open);
    if (open) { render(); setTimeout(() => input.focus(), 50); }
  };
  launch.addEventListener('click', () => setOpen(panel.hidden));
  closeBtn.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) setOpen(false); });

  async function send(text: string) {
    text = text.trim(); if (!text || busy) return;
    busy = true; chips.hidden = true;
    state.messages.push({ role: 'user', content: text }); save();
    bubble('user', esc(text));
    const typing = bubble('assistant', '<span class="chuy-typing"><i></i><i></i><i></i></span>');
    let reply = '';
    try {
      const r = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: state.messages.slice(-30), lead: state.lead, leadSent: state.leadSent, page: location.pathname }) });
      if (!r.ok || !r.body) throw new Error(r.status === 429 ? 'rate' : 'http');
      const reader = r.body.getReader(); const dec = new TextDecoder(); let buf = '';
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split('\n'); buf = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const p = line.slice(5).trim(); if (p === '[DONE]') continue;
          try {
            const j = JSON.parse(p);
            if (j.lead) { state.lead = j.lead; state.leadSent = !!j.leadSent; save(); }
            if (j.t) { reply += j.t; typing.innerHTML = linkify(reply); log.scrollTop = log.scrollHeight; }
          } catch { /* partial */ }
        }
      }
      if (!reply) throw new Error('empty');
    } catch (e) {
      reply = (e as Error).message === 'rate' ? `Whoa, that's a lot of messages 👍 Give me a minute — or just call us at ${phone}.` : `Sorry, I lost my connection for a second. Try again, or call/text us at ${phone}.`;
      typing.innerHTML = linkify(reply);
    }
    state.messages.push({ role: 'assistant', content: reply }); save();
    busy = false; input.focus();
  }

  form.addEventListener('submit', (e) => { e.preventDefault(); const v = input.value; input.value = ''; send(v); });
  chips.addEventListener('click', (e) => { const b = (e.target as HTMLElement).closest('button[data-q]') as HTMLButtonElement | null; if (b) send(b.dataset.q!); });

  // Final transcript when leaving the page, once a lead has been captured.
  const flush = () => {
    if (!state.leadSent || state.messages.length < 4) return;
    try { navigator.sendBeacon('/api/chat/transcript', new Blob([JSON.stringify({ messages: state.messages.slice(-40), lead: state.lead, page: location.pathname })], { type: 'application/json' })); } catch { /* ignore */ }
  };
  addEventListener('pagehide', flush);

  if (state.open) setOpen(true);
  // Gentle nudge: pulse the launcher after 20s on first visit of the session
  if (!state.messages.length && !state.open) setTimeout(() => root.classList.add('chuy-nudge'), 20000);
})();
