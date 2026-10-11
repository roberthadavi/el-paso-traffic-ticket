// Generates /public/images/placeholders/<slug>-N.svg for every section image in the content JSON.
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
const out = 'public/images/placeholders'; mkdirSync(out, { recursive: true });
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const wrap = (t, n = 38) => { const w = t.split(' '); const lines = []; let cur = ''; for (const x of w) { if ((cur + ' ' + x).trim().length > n) { lines.push(cur.trim()); cur = x; } else cur += ' ' + x; } if (cur.trim()) lines.push(cur.trim()); return lines.slice(0, 4); };
let n = 0;
for (const dir of ['src/content/services', 'src/content/hubs']) {
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.json'))) {
    const slug = (dir.includes('hubs') ? 'hub-' : '') + f.replace('.json', '');
    const c = JSON.parse(readFileSync(`${dir}/${f}`, 'utf8'));
    c.sections.forEach((s, i) => {
      if (!s.image) return;
      const lines = wrap(s.image.label);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900"><defs><pattern id="p" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="20" height="40" fill="#e9e9e9"/></pattern></defs><rect width="1200" height="900" fill="#f1f1f1"/><rect width="1200" height="900" fill="url(#p)"/><rect x="300" y="330" width="600" height="240" rx="12" fill="#ffffff" opacity="0.92"/><text x="600" y="395" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#f44336" letter-spacing="3">PHOTO PLACEHOLDER</text>${lines.map((l, k) => `<text x="600" y="${445 + k * 34}" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" fill="#333">${esc(l)}</text>`).join('')}</svg>`;
      writeFileSync(`${out}/${slug}-${i + 1}.svg`, svg); n++;
    });
  }
}
console.log(`placeholders: ${n} written`);
