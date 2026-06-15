import { Scheme, Entry, SchemeType } from '../types';

// Default schemes from user's original tracker data
const DEFAULT_SCHEMES: Scheme[] = [
  { id: '1', name: 'Recurring Deposit', type: 'RD', sip: 2000, plat: 'Axis Bank' },
  { id: '2', name: 'Sukanya Samriddhi Yojana', type: 'SSY', sip: 2500, plat: 'Post Office' },
  { id: '3', name: 'Stocks', type: 'Stocks', sip: 0, plat: 'Zerodha/Groww' },
  { id: '4', name: 'Nippon MID Cap', type: 'MF', sip: 5000, plat: 'Groww' },
  { id: '5', name: 'Nifty Next 50', type: 'MF', sip: 2500, plat: 'Groww' },
  { id: '6', name: 'Nippon Finance', type: 'MF', sip: 2500, plat: 'Groww' },
  { id: '7', name: 'Kulu Sirusepipu', type: 'Chit', sip: 500, plat: 'Chit Fund' }
];

// Seed initial entries to showcase how the app works right out of the box
const DEFAULT_ENTRIES: Entry[] = [];

const SCHEMES_KEY = 'savings_tracker_schemes';
const ENTRIES_KEY = 'savings_tracker_entries';

export function getCachedSchemes(): Scheme[] {
  try {
    const data = localStorage.getItem(SCHEMES_KEY);
    if (!data) {
      localStorage.setItem(SCHEMES_KEY, JSON.stringify(DEFAULT_SCHEMES));
      return DEFAULT_SCHEMES;
    }
    const parsed = JSON.parse(data) as Scheme[];
    // Auto-migrate original cached entry scheme names to match the new pristine rule
    const hasOldDefaults = parsed.some(s => s.name.includes('(₹') || s.name.startsWith('RD – '));
    if (hasOldDefaults) {
      const migrated = parsed.map(s => {
        let name = s.name;
        name = name.replace(/\s*\(₹\s*\d+\)/g, '');
        name = name.replace(/^RD\s*[–-]\s*/g, '');
        return { ...s, name: name.trim() };
      });
      localStorage.setItem(SCHEMES_KEY, JSON.stringify(migrated));
      return migrated;
    }
    return parsed;
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
    const parsed = JSON.parse(data) as Entry[];
    // Ensure any pre-existing default dummy log entries (e1, e2, e3, e4) are removed
    const filtered = parsed.filter(e => !['e1', 'e2', 'e3', 'e4'].includes(e.id));
    if (parsed.length !== filtered.length) {
      localStorage.setItem(ENTRIES_KEY, JSON.stringify(filtered));
      return filtered;
    }
    return parsed;
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
