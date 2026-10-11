// Loads the per-page content JSON for the core-30 service pages.
// Schema (src/content/services/<slug>.json):
// {
//   "title": "<SEO title, ≤60 chars>",
//   "metaDescription": "<≤155 chars>",
//   "h1": "...",
//   "intro": "<hero paragraph, 1–2 sentences>",
//   "summary": ["answer-first bullet", "...", "..."],          // 3–5 bullets, quoted by AI Overviews
//   "sections": [                                              // 4–7 sections, alternating image side automatically
//     { "heading": "...", "paragraphs": ["<p> html with <a href=\"/...\"> links</p>", "..."],
//       "list": [{ "b": "Bold lead:", "text": "rest" }],      // optional
//       "image": { "label": "Attorney Robert Navar outside El Paso Municipal Court", "alt": "..." } }
//   ],
//   "faqs": [{ "q": "...", "a": "<html>" }],                   // 4–6
//   "related": ["slug", "slug", "slug"],                       // 3–4 sibling/cross-hub services
//   "next": { "slug": "...", "label": "Next step: ...", "blurb": "one sentence" },
//   "cta": "fight" | "lookup" | "consult",
//   "summaryHeading": "Got a speeding ticket in El Paso? Here's what happens next",   // replaces the generic kicker
//   "published": "2026-10-06", "updated": "2026-10-11",
//   "sources": [{ "name": "El Paso Municipal Court", "url": "https://..." }]      // court pages: official sources cited on the page
// }
import { SERVICES, HUBS, type ServiceMeta, type Hub } from '../data/services';

export interface Section { heading: string; paragraphs: string[]; list?: { b: string; text: string }[]; image?: { label: string; alt: string } }
export interface ServiceContent {
  title: string; metaDescription: string; h1: string; intro: string; summary: string[];
  sections: Section[]; faqs: { q: string; a: string }[]; related: string[];
  next?: { slug: string; label: string; blurb: string }; cta?: 'fight' | 'lookup' | 'consult';
  summaryHeading?: string; published?: string; updated?: string; sources?: { name: string; url: string }[];
}

const files = import.meta.glob<{ default: ServiceContent }>('../content/services/*.json', { eager: true });
const hubFiles = import.meta.glob<{ default: ServiceContent }>('../content/hubs/*.json', { eager: true });

export function loadService(slug: string): ServiceContent | null {
  const f = files[`../content/services/${slug}.json`];
  return f ? f.default : null;
}
export function loadHub(id: string): ServiceContent | null {
  const f = hubFiles[`../content/hubs/${id}.json`];
  return f ? f.default : null;
}
export function resolve(slug: string): (ServiceMeta & { href: string }) | (Hub & { href: string; slug: string }) | null {
  const s = SERVICES.find((x) => x.slug === slug);
  if (s) return { ...s, href: s.path };
  const h = HUBS.find((x) => x.id === slug);
  if (h) return { ...h, href: h.path, slug: h.id };
  return null;
}
export const wordCount = (c: ServiceContent) => {
  const strip = (s: string) => s.replace(/<[^>]+>/g, ' ');
  const txt = [c.intro, ...c.summary, ...c.sections.flatMap((s) => [s.heading, ...s.paragraphs, ...(s.list || []).map((l) => l.b + ' ' + l.text)]), ...c.faqs.flatMap((f) => [f.q, f.a])].map(strip).join(' ');
  return txt.split(/\s+/).filter(Boolean).length;
};
