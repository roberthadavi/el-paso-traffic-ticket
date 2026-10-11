import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') ? [p] : []; });
const files = walk('dist'); const bad = {}; let total = 0;
const redirects = new Set(['/hire-me/','/traffic-tickets-and-warrants-lookup-form-2/','/traffic-ticket-and-warrants-lookup-form/','/traffic-ticket-and-warrants-lookup-form','/browse-submissions/','/submission-confirmed/','/category/traffic-ticket-blog/','/schedule-an-appointment']);
for (const f of files) {
  const html = readFileSync(f, 'utf8');
  for (const m of html.matchAll(/href="(\/[^"#?]*)/g)) {
    const h = m[1]; total++;
    if (redirects.has(h) || h.startsWith('/legacy/') || h.startsWith('/images/') || h.startsWith('/css/') || h.startsWith('/_astro/') || h === '/sitemap-index.xml') continue;
    const p = h.endsWith('/') ? `dist${h}index.html` : (existsSync(`dist${h}`) ? `dist${h}` : `dist${h}/index.html`);
    if (!existsSync(p)) (bad[h] = bad[h] || []).push(f.replace('dist', ''));
  }
}
console.log(`${files.length} pages, ${total} internal hrefs`);
for (const [h, where] of Object.entries(bad)) console.log('BROKEN', h, '←', [...new Set(where)].slice(0, 3).join(', '), where.length > 3 ? `(+${where.length - 3})` : '');
if (!Object.keys(bad).length) console.log('no broken internal links');
