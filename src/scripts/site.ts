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
  if (hdr) hdr.classList.add('ept-sticky');
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
