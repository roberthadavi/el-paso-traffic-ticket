// Post-build: scan dist/ HTML for site photos and write dist/sitemap-images.xml (Google image sitemap extension),
// then register it in dist/sitemap-index.xml. Captions come from the rendered alt text; geo_location is the office city.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const SITE = 'https://elpasotrafficticket.com';
const dist = new URL('../dist/', import.meta.url).pathname;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : p.endsWith('index.html') ? [p] : []; });

const urls = [];
for (const file of walk(dist)) {
  const html = readFileSync(file, 'utf8');
  if (/<meta name="robots" content="noindex/.test(html)) continue;
  const path = '/' + file.slice(dist.length).replace(/index\.html$/, '');
  if (/^\/(404|thank-you)\//.test(path)) continue;
  const seen = new Map();
  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    const tag = m[0];
    const src = tag.match(/\bsrc="(\/images\/(?:staff|office)\/[^"]+)"/)?.[1];
    if (!src || seen.has(src)) continue;
    const alt = tag.match(/\balt="([^"]*)"/)?.[1] || '';
    seen.set(src, alt);
  }
  if (seen.size) urls.push({ loc: SITE + path, images: [...seen] });
}
urls.sort((a, b) => a.loc.localeCompare(b.loc));

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.map((u) => `  <url>
    <loc>${esc(u.loc)}</loc>
${u.images.map(([src, alt]) => `    <image:image>
      <image:loc>${esc(SITE + src)}</image:loc>
      <image:caption>${esc(alt.replace(/&amp;/g, '&'))}</image:caption>
      <image:geo_location>El Paso, Texas, United States</image:geo_location>
      <image:license>${SITE}/terms-of-use/</image:license>
    </image:image>`).join('\n')}
  </url>`).join('\n')}
</urlset>
`;
writeFileSync(join(dist, 'sitemap-images.xml'), xml);

const idx = join(dist, 'sitemap-index.xml');
let index = readFileSync(idx, 'utf8');
if (!index.includes('sitemap-images.xml')) index = index.replace('</sitemapindex>', `<sitemap><loc>${SITE}/sitemap-images.xml</loc></sitemap></sitemapindex>`);
writeFileSync(idx, index);
console.log(`image sitemap: ${urls.length} pages, ${urls.reduce((n, u) => n + u.images.length, 0)} image entries`);
