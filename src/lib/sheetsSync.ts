import { Entry } from '../types';

export interface SheetConnectionInfo {
  id: string;
  url: string;
  createdNew: boolean;
}

/**
 * Searches for a spreadsheet named 'Saving Tracker Ledger' in Drive.
 * If not found, creates a new one with header values initialized.
 */
export async function autoConnectSheets(accessToken: string, fileName: string = 'Saving Tracker Ledger'): Promise<SheetConnectionInfo> {
  // 1. Search for existing spreadsheet in Drive
  const query = encodeURIComponent(`name='${fileName}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`);
  const listUrl = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`;
  
  const driveResponse = await fetch(listUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!driveResponse.ok) {
    const errText = await driveResponse.text();
    console.error('Drive listing failed:', errText);
    throw new Error(`Drive search failed: ${driveResponse.statusText}`);
  }

  const listData = await driveResponse.json();
  if (listData.files && listData.files.length > 0) {
    const sheetId = listData.files[0].id;
    return {
      id: sheetId,
      url: `https://docs.google.com/spreadsheets/d/${sheetId}/edit`,
      createdNew: false,
    };
  }

  // 2. If not found, create a new spreadsheet
  const createResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: fileName,
      },
    }),
  });

  if (!createResponse.ok) {
    const errText = await createResponse.text();
    console.error('Create spreadsheet failed:', errText);
    throw new Error(`Spreadsheet creation failed: ${createResponse.statusText}`);
  }

  const createData = await createResponse.json();
  const spreadsheetId = createData.spreadsheetId;

  // 3. Initialize header row in the newly created sheet
  const headers = [
    'Date Logged',
    'Financial Month',
    'Scheme Name',
    'Scheme Type',
    'Amount (₹)',
    'Current Value (₹)',
    'Return %',
    'Payment Mode',
    'Notes / Remarks',
    'Log ID',
    'Added At Timestamp'
  ];

  await writeToRange(accessToken, spreadsheetId, 'Sheet1!A1', [headers]);

  return {
    id: spreadsheetId,
    url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
    createdNew: true,
  };
}

/**
 * Appends a list of entries to the Google Spreadsheet.
 */
export async function appendEntriesToSheet(
  accessToken: string,
  spreadsheetId: string,
  entries: Entry[]
): Promise<boolean> {
  const rows = entries.map((e) => [
    e.date,
    e.month,
    e.schemeName,
    e.schemeType,
    e.amount,
    e.currentValue,
    e.returnPct !== undefined ? `${e.returnPct}%` : 'N/A',
    e.mode,
    e.notes || '',
    e.id,
    e.createdAt,
  ]);

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1:append?valueInputOption=USER_ENTERED`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range: 'Sheet1',
      majorDimension: 'ROWS',
      values: rows,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('Append rows to sheet failed:', errText);
    return false;
  }

  return true;
}

/**
 * Bulk updates or overwrites Google Spreadsheet with all current entries.
 * Sets headers first and then writes all entry rows.
 */
export async function syncAllToSheet(
  accessToken: string,
  spreadsheetId: string,
  entries: Entry[]
): Promise<number> {
  const headers = [
    'Date Logged',
    'Financial Month',
    'Scheme Name',
    'Scheme Type',
    'Amount (₹)',
    'Current Value (₹)',
    'Return %',
    'Payment Mode',
    'Notes / Remarks',
    'Log ID',
    'Added At Timestamp'
  ];

  const rows = [
    headers,
    ...entries.map((e) => [
      e.date,
      e.month,
      e.schemeName,
      e.schemeType,
      e.amount,
      e.currentValue,
      e.returnPct !== undefined ? `${e.returnPct}%` : 'N/A',
      e.mode,
      e.notes || '',
      e.id,
      e.createdAt,
    ])
  ];

  // We overwrite from Sheet1!A1
  const success = await writeToRange(accessToken, spreadsheetId, 'Sheet1!A1', rows);
  return success ? entries.length : 0;
}

/**
 * Helper to write values to a specific range (overwriting).
 */
export async function writeToRange(
  accessToken: string,
  spreadsheetId: string,
  range: string,
  values: any[][]
): Promise<boolean> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range,
      majorDimension: 'ROWS',
      values,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('Write range failed:', errText);
    return false;
  }

  return true;
}
