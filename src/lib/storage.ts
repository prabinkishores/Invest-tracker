import { Scheme, Entry, SchemeType } from '../types';

// Default schemes from user's original tracker data
const DEFAULT_SCHEMES: Scheme[] = [
  { id: '1', name: 'RD – Recurring Deposit', type: 'RD', sip: 2000, plat: 'Axis Bank' },
  { id: '2', name: 'Sukanya Samriddhi Yojana', type: 'SSY', sip: 2500, plat: 'Post Office' },
  { id: '3', name: 'Stocks', type: 'Stocks', sip: 0, plat: 'Zerodha/Groww' },
  { id: '4', name: 'Nippon MID Cap (₹5000)', type: 'MF', sip: 5000, plat: 'Groww' },
  { id: '5', name: 'Nifty Next 50 (₹2500)', type: 'MF', sip: 2500, plat: 'Groww' },
  { id: '6', name: 'Nippon Finance (₹2500)', type: 'MF', sip: 2500, plat: 'Groww' },
  { id: '7', name: 'Kulu Sirusepipu (Chit)', type: 'Chit', sip: 500, plat: 'Chit Fund' }
];

// Seed initial entries to showcase how the app works right out of the box
const DEFAULT_ENTRIES: Entry[] = [
  {
    id: 'e1',
    month: '2026-05',
    date: '2026-05-02',
    schemeId: '4',
    schemeName: 'Nippon MID Cap (₹5000)',
    schemeType: 'MF',
    amount: 5000,
    currentValue: 5120,
    returnPct: 2.4,
    mode: 'UPI',
    notes: 'SIP auto-debited via Groww',
    createdAt: new Date('2026-05-02T10:00:00Z').toISOString()
  },
  {
    id: 'e2',
    month: '2026-05',
    date: '2026-05-05',
    schemeId: '1',
    schemeName: 'RD – Recurring Deposit',
    schemeType: 'RD',
    amount: 2000,
    currentValue: 2000,
    mode: 'Auto-debit',
    notes: 'Axis Bank account transfer',
    createdAt: new Date('2026-05-05T09:15:00Z').toISOString()
  },
  {
    id: 'e3',
    month: '2026-06',
    date: '2026-06-02',
    schemeId: '4',
    schemeName: 'Nippon MID Cap (₹5000)',
    schemeType: 'MF',
    amount: 5000,
    currentValue: 5250,
    returnPct: 5.0,
    mode: 'UPI',
    notes: 'June installment',
    createdAt: new Date('2026-06-02T10:00:00Z').toISOString()
  },
  {
    id: 'e4',
    month: '2026-06',
    date: '2026-06-03',
    schemeId: '5',
    schemeName: 'Nifty Next 50 (₹2500)',
    schemeType: 'MF',
    amount: 2500,
    currentValue: 2535,
    returnPct: 1.4,
    mode: 'UPI',
    notes: 'June installment',
    createdAt: new Date('2026-06-03T11:20:00Z').toISOString()
  }
];

const SCHEMES_KEY = 'savings_tracker_schemes';
const ENTRIES_KEY = 'savings_tracker_entries';

export function getCachedSchemes(): Scheme[] {
  try {
    const data = localStorage.getItem(SCHEMES_KEY);
    if (!data) {
      localStorage.setItem(SCHEMES_KEY, JSON.stringify(DEFAULT_SCHEMES));
      return DEFAULT_SCHEMES;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Storage error', error);
    return DEFAULT_SCHEMES;
  }
}

export function saveCachedSchemes(schemes: Scheme[]): void {
  try {
    localStorage.setItem(SCHEMES_KEY, JSON.stringify(schemes));
  } catch (error) {
    console.error('Storage failed', error);
  }
}

export function getCachedEntries(): Entry[] {
  try {
    const data = localStorage.getItem(ENTRIES_KEY);
    if (!data) {
      localStorage.setItem(ENTRIES_KEY, JSON.stringify(DEFAULT_ENTRIES));
      return DEFAULT_ENTRIES;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Storage error', error);
    return DEFAULT_ENTRIES;
  }
}

export function saveCachedEntries(entries: Entry[]): void {
  try {
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('Storage failed', error);
  }
}
