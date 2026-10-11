// Pricing carried over from the live "Fight My Ticket" checkout form (WP-FSQM form #6), Oct 2026.
export type CourtId = 'el-paso-municipal' | 'jp' | 'horizon-city' | 'socorro' | 'anthony' | 'san-elizario' | 'clint';

export interface Court {
  id: CourtId;
  name: string;
  first: number;      // price for the first ticket
  additional: number; // price for the 2nd, 3rd… ticket
  extraFirst: number; // per extra citation on the first ticket
  extraAdditional: number; // per extra citation on 2nd+ tickets
}

export const COURTS: Court[] = [
  { id: 'el-paso-municipal', name: 'El Paso Municipal',      first: 59, additional: 49, extraFirst: 20, extraAdditional: 10 },
  { id: 'jp',                name: 'Justice of the Peace',   first: 69, additional: 59, extraFirst: 20, extraAdditional: 20 },
  { id: 'horizon-city',      name: 'Horizon City Municipal', first: 69, additional: 59, extraFirst: 10, extraAdditional: 20 },
  { id: 'socorro',           name: 'Socorro Municipal',      first: 69, additional: 69, extraFirst: 20, extraAdditional: 20 },
  { id: 'anthony',           name: 'Anthony Municipal',      first: 69, additional: 59, extraFirst: 10, extraAdditional: 20 },
  { id: 'san-elizario',      name: 'San Elizario Municipal', first: 69, additional: 59, extraFirst: 30, extraAdditional: 20 },
  { id: 'clint',             name: 'Clint Municipal',        first: 69, additional: 59, extraFirst: 10, extraAdditional: 20 },
];

export const WARRANT_FIRST = 35;
export const WARRANT_ADDITIONAL = 20;
export const MAX_TICKETS = 5;
export const MAX_EXTRA_CITATIONS = 10;
export const MAX_WARRANTS = 10;
