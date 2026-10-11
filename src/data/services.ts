// The "core 30" services — one page each, mirrored on the Google Business Profile services list.
// Content for each page lives in src/content/services/<slug>.json (see src/lib/services.ts for the schema).

export type HubId = 'traffic-tickets' | 'warrants' | 'courts' | 'licenses' | 'record-clearing' | 'wills-and-estate-planning' | 'personal-injury';

export interface Hub { id: HubId; name: string; path: string; short: string; blurb: string; cta: 'fight' | 'lookup' | 'consult'; icon: string }

export const HUBS: Hub[] = [
  { id: 'traffic-tickets', name: 'Traffic Ticket Defense', path: '/traffic-tickets/', short: 'Traffic Tickets', blurb: 'Every kind of citation we fight in El Paso County — speeding, no insurance, red light, CDL and more.', cta: 'fight', icon: 'fa-car' },
  { id: 'warrants', name: 'Traffic Warrants', path: '/warrants/', short: 'Warrants', blurb: 'Warrant recall, failure to appear and OMNI holds — handled fast, usually without you going to court.', cta: 'lookup', icon: 'fa-exclamation-triangle' },
  { id: 'courts', name: 'El Paso County Courts', path: '/courts/', short: 'Courts', blurb: 'How each local court handles tickets, where it is, and our flat fee to represent you there.', cta: 'fight', icon: 'fa-landmark' },
  { id: 'licenses', name: "Driver's License Help", path: '/drivers-license/', short: 'License', blurb: 'Occupational licenses and getting back on the road legally.', cta: 'consult', icon: 'fa-id-card' },
  { id: 'record-clearing', name: 'Criminal Record Clearing', path: '/criminal-expungement/', short: 'Expungement', blurb: 'Expunction, orders of nondisclosure and cleaning up old deferred cases.', cta: 'consult', icon: 'fa-eraser' },
  { id: 'wills-and-estate-planning', name: 'Wills & Estate Planning', path: '/wills-and-estate-planning/', short: 'Wills & Estate', blurb: 'Wills, powers of attorney, medical directives and probate for El Paso families.', cta: 'consult', icon: 'fa-file-signature' },
  { id: 'personal-injury', name: 'Personal Injury', path: '/personal-injury-lawyer-el-paso/', short: 'Personal Injury', blurb: 'Car accidents and injury claims in El Paso.', cta: 'consult', icon: 'fa-car-crash' },
];

export interface ServiceMeta { slug: string; hub: HubId; name: string; gbp: string; price?: string; path: string; icon: string; blurb: string }

const META: Record<string, [string, string]> = {
  'speeding-ticket': ['fa-tachometer-alt', "Speeding citations in every El Paso County court — dismissal or deferred, nothing on your record."],
  'no-insurance-ticket': ['fa-car-crash', "FMFR tickets dismissed with proof of coverage or negotiated down before they hit your insurance."],
  'red-light-stop-sign-ticket': ['fa-traffic-light', "Officer-issued red light and rolling-stop tickets — vantage point and signal timing matter."],
  'school-zone-speeding': ['fa-school', "Higher fines and fewer deferrals — exactly where a lawyer changes the outcome."],
  'cdl-ticket': ['fa-truck', "No masking for CDL holders, so dismissal or a non-moving reduction is the only safe path."],
  'trucking-dot-violations': ['fa-truck-moving', "Overweight, logbook, equipment and out-of-service citations at the scales and on I-10."],
  'dps-state-trooper-ticket': ['fa-shield-alt', "Trooper tickets go to JP court, not Municipal — different docket, different strategy."],
  'texting-cell-phone-ticket': ['fa-mobile-alt', "Texting and hands-free ordinance tickets, and the defenses that actually work."],
  'expired-registration-inspection': ['fa-clipboard-check', "Paperwork tickets usually dismissed once you fix the sticker — we make sure the court does."],
  'no-drivers-license-ticket': ['fa-id-card', "No DL vs. failure to display, foreign licenses, and keeping a conviction from blocking your license."],
  'driving-while-license-invalid': ['fa-ban', "DWLI can climb to Class B — fix the license first, then the ticket."],
  'class-c-misdemeanors': ['fa-gavel', "Public intoxication, MIP, open container, animal control and city code citations."],
  'traffic-warrant-recall': ['fa-unlock-alt', "Most El Paso traffic warrants recalled within 24–48 hours — no jail, no bondsman."],
  'failure-to-appear': ['fa-calendar-times', "The separate FTA charge stacked on your ticket, resolved together with the original case."],
  'omni-hold-removal': ['fa-id-badge', "Clear every court hold so DPS will renew your driver's license again."],
  'el-paso-municipal-court': ['fa-landmark', "Downtown at 810 E. Overland — EPPD tickets. Our lowest flat fee."],
  'el-paso-county-justice-of-the-peace': ['fa-balance-scale', "Sheriff, DPS and constable tickets across the seven JP precincts."],
  'horizon-city-municipal-court': ['fa-map-marker-alt', "Horizon City PD tickets on Darrington, Eastlake and Horizon Blvd."],
  'socorro-municipal-court': ['fa-map-marker-alt', "Socorro PD enforcement on North Loop, Alameda and Socorro Rd."],
  'san-elizario-clint-anthony-vinton-municipal-courts': ['fa-map-marked-alt', "Four small Lower and Upper Valley courts with limited docket days."],
  'ticket-dismissal': ['fa-check-circle', "The grounds that actually get tickets thrown out — and what a dismissal means for DPS."],
  'deferred-adjudication-defensive-driving': ['fa-user-graduate', "Keep it off your record: deferred disposition vs. the driving safety course."],
  'occupational-drivers-license': ['fa-car', "Suspended? Get a court-ordered license to drive to work, school and errands."],
  'expunction': ['fa-eraser', "Destroy the arrest and charge records — dismissals, acquittals and completed Class C deferrals."],
  'order-of-nondisclosure': ['fa-user-secret', "Seal a record from background checks when expunction is not available."],
  'deferred-adjudication-record-cleanup': ['fa-broom', "Finished your deferral? The record is still there until we clean it up."],
  'wills': ['fa-file-signature', "A Texas will with a self-proving affidavit, guardian designations and a plan for your family."],
  'power-of-attorney-medical-directives': ['fa-hand-holding-heart', "Durable POA, medical POA, living will and HIPAA release — the documents every adult needs."],
  'probate-small-estate-affidavit': ['fa-home', "Small estate affidavits, muniment of title and independent administration in El Paso County."],
  '': ['fa-car-crash', "Car accident and injury claims in El Paso."],
};

// path = hub path + slug (hub pages themselves are built from the hub record)
const S = (hub: HubId, slug: string, name: string, gbp: string, price?: string): ServiceMeta => ({ slug, hub, name, gbp, price, path: `${HUBS.find((h) => h.id === hub)!.path}${slug}/`, icon: META[slug]?.[0] || 'fa-gavel', blurb: META[slug]?.[1] || '' });

export const SERVICES: ServiceMeta[] = [
  // Ticket defense (12)
  S('traffic-tickets', 'speeding-ticket', 'Speeding Ticket Defense', 'Speeding ticket defense'),
  S('traffic-tickets', 'no-insurance-ticket', 'No Insurance Ticket (FMFR)', 'No insurance / failure to maintain financial responsibility'),
  S('traffic-tickets', 'red-light-stop-sign-ticket', 'Red Light & Stop Sign Tickets', 'Red light & stop sign tickets'),
  S('traffic-tickets', 'school-zone-speeding', 'School Zone Speeding Tickets', 'School zone speeding'),
  S('traffic-tickets', 'cdl-ticket', 'CDL & Commercial Driver Tickets', 'CDL & commercial driver ticket defense'),
  S('traffic-tickets', 'trucking-dot-violations', 'Trucking & DOT Violations', 'Trucking & DOT violations'),
  S('traffic-tickets', 'dps-state-trooper-ticket', 'DPS / State Trooper Tickets', 'DPS / state trooper tickets'),
  S('traffic-tickets', 'texting-cell-phone-ticket', 'Texting & Cell Phone Tickets', 'Texting & cell phone tickets'),
  S('traffic-tickets', 'expired-registration-inspection', 'Expired Registration & Inspection', 'Expired registration & inspection'),
  S('traffic-tickets', 'no-drivers-license-ticket', "No Driver's License Ticket", "No driver's license"),
  S('traffic-tickets', 'driving-while-license-invalid', 'Driving While License Invalid (DWLI)', 'Driving while license invalid (DWLI)'),
  S('traffic-tickets', 'class-c-misdemeanors', 'Class C Misdemeanors & City Ordinance Citations', 'City ordinance, animal control & Class C misdemeanor defense'),
  // Warrants (3)
  S('warrants', 'traffic-warrant-recall', 'Traffic Warrant Recall & Lift', 'Traffic warrant recall / lift'),
  S('warrants', 'failure-to-appear', 'Failure to Appear Defense', 'Failure to appear defense'),
  S('warrants', 'omni-hold-removal', 'OMNI Hold Removal', 'OMNI hold removal (license renewal block)'),
  // Courts & outcomes (7)
  S('courts', 'el-paso-municipal-court', 'El Paso Municipal Court', 'El Paso Municipal Court representation', '$59'),
  S('courts', 'el-paso-county-justice-of-the-peace', 'El Paso County Justice of the Peace Courts', 'El Paso County Justice of the Peace representation', '$69'),
  S('courts', 'horizon-city-municipal-court', 'Horizon City Municipal Court', 'Horizon City Municipal Court representation', '$69'),
  S('courts', 'socorro-municipal-court', 'Socorro Municipal Court', 'Socorro Municipal Court representation', '$69'),
  S('courts', 'san-elizario-clint-anthony-vinton-municipal-courts', 'San Elizario, Clint, Anthony & Vinton Municipal Courts', 'San Elizario / Clint / Anthony / Vinton municipal court representation', '$69'),
  S('courts', 'ticket-dismissal', 'Traffic Ticket Dismissal', 'Ticket dismissal'),
  S('courts', 'deferred-adjudication-defensive-driving', 'Deferred Adjudication & Defensive Driving', 'Deferred adjudication & defensive driving (keep it off your record)'),
  // Licenses (1)
  S('licenses', 'occupational-drivers-license', "Occupational Driver's License (ODL)", "Occupational driver's license"),
  // Record clearing (3)
  S('record-clearing', 'expunction', 'Criminal Record Expungement (Expunction)', 'Criminal record expungement'),
  S('record-clearing', 'order-of-nondisclosure', 'Order of Nondisclosure (Record Sealing)', 'Order of nondisclosure / record sealing'),
  S('record-clearing', 'deferred-adjudication-record-cleanup', 'Deferred Adjudication Record Cleanup', 'Deferred adjudication record cleanup'),
  // Wills & estate (3)
  S('wills-and-estate-planning', 'wills', 'Wills & Estate Planning', 'Wills & estate planning'),
  S('wills-and-estate-planning', 'power-of-attorney-medical-directives', 'Power of Attorney & Medical Directives', 'Power of attorney & medical directives'),
  S('wills-and-estate-planning', 'probate-small-estate-affidavit', 'Probate & Small Estate Affidavits', 'Probate & small-estate affidavits'),
  // Personal injury (1) — the existing page, kept
  S('personal-injury', '', 'Personal Injury Lawyer El Paso', 'Personal injury'),
];

export const byPath = (p: string) => SERVICES.find((s) => s.path === p);
export const bySlug = (slug: string) => SERVICES.find((s) => s.slug === slug);
export const hubOf = (id: HubId) => HUBS.find((h) => h.id === id)!;
export const inHub = (id: HubId) => SERVICES.filter((s) => s.hub === id && s.slug);
