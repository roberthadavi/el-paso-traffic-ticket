import { readFileSync, readdirSync, existsSync } from 'node:fs';
const src = readFileSync('src/data/services.ts', 'utf8');
const slugs = [...src.matchAll(/S\('([\w-]+)', '([\w-]*)'/g)].map((m) => m[2]).filter(Boolean);
const hubIds = ['traffic-tickets', 'warrants', 'courts', 'licenses', 'record-clearing', 'wills-and-estate-planning', 'personal-injury'];
const hubPaths = { 'traffic-tickets': '/traffic-tickets/', warrants: '/warrants/', courts: '/courts/', licenses: '/drivers-license/', 'record-clearing': '/criminal-expungement/', 'wills-and-estate-planning': '/wills-and-estate-planning/', 'personal-injury': '/personal-injury-lawyer-el-paso/' };
const pathOf = {}; for (const m of src.matchAll(/S\('([\w-]+)', '([\w-]+)'/g)) pathOf[m[2]] = hubPaths[m[1]] + m[2] + '/';
const legacy = ['/', '/fight-my-ticket/', '/hire-us/', '/traffic-tickets-and-warrants-lookup-form/', '/contact-us/', '/schedule-an-appointment/', '/faqs/', '/blogs/', '/el-paso-warrants-lifted/', '/how-to-fight-a-traffic-ticket-in-el-paso-texas/', '/finding-a-traffic-ticket-dismissal/', '/texas-points-system-explained/', '/defensive-driving-in-el-paso-texas/', '/occupational-license/', '/effective-warrant-lawyer-el-paso/', '/personal-injury-lawyer-el-paso/', '/thank-you/'];
const valid = new Set([...legacy, ...Object.values(hubPaths), ...Object.values(pathOf)]);
const strip = (s) => String(s).replace(/<[^>]+>/g, ' ');
let problems = 0;
const check = (file, c, isHub) => {
  const errs = [];
  const text = [c.intro, ...(c.summary || []), ...(c.sections || []).flatMap((s) => [s.heading, ...(s.paragraphs || []), ...(s.list || []).map((l) => l.b + ' ' + l.text)]), ...(c.faqs || []).flatMap((f) => [f.q, f.a])].map(strip).join(' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  const [lo, hi] = isHub ? [750, 1300] : [950, 1600];
  if (words < lo || words > hi) errs.push(`word count ${words} (want ${lo}–${hi})`);
  if (!c.title || c.title.length > 65) errs.push(`title length ${c.title?.length}`);
  if (!c.metaDescription || c.metaDescription.length > 160 || c.metaDescription.length < 70) errs.push(`metaDescription length ${c.metaDescription?.length}`);
  if (!(c.summary?.length >= 3)) errs.push('summary needs ≥3 bullets');
  if (!(c.sections?.length >= (isHub ? 3 : 5))) errs.push(`sections ${c.sections?.length}`);
  if (!(c.faqs?.length >= 4)) errs.push(`faqs ${c.faqs?.length}`);
  if (!isHub && c.related?.length !== 3) errs.push(`related must be 3 (got ${c.related?.length})`);
  for (const r of c.related || []) if (!slugs.includes(r)) errs.push(`bad related slug ${r}`);
  if (c.next && !(slugs.includes(c.next.slug) || hubIds.includes(c.next.slug))) errs.push(`bad next slug ${c.next.slug}`);
  if (!isHub && !c.next) errs.push('missing next');
  const links = [...JSON.stringify(c).matchAll(/href=\\"([^\\"]+)\\"/g)].map((m) => m[1]);
  const internal = links.filter((l) => l.startsWith('/'));
  for (const l of internal) if (!valid.has(l)) errs.push(`bad link ${l}`);
  if (!isHub && internal.length < 6) errs.push(`only ${internal.length} internal links (want ≥6)`);
  (c.sections || []).forEach((s, i) => { if (s.image && (!s.image.label || s.image.label.length < 15 || !s.image.alt)) errs.push(`section ${i + 1} image label/alt weak`); });
  if ((c.sections || []).filter((s) => s.image).length < (isHub ? 2 : 4)) errs.push('need more section images');
  if (/stub|placeholder — written/i.test(text)) errs.push('stub text present');
  if (errs.length) { problems++; console.log(`✗ ${file}: ${errs.join('; ')}`); } else console.log(`✓ ${file} (${words} words, ${internal.length} links)`);
};
for (const f of readdirSync('src/content/services')) { try { check(f, JSON.parse(readFileSync('src/content/services/' + f, 'utf8')), false); } catch (e) { problems++; console.log(`✗ ${f}: ${e.message}`); } }
for (const f of readdirSync('src/content/hubs')) { try { check('hubs/' + f, JSON.parse(readFileSync('src/content/hubs/' + f, 'utf8')), true); } catch (e) { problems++; console.log(`✗ hubs/${f}: ${e.message}`); } }
const missing = slugs.filter((s) => !existsSync(`src/content/services/${s}.json`)); if (missing.length) { problems++; console.log('missing:', missing.join(', ')); }
console.log(problems ? `\n${problems} file(s) need fixes` : '\nAll content valid'); process.exit(problems ? 1 : 0);
