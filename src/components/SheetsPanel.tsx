import React from 'react';
import { FileSpreadsheet, CheckCircle2, AlertCircle, RefreshCw, LogIn, ExternalLink, Moon } from 'lucide-react';

interface SheetsPanelProps {
  currentUser: any;
  googleAccessToken: string | null;
  sheetSyncEnabled: boolean;
  spreadsheetId: string | null;
  spreadsheetUrl: string | null;
  isSyncingToSheet: boolean;
  onConnectSheets: () => void;
  onDisconnectSheets: () => void;
  onBulkSync: () => void;
  totalEntriesCount: number;
}

export default function SheetsPanel({
  currentUser,
  googleAccessToken,
  sheetSyncEnabled,
  spreadsheetId,
  spreadsheetUrl,
  isSyncingToSheet,
  onConnectSheets,
  onDisconnectSheets,
  onBulkSync,
  totalEntriesCount,
}: SheetsPanelProps) {
  if (!currentUser) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg relative overflow-hidden" id="sheets-panel-unauth">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" />
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold tracking-tight text-white">Google Sheets Sync</h2>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed mb-4">
          Connect your Google account and back up your transaction ledger entries directly to Google Sheets in real-time.
        </p>
        <button
          onClick={onConnectSheets}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer select-none"
          id="sheets-btn-auth-trigger"
        >
          <LogIn className="w-4 h-4" />
          <span>Connect Google Account</span>
        </button>
      </div>
    );
  }

  const isAccessAuthorized = !!googleAccessToken;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg relative overflow-hidden" id="sheets-panel-auth">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${sheetSyncEnabled && isAccessAuthorized ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight text-white">Google Sheets Sync</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${sheetSyncEnabled && isAccessAuthorized ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-500'}`} />
              <span className="text-[10px] font-mono text-zinc-400">
                {sheetSyncEnabled && isAccessAuthorized ? 'Real-time Linked' : 'Sync Paused'}
              </span>
            </div>
          </div>
        </div>

        {sheetSyncEnabled && (
          <button
            onClick={onDisconnectSheets}
            className="text-[10px] font-bold text-red-400 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
            id="sheets-btn-pause"
          >
            Disable Sync
          </button>
        )}
      </div>

      {/* Main Status */}
      <div className="space-y-3.5 mb-4">
        {sheetSyncEnabled && spreadsheetId ? (
          <div className="bg-zinc-950/50 border border-zinc-800/80 rounded-xl p-3" id="sheets-connection-banner">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <span className="block text-[11px] font-bold text-zinc-300">Connected Spreadsheet</span>
                <span className="block text-[11px] font-mono text-zinc-400 truncate mt-0.5">Saving Tracker Ledger</span>
                {spreadsheetUrl && (
                  <a
                    href={spreadsheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                    id="sheets-spreadsheet-link"
                  >
                    <span>Open in Google Sheets</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-zinc-950/50 border border-zinc-800/80 rounded-xl p-3" id="sheets-setup-banner">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="block text-[11px] font-bold text-zinc-300">Setup Required</span>
                <p className="text-[10px] text-zinc-400 leading-relaxed mt-0.5">
                  Authorize Google Drive & Google Sheets to synchronize your logs automatic backups.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Auth status refresh warning */}
        {!isAccessAuthorized && (
          <div className="bg-zinc-950/80 border border-amber-500/15 rounded-xl p-3" id="sheets-auth-mismatch-banner">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="block text-[11px] font-bold text-amber-400">Authorization Refresh Required</span>
                <p className="text-[10px] text-zinc-400 leading-relaxed mt-1">
                  Google API security credentials must be verified periodically. Click Connect/Authorize below.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action triggers */}
      <div className="grid grid-cols-2 gap-2" id="sheets-control-buttons">
        <button
          onClick={onConnectSheets}
          disabled={isSyncingToSheet}
          className="flex items-center justify-center gap-1.5 py-2 px-3 border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-xl text-xs font-semibold hover:border-zinc-600 active:scale-95 transition-all select-none cursor-pointer disabled:opacity-50 min-h-[38px]"
          id="sheets-btn-refresh-connection"
          title="Authenticate/Refresh google token"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncingToSheet && 'animate-spin'}`} />
          <span>{isAccessAuthorized ? 'Refresh Auth' : 'Authorize API'}</span>
        </button>

        <button
          onClick={onBulkSync}
          disabled={isSyncingToSheet || totalEntriesCount === 0}
          className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-500 text-zinc-950 hover:bg-emerald-400 rounded-xl text-xs font-bold active:scale-95 transition-all select-none cursor-pointer disabled:opacity-40 min-h-[38px]"
          id="sheets-btn-sync-all"
          title="Backup all existing data sets to your spreadsheet now"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Sync All Logs ({totalEntriesCount})</span>
        </button>
      </div>
    </div>
  );
}
