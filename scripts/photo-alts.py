#!/usr/bin/env python3
"""Apply page-specific photo placement + alt text to content JSON. Idempotent. Run: python3 scripts/photo-alts.py"""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S, O = '/images/staff/', '/images/office/'
DESK = O + 'el-paso-traffic-ticket-firm-staff-reviewing-case.jpg'
SIGN = O + 'el-paso-traffic-ticket-firm-free-consultation-sign.jpg'
DIRECTORY = O + 'lobby-directory-el-paso-traffic-ticket-firm.jpg'
MISSION = O + 'the-mission-building-directory-vista-del-sol.jpg'
CUFFS = '/images/stock/traffic-warrant-arrest-handcuffs-el-paso.jpg'
ARREST = '/images/stock/police-arrest-traffic-stop-warrant-el-paso.jpg'
CUFFS_ALT = 'Handcuffs — an unpaid El Paso traffic ticket that turns into a warrant can lead to arrest at a traffic stop; El Paso Traffic Ticket Firm recalls warrants through the court'
ARREST_ALT = 'Police officers arresting a driver at a nighttime traffic stop — how an old El Paso traffic warrant usually surfaces'

# file -> {section index: (src, alt)}
PLAN = {
 'hubs/courts': {1: (MISSION, 'Tenant directory at The Mission, 11860 Vista Del Sol Dr., El Paso — the office of El Paso Traffic Ticket Firm, which handles tickets in every El Paso County court')},
 'hubs/licenses': {1: (S+'staff-two-couch.jpg', "El Paso Traffic Ticket Firm staff who help El Paso drivers with suspended licenses and occupational driver's license petitions")},
 'hubs/record-clearing': {2: (S+'staff-three-couch.jpg', 'The El Paso Traffic Ticket Firm team, which files expunction and nondisclosure petitions in El Paso County courts')},
 'hubs/traffic-tickets': {2: (S+'staff-two-entrance.jpg', 'El Paso Traffic Ticket Firm staff at the Vista Del Sol office, where flat-fee traffic ticket defense starts at $59 for El Paso Municipal Court')},
 'hubs/warrants': {0: (CUFFS, CUFFS_ALT), 1: (ARREST, ARREST_ALT), 2: (SIGN, 'El Paso Traffic Ticket Firm sign at the Vista Del Sol office: Traffic tickets? Warrants? Free consultation, 915-503-1600')},
 'hubs/wills-and-estate-planning': {2: (S+'staff-lobby-sign-portrait.jpg', 'Bilingual staff at El Paso Traffic Ticket Firm, where wills and estate documents are prepared in English or Spanish')},
 'services/cdl-ticket': {2: (S+'staff-two-lobby-sign.jpg', 'El Paso Traffic Ticket Firm staff at the lobby sign; the firm defends CDL and commercial driver tickets in El Paso County courts'), 5: (DESK, 'El Paso Traffic Ticket Firm staff reviewing a CDL ticket case at the Vista Del Sol office in El Paso, Texas')},
 'services/class-c-misdemeanors': {0: (ARREST, 'Police arrest at a traffic stop — an unresolved Class C misdemeanor in El Paso can turn into a warrant'), 3: (S+'staff-two-lobby-standing.jpg', 'El Paso Traffic Ticket Firm staff in the office lobby; the firm defends Class C misdemeanor and city ordinance citations in El Paso')},
 'services/deferred-adjudication-defensive-driving': {1: (S+'staff-two-couch.jpg', 'El Paso Traffic Ticket Firm staff who walk clients through deferred disposition and the driving safety course option'), 3: (S+'staff-three-couch.jpg', 'The El Paso Traffic Ticket Firm team in the reception area of the Vista Del Sol office, El Paso, Texas')},
 'services/deferred-adjudication-record-cleanup': {2: (S+'staff-two-entrance.jpg', 'El Paso Traffic Ticket Firm staff at the office entrance; the firm clears records after deferred adjudication in El Paso County')},
 'services/dps-state-trooper-ticket': {3: (DESK, 'El Paso Traffic Ticket Firm staff reviewing a DPS trooper ticket filed in an El Paso County Justice of the Peace court')},
 'services/driving-while-license-invalid': {3: (ARREST, 'Police arrest at a traffic stop — a repeat or enhanced DWLI charge in Texas can be a Class B misdemeanor with jail exposure'), 1: (S+'staff-lobby-sign-portrait.jpg', 'El Paso Traffic Ticket Firm staff member at the lobby sign; the firm defends driving while license invalid charges in El Paso')},
 'services/el-paso-county-justice-of-the-peace': {4: (S+'staff-one-lobby-standing.jpg', 'El Paso Traffic Ticket Firm staff member in the office lobby; JP court tickets in El Paso County are handled for a $69 flat fee')},
 'services/el-paso-municipal-court': {3: (S+'staff-three-entrance-portrait.jpg', 'The El Paso Traffic Ticket Firm team at the Vista Del Sol office; the firm appears in El Paso Municipal Court for a $59 flat fee')},
 'services/expunction': {2: (S+'staff-two-lobby-sign.jpg', 'El Paso Traffic Ticket Firm staff at the lobby sign; the firm files expunction petitions in El Paso County District Court')},
 'services/failure-to-appear': {1: (CUFFS, CUFFS_ALT), 3: (DESK, 'El Paso Traffic Ticket Firm staff reviewing a failure to appear case at the Vista Del Sol office in El Paso, Texas')},
 'services/horizon-city-municipal-court': {3: (S+'staff-two-lobby-standing.jpg', 'El Paso Traffic Ticket Firm staff in the office lobby; Horizon City Municipal Court tickets are handled for a $69 flat fee')},
 'services/no-drivers-license-ticket': {3: (S+'staff-two-couch.jpg', "El Paso Traffic Ticket Firm staff who help El Paso families with teen driver and no driver's license tickets")},
 'services/no-insurance-ticket': {1: (DESK, 'El Paso Traffic Ticket Firm staff reviewing proof of insurance for a no insurance (FMFR) ticket in El Paso, Texas')},
 'services/occupational-drivers-license': {2: (S+'staff-two-entrance.jpg', "El Paso Traffic Ticket Firm staff at the office entrance; the firm prepares occupational driver's license petitions in El Paso County"), 3: (S+'staff-three-entrance.jpg', 'The El Paso Traffic Ticket Firm team at the Vista Del Sol office entrance, El Paso, Texas')},
 'services/omni-hold-removal': {1: (DESK, 'El Paso Traffic Ticket Firm staff checking an OMNI hold across El Paso County courts at the Vista Del Sol office')},
 'services/order-of-nondisclosure': {2: (S+'staff-one-lobby-standing.jpg', 'El Paso Traffic Ticket Firm staff member in the office lobby; the firm files orders of nondisclosure in El Paso County'), 3: (S+'staff-three-entrance-portrait.jpg', 'The El Paso Traffic Ticket Firm team at the Vista Del Sol office entrance, El Paso, Texas')},
 'services/probate-small-estate-affidavit': {1: (S+'staff-two-lobby-sign.jpg', 'El Paso Traffic Ticket Firm staff at the lobby sign; the firm prepares small estate affidavits for El Paso County families'), 3: (S+'staff-one-lobby-sign.jpg', 'El Paso Traffic Ticket Firm staff member at the lobby sign, 11860 Vista Del Sol Dr., El Paso, Texas')},
 'services/red-light-stop-sign-ticket': {4: (S+'staff-two-lobby-standing.jpg', 'El Paso Traffic Ticket Firm staff in the office lobby; the firm defends red light and stop sign tickets in every El Paso County court')},
 'services/school-zone-speeding': {4: (S+'staff-two-couch.jpg', 'El Paso Traffic Ticket Firm staff who defend school zone speeding tickets in El Paso Municipal and JP courts')},
 'services/socorro-municipal-court': {3: (S+'staff-three-couch.jpg', 'The El Paso Traffic Ticket Firm team; Socorro Municipal Court tickets are handled for a $69 flat fee')},
 'services/speeding-ticket': {3: (DESK, 'El Paso Traffic Ticket Firm staff reviewing a speeding ticket case at the Vista Del Sol office in El Paso, Texas')},
 'services/texting-cell-phone-ticket': {2: (S+'staff-three-entrance.jpg', 'The El Paso Traffic Ticket Firm team at the office entrance; the firm defends texting and hands-free tickets in El Paso'), 4: (S+'staff-lobby-sign-portrait.jpg', 'El Paso Traffic Ticket Firm staff member at the lobby sign, 11860 Vista Del Sol Dr., El Paso, Texas')},
 'services/ticket-dismissal': {3: (DESK, 'El Paso Traffic Ticket Firm staff reviewing a citation for dismissal grounds at the Vista Del Sol office in El Paso')},
 'services/traffic-warrant-recall': {0: (CUFFS, CUFFS_ALT), 3: (ARREST, ARREST_ALT), 1: (DESK, 'El Paso Traffic Ticket Firm staff reviewing a traffic warrant recall case at the Vista Del Sol office in El Paso, Texas')},
 'services/trucking-dot-violations': {3: (S+'staff-two-lobby-sign.jpg', 'El Paso Traffic Ticket Firm staff at the lobby sign; the firm defends trucking and DOT citations in El Paso County JP courts')},
 'services/wills': {0: (S+'staff-one-lobby-sign.jpg', 'El Paso Traffic Ticket Firm staff member at the lobby sign; wills are signed and notarized at the Vista Del Sol office in El Paso'), 3: (S+'staff-two-lobby-standing.jpg', 'El Paso Traffic Ticket Firm staff in the office lobby, 11860 Vista Del Sol Dr., El Paso, Texas')},
}

for key, slots in PLAN.items():
    p = os.path.join(ROOT, 'src/content', key + '.json')
    d = json.load(open(p))
    for i, (src, alt) in slots.items():
        sec = d['sections'][i]
        assert 'image' in sec, (key, i)
        sec['image']['src'] = src; sec['image']['alt'] = alt
    json.dump(d, open(p, 'w'), indent=2, ensure_ascii=False); open(p, 'a').write('\n')
    print('ok', key)
