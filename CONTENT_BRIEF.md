# Content brief — core-30 service pages for elpasotrafficticket.com

Write each page as a JSON file at `src/content/services/<slug>.json` (hubs: `src/content/hubs/<hub-id>.json`), following the schema in `src/lib/services.ts` and matching the quality of the exemplar `src/content/services/speeding-ticket.json` (read it first, fully).

## The firm (use these facts, nothing invented)
- El Paso Traffic Ticket Firm – Attorney Robert Navar. Robert is a licensed Texas attorney, born and raised in El Paso, practicing 10+ years. First-person voice ("I", "my office") OR "we" — the old site mixes both; prefer "we/our office" in body copy and "Robert Navar" by name 2–4 times per page.
- Phone 915-503-1600 · 11860 Vista Del Sol Dr. #119, El Paso, TX 79936 · site https://elpasotrafficticket.com
- Flat fees per ticket: El Paso Municipal Court $59; Justice of the Peace, Horizon City, Socorro, San Elizario, Clint, Anthony (and Vinton) municipal courts $69. Extra citations from the same stop are discounted add-ons ($10–$30 each). Warrants: $35 first warrant + $20 each additional. Free consultation. Most ticket cases resolved with no court appearance by the client.
- Areas served: El Paso, Horizon City, Socorro, San Elizario, Clint, Anthony, Canutillo, Vinton, Fort Bliss.
- Key URLs to link: /fight-my-ticket/ (online hire + checkout), /traffic-tickets-and-warrants-lookup-form/ (free ticket & warrant lookup), /contact-us/, /schedule-an-appointment/, /faqs/, blog posts: /el-paso-warrants-lifted/, /how-to-fight-a-traffic-ticket-in-el-paso-texas/, /finding-a-traffic-ticket-dismissal/, /texas-points-system-explained/, /defensive-driving-in-el-paso-texas/, existing pages /occupational-license/, /effective-warrant-lawyer-el-paso/.

## Texas law you may state (only these; if unsure, describe generally without a citation)
- Traffic offenses are Class C misdemeanors, fine-only, max $200 for most Transportation Code violations (up to $500 for some; FMFR $175–$350 first offense). Court costs added.
- Deferred disposition: Code of Criminal Procedure art. 45.051 (90–180 day deferral, dismissal, no conviction). Driving safety course dismissal: art. 45.0511 (6-hour course; not available for 25+ mph over, CDL holders, school-zone in some courts, or if used in last 12 months).
- Points system still used for license suspension (2 points moving violation, 3 with crash). Driver Responsibility Program surcharges repealed Sept 2019.
- Failure to appear: Transportation Code 543.009 (separate Class C offense) and warrants; OMNI = Failure to Appear program under Transp. Code Ch. 706 — DPS denies license renewal until the court clears it.
- FMFR/no insurance: Transp. Code 601.191. No driver's license: 521.021. DWLI: 521.457 (Class C first offense; can be Class B with prior/crash). Texting while driving: 545.4251. Speeding: 545.351.
- Occupational license: Transp. Code Ch. 521 Subch. L (521.241 et seq.).
- Expunction: Code of Criminal Procedure Chapter 55A (recodified 2025, formerly Ch. 55); Class C deferred-disposition dismissals are eligible after completion. Nondisclosure: Government Code Ch. 411 Subch. E-1 (e.g., 411.072/411.0727 for deferred adjudication, 411.073 for certain convictions). Describe eligibility carefully with "may" and "generally".
- Wills: Estates Code Ch. 251–254 (two witnesses, self-proving affidavit). Durable POA: Estates Code Ch. 751–752 (statutory form). Medical POA & directive: Health & Safety Code Ch. 166. Small estate affidavit: Estates Code Ch. 205 (estate ≤ $75,000 excluding homestead/exempt property). Muniment of title: Ch. 257. Independent administration: Ch. 401.
- Never promise outcomes. Use "we work for", "in most cases", "typically". No "guaranteed". No comparisons naming other firms. Include once per page a sentence like "This page is general information, not legal advice about your case."

## Required structure per page (schema fields)
- title ≤ 60 chars with the keyword + "El Paso" (e.g. "No Insurance Ticket Lawyer El Paso TX | From $59"); metaDescription ≤ 155 chars.
- h1: keyword-rich, natural. intro: 1–2 sentences for the hero.
- summary: 3–5 "answer-first" bullets (HTML allowed, bold key phrases, ≥1 internal link). These get quoted by Google AI Overviews — make them complete, factual sentences.
- sections: 5–6 sections, each heading (H2, keyword-varied) + 2–3 paragraphs of real substance (local detail: which court, which road, what the officer/prosecutor does, what the client experiences, the money). Optional `list` of 3–5 bold-lead bullets in one section. Each section except the last gets an `image` with a `label` describing the photo David should shoot — be specific and local/staff-oriented ("Attorney Robert Navar in front of Horizon City Municipal Court, 14999 Darrington Rd", "Paralegal Dasia at the intake desk", "Loop 375 at Zaragoza Rd", "El Paso County Courthouse, 500 E. San Antonio Ave", "Family signing documents at our conference table"). Use the words "(staff photo)" or "(local photo)".
- faqs: 5–6 question/answer pairs, answers 2–4 sentences, HTML `<p>`.
- related: exactly 3 slugs from the service list below (not itself; mix same-hub and cross-hub).
- next: the assigned next-step slug (below) with a label like "Next step: …" and a one-sentence blurb that makes the reader want to continue.
- cta: "fight" for ticket/court pages, "lookup" for warrant pages, "consult" for license, expungement, wills pages.
- Internal links: at least 6 contextual `<a href="/...">` links inside paragraphs per page (to other services, hubs, blog posts, /fight-my-ticket/). Only link to URLs that exist (list below).
- Length: **1,000–1,500 words** total across intro+summary+sections+faqs (verify by counting). Do not pad; add useful local detail instead.
- Tone: plain English, confident, warm, no fluff, short paragraphs. Spanish-speaking clients welcome ("Se habla español") can be mentioned once.

## All page URLs (valid link targets) — slug → path → service name
HUBS: /traffic-tickets/ · /warrants/ · /courts/ · /drivers-license/ · /criminal-expungement/ · /wills-and-estate-planning/ · /personal-injury-lawyer-el-paso/
speeding-ticket → /traffic-tickets/speeding-ticket/
no-insurance-ticket → /traffic-tickets/no-insurance-ticket/
red-light-stop-sign-ticket → /traffic-tickets/red-light-stop-sign-ticket/
school-zone-speeding → /traffic-tickets/school-zone-speeding/
cdl-ticket → /traffic-tickets/cdl-ticket/
trucking-dot-violations → /traffic-tickets/trucking-dot-violations/
dps-state-trooper-ticket → /traffic-tickets/dps-state-trooper-ticket/
texting-cell-phone-ticket → /traffic-tickets/texting-cell-phone-ticket/
expired-registration-inspection → /traffic-tickets/expired-registration-inspection/
no-drivers-license-ticket → /traffic-tickets/no-drivers-license-ticket/
driving-while-license-invalid → /traffic-tickets/driving-while-license-invalid/
class-c-misdemeanors → /traffic-tickets/class-c-misdemeanors/
traffic-warrant-recall → /warrants/traffic-warrant-recall/
failure-to-appear → /warrants/failure-to-appear/
omni-hold-removal → /warrants/omni-hold-removal/
el-paso-municipal-court → /courts/el-paso-municipal-court/ ($59)
el-paso-county-justice-of-the-peace → /courts/el-paso-county-justice-of-the-peace/ ($69)
horizon-city-municipal-court → /courts/horizon-city-municipal-court/ ($69)
socorro-municipal-court → /courts/socorro-municipal-court/ ($69)
san-elizario-clint-anthony-vinton-municipal-courts → /courts/san-elizario-clint-anthony-vinton-municipal-courts/ ($69)
ticket-dismissal → /courts/ticket-dismissal/
deferred-adjudication-defensive-driving → /courts/deferred-adjudication-defensive-driving/
occupational-drivers-license → /drivers-license/occupational-drivers-license/
expunction → /criminal-expungement/expunction/
order-of-nondisclosure → /criminal-expungement/order-of-nondisclosure/
deferred-adjudication-record-cleanup → /criminal-expungement/deferred-adjudication-record-cleanup/
wills → /wills-and-estate-planning/wills/
power-of-attorney-medical-directives → /wills-and-estate-planning/power-of-attorney-medical-directives/
probate-small-estate-affidavit → /wills-and-estate-planning/probate-small-estate-affidavit/

## Journey chain ("next" for each page)
speeding-ticket→deferred-adjudication-defensive-driving→ticket-dismissal→el-paso-municipal-court→traffic-warrant-recall→failure-to-appear→omni-hold-removal→occupational-drivers-license→driving-while-license-invalid→no-drivers-license-ticket→no-insurance-ticket→expired-registration-inspection→red-light-stop-sign-ticket→school-zone-speeding→texting-cell-phone-ticket→dps-state-trooper-ticket→el-paso-county-justice-of-the-peace→horizon-city-municipal-court→socorro-municipal-court→san-elizario-clint-anthony-vinton-municipal-courts→cdl-ticket→trucking-dot-violations→class-c-misdemeanors→deferred-adjudication-record-cleanup→expunction→order-of-nondisclosure→wills→power-of-attorney-medical-directives→probate-small-estate-affidavit→(next slug: "traffic-tickets" = the hub, label "Back to where it started")
Hubs: traffic-tickets→speeding-ticket · warrants→traffic-warrant-recall · courts→el-paso-municipal-court · licenses→occupational-drivers-license · record-clearing→expunction · wills-and-estate-planning→wills

## Hub pages (src/content/hubs/<id>.json, ids: traffic-tickets, warrants, courts, licenses, record-clearing, wills-and-estate-planning)
Same schema. 800–1,100 words. Sections: what this group of problems has in common in El Paso, how the process works, pricing, how to choose the right page (link every child page by name in the body), FAQs. The template auto-renders the list of child pages as cards, so don't duplicate a bulleted list of links — weave them into prose.

## Validation
Run `node scripts/validate-content.mjs` after writing — it checks JSON validity, word counts, link targets, related/next slugs, and image labels. Fix anything it reports.
