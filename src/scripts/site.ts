// Minimal replacements for the Elementor front-end JS the old site relied on.
(() => {
  // Mark the current page in both nav menus (desktop + dropdown)
  const here = location.pathname.replace(/\/+$/, '') || '/';
  document.querySelectorAll<HTMLAnchorElement>('.elementor-nav-menu a[href]').forEach((a) => {
    const p = a.getAttribute('href')!.replace(/\/+$/, '') || '/';
    if (p === here) { a.classList.add('elementor-item-active'); a.closest('li')?.classList.add('current-menu-item'); }
  });

  // Burger menu toggle
  document.querySelectorAll<HTMLElement>('.elementor-widget-nav-menu').forEach((w) => {
    const toggle = w.querySelector<HTMLElement>('.elementor-menu-toggle');
    const dropdown = w.querySelector<HTMLElement>('nav.elementor-nav-menu--dropdown');
    if (!toggle || !dropdown) return;
    const set = (open: boolean) => {
      toggle.classList.toggle('elementor-active', open);
      toggle.setAttribute('aria-expanded', String(open));
      dropdown.setAttribute('aria-hidden', String(!open));
      dropdown.classList.toggle('elementor-nav-menu--active', open);
      dropdown.querySelectorAll('a').forEach((a) => a.setAttribute('tabindex', open ? '0' : '-1'));
    };
    toggle.addEventListener('click', () => set(!toggle.classList.contains('elementor-active')));
    toggle.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle.click(); } });
    // sub-menu open on tap inside the dropdown
    dropdown.querySelectorAll<HTMLElement>('li.menu-item-has-children > a').forEach((a) => {
      a.addEventListener('click', (e) => { if (!a.getAttribute('href')) { e.preventDefault(); a.parentElement!.classList.toggle('elementor-active'); a.parentElement!.querySelector('.sub-menu')?.classList.toggle('elementor-nav-menu--active'); } });
    });
  });

  // YouTube click-to-play (replaces the Elementor lightbox)
  document.querySelectorAll<HTMLElement>('.elementor-widget-video[data-youtube]').forEach((w) => {
    const url = w.dataset.youtube || '';
    const id = (url.match(/(?:youtu\.be\/|v=)([\w-]{6,})/) || [])[1];
    if (!id) return;
    const overlay = w.querySelector<HTMLElement>('.elementor-custom-embed-image-overlay');
    const wrap = w.querySelector<HTMLElement>('.elementor-wrapper') || w;
    const play = () => {
      wrap.innerHTML = `<div class="ept-video"><iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0" title="How to Fight a Traffic Ticket" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
    };
    (overlay || wrap).addEventListener('click', play);
    overlay?.setAttribute('role', 'button');
    overlay?.setAttribute('tabindex', '0');
  });

  // Sticky header on mobile (Elementor "sticky: top, on mobile")
  const hdr = document.querySelector<HTMLElement>('header.elementor-location-header > .e-con');
  if (hdr && !document.getElementById('r-header')) hdr.classList.add('ept-sticky');
})();

// Shared AJAX submit for all site forms (lookup / contact / fight)
document.querySelectorAll<HTMLFormElement>('form[data-ept-form]').forEach((form) => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const btn = form.querySelector<HTMLButtonElement>('.ept-submit')!;
    const status = form.querySelector<HTMLElement>('.ept-status')!;
    btn.disabled = true; btn.textContent = btn.dataset.sending || 'Sending…'; status.className = 'ept-status';
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || String(res.status));
      if (data.redirect) { window.location.href = data.redirect; return; }
      status.textContent = status.dataset.ok!; status.className = 'ept-status ok';
      form.reset();
      if (form.hasAttribute('data-fight')) window.location.href = '/thank-you/';
    } catch {
      status.textContent = status.dataset.err!; status.className = 'ept-status err';
    } finally {
      btn.disabled = false; btn.textContent = btn.dataset.label || 'Submit';
    }
  });
});


// ---- Redesign shell: mega menus, mobile drawer, EN/ES ----
(() => {
  const header = document.getElementById('r-header'); if (!header) return;
  const items = Array.from(header.querySelectorAll<HTMLElement>('.r-nav-item'));
  const closeAll = (except?: HTMLElement) => items.forEach((it) => { if (it !== except) { it.classList.remove('is-open'); it.querySelector('.r-nav-link')?.setAttribute('aria-expanded', 'false'); } });
  items.forEach((it) => {
    const btn = it.querySelector<HTMLElement>('button.r-nav-link'); if (!btn) return;
    let t: number | undefined;
    const open = () => { closeAll(it); it.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); };
    const close = () => { it.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); };
    it.addEventListener('mouseenter', () => { window.clearTimeout(t); open(); });
    it.addEventListener('mouseleave', () => { t = window.setTimeout(close, 120); });
    btn.addEventListener('click', () => (it.classList.contains('is-open') ? close() : open()));
    it.addEventListener('focusout', (e) => { if (!it.contains(e.relatedTarget as Node)) close(); });
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAll(); });

  const burger = document.getElementById('r-burger'), drawer = document.getElementById('r-drawer');
  if (burger && drawer) burger.addEventListener('click', () => { const open = drawer.hidden; drawer.hidden = !open; burger.setAttribute('aria-expanded', String(open)); burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); });

  // EN / ES — drives the GTranslate engine already loaded on the page
  const setLang = (lang: string) => {
    document.querySelectorAll<HTMLButtonElement>('.r-lang-btn').forEach((b) => { const on = b.dataset.lang === lang; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on)); });
    const gt = (window as any).doGTranslate; if (typeof gt === 'function') gt('en|' + lang);
  };
  document.querySelectorAll<HTMLButtonElement>('.r-lang-btn').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang || 'en')));
  const m = document.cookie.match(/googtrans=\/en\/(\w+)/); if (m && m[1] !== 'en') setLang(m[1]);
})();
