export type SchemeType = 'RD' | 'SSY' | 'Stocks' | 'MF' | 'Chit' | 'Custom';

export interface Scheme {
  id: string;
  name: string;
  type: SchemeType;
  sip: number;
  plat: string;
  userId?: string;
  createdAt?: string;
}

export interface Entry {
  id: string;
  month: string;         // YYYY-MM
  date: string;          // YYYY-MM-DD
  schemeId: string;
  schemeName: string;
  schemeType: SchemeType;
  amount: number;
  currentValue: number;
  returnPct?: number;
  mode: string;
  notes: string;
  userId?: string;
  createdAt: string;     // ISO timestamp
}
