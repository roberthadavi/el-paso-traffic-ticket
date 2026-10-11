import { readFileSync, readdirSync, existsSync } from 'node:fs';
const src = readFileSync('src/data/services.ts', 'utf8');
const slugs = [...src.matchAll(/S\('([\w-]+)', '([\w-]*)'/g)].map((m) => m[2]).filter(Boolean);
const hubIds = ['traffic-tickets', 'warrants', 'courts', 'licenses', 'record-clearing', 'wills-and-estate-planning', 'personal-injury'];
const hubPaths = { 'traffic-tickets': '/traffic-tickets/', warrants: '/warrants/', courts: '/courts/', licenses: '/drivers-license/', 'record-clearing': '/criminal-expungement/', 'wills-and-estate-planning': '/wills-and-estate-planning/', 'personal-injury': '/personal-injury-lawyer-el-paso/' };
const pathOf = {}; for (const m of src.matchAll(/S\('([\w-]+)', '([\w-]+)'/g)) pathOf[m[2]] = hubPaths[m[1]] + m[2] + '/';
const legacy = ['/', '/fight-my-ticket/', '/traffic-tickets-and-warrants-lookup-form/', '/contact-us/', '/schedule-an-appointment/', '/faqs/', '/blogs/', '/how-to-fight-a-traffic-ticket-in-el-paso-texas/', '/texas-points-system-explained/', '/personal-injury-lawyer-el-paso/', '/attorney/robert-navar/', '/privacy-policy/', '/terms-of-use/', '/disclaimer/', '/thank-you/'];
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
  const all = JSON.stringify(c);
  const banned = [/\bpoints? system\b/i, /\b(two|three|2|3) points?\b/i, /driver responsibility/i, /surcharge/i, /\balways\b/i, /will be dismissed/i, /we can get it dismissed/i, /guarantee/i, /nearly every case/i, /\bmost cases\b/i, /dismissal rate/i, /24.48 hours/i, /\d+\s?%/, /\bonly focus\b/i, /navigate the legal/i, /peace of mind/i, /how stressful/i, /experienced representation/i, /dedicated legal team/i, /protect your rights/i, /best possible outcome/i, /every case is unique/i, /face this alone/i, /fight for you\b/i, /aggressive representation/i, /personal touch/i, /path to recovery/i, /click here/i, /\[(Firm|Attorney) Name\]/i, /lorem ipsum/i, /example\.com/i];
  for (const b of banned) { const m = all.match(b); if (m) { if (b.source.includes('driver responsibility') || b.source.includes('surcharge') || b.source.includes('points')) { const ctx = all.slice(Math.max(0, m.index - 80), m.index + 80); if (/repeal|no longer|former|abolish/i.test(ctx)) continue; } errs.push(`banned phrase "${m[0]}"`); } }
  if (!c.summaryHeading) errs.push('missing summaryHeading');
  if (c.summaryHeading && /short answer/i.test(c.summaryHeading)) errs.push('summaryHeading is the generic one');
  if (!c.published || !c.updated) errs.push('missing published/updated');
  if (errs.length) { problems++; console.log(`✗ ${file}: ${errs.join('; ')}`); } else console.log(`✓ ${file} (${words} words, ${internal.length} links)`);
};
for (const f of readdirSync('src/content/services')) { try { check(f, JSON.parse(readFileSync('src/content/services/' + f, 'utf8')), false); } catch (e) { problems++; console.log(`✗ ${f}: ${e.message}`); } }
for (const f of readdirSync('src/content/hubs')) { try { check('hubs/' + f, JSON.parse(readFileSync('src/content/hubs/' + f, 'utf8')), true); } catch (e) { problems++; console.log(`✗ hubs/${f}: ${e.message}`); } }
const missing = slugs.filter((s) => !existsSync(`src/content/services/${s}.json`)); if (missing.length) { problems++; console.log('missing:', missing.join(', ')); }
console.log(problems ? `\n${problems} file(s) need fixes` : '\nAll content valid'); process.exit(problems ? 1 : 0);
