import React, { useState } from 'react';
import { Entry, Scheme, SchemeType } from '../types';
import { FileSpreadsheet, RefreshCw, Trash2, Filter, Info, Download, AlertCircle } from 'lucide-react';

interface LogsPanelProps {
  entries: Entry[];
  schemes: Scheme[];
  onDeleteEntry: (id: string) => void;
  triggerToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export default function LogsPanel({
  entries,
  schemes,
  onDeleteEntry,
  triggerToast,
}: LogsPanelProps) {
  const [selectedSchemeName, setSelectedSchemeName] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter logic
  const filteredEntries = selectedSchemeName
    ? entries.filter((e) => e.schemeName === selectedSchemeName)
    : entries;

  const getTypeStyle = (schemeType: SchemeType) => {
    switch (schemeType) {
      case 'RD':
        return 'bg-blue-500/15 text-[#58a6ff] border border-blue-500/20';
      case 'SSY':
        return 'bg-[#3fb950]/15 text-[#3fb950] border border-[#3fb950]/20';
      case 'Stocks':
        return 'bg-gold/15 text-gold border border-gold/20';
      case 'MF':
        return 'bg-violet-500/15 text-violet-400 border border-violet-500/20';
      case 'Chit':
        return 'bg-red-500/15 text-[#f85149] border border-red-500/20';
      default:
        return 'bg-gray-500/15 text-gray-400 border border-gray-500/20';
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      triggerToast('Ledger audit synced with storage!', 'success');
    }, 400);
  };

  const handleExportCSV = () => {
    if (filteredEntries.length === 0) {
      triggerToast('No ledger entries available to export', 'error');
      return;
    }

    const headers = [
      'ID',
      'Date',
      'Month',
      'Scheme Name',
      'Scheme Type',
      'Amount Invested (₹)',
      'Current Valuation (₹)',
      'Returns (pct)',
      'Mode',
      'Notes/Reference'
    ];

    const rows = filteredEntries.map((e) => [
      e.id,
      e.date,
      e.month,
      `"${e.schemeName.replace(/"/g, '""')}"`,
      e.schemeType,
      e.amount,
      e.currentValue,
      e.returnPct !== undefined ? `${e.returnPct}%` : '0%',
      `"${e.mode.replace(/"/g, '""')}"`,
      `"${(e.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodedUri);
    downloadAnchor.setAttribute(
      'download',
      `savings_ledger_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    triggerToast('Spreadsheet CSV download triggered!', 'success');
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl shadow-xl overflow-hidden mt-6 hover:border-emerald-500/20 transition-all duration-300" id="entry-logs-panel">
      {/* HEADER SECTION */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3" id="logs-panel-header">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-emerald-500" id="logs-header-icon" />
          <h2 className="font-sans font-bold text-sm md:text-base text-zinc-200" id="logs-header-title">
            Savings Contribution Log
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap" id="logs-header-controls">
          {/* SCHEME SELECT FILTER */}
          <div className="relative flex items-center bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1 min-h-[36px]" id="logs-scheme-filter-grp">
            <Filter className="w-3.5 h-3.5 text-zinc-500 mr-1.5" />
            <select
              id="logs-scheme-filter-select"
              value={selectedSchemeName}
              onChange={(e) => setSelectedSchemeName(e.target.value)}
              className="bg-transparent border-none text-xs text-zinc-300 font-semibold focus:outline-none focus:ring-0 max-w-[140px] md:max-w-[180px] truncate"
            >
              <option value="">All Schemes</option>
              {schemes.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <button
            id="btn-logs-refresh"
            onClick={handleRefresh}
            className={`bg-zinc-800 border border-zinc-700 text-zinc-350 hover:text-emerald-450 hover:border-emerald-500 p-2 rounded-xl transition-all cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center`}
            title="Reload archive"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          <button
            id="btn-logs-export-csv"
            onClick={handleExportCSV}
            className="bg-zinc-800 border border-zinc-700 text-zinc-350 hover:text-emerald-450 hover:border-emerald-500 px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer min-h-[36px]"
          >
            <Download className="w-4 h-4" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* MOBILE LIST LAYOUT (Hidden on md screens and higher) */}
      <div className="block md:hidden p-4 space-y-3 max-h-[500px] overflow-y-auto" id="logs-mobile-container">
        {filteredEntries.length === 0 ? (
          <div className="text-center text-zinc-500 py-12" id="no-logs-mobile-placeholder">
            <AlertCircle className="w-10 h-10 text-zinc-700 mx-auto mb-2" />
            <p className="text-xs">No payment contributions matching this scheme</p>
          </div>
        ) : (
          filteredEntries.map((e, index) => {
            const rowNumber = filteredEntries.length - index;
            return (
              <div
                key={e.id}
                id={`log-card-mobile-${e.id}`}
                className="bg-zinc-800/45 border border-zinc-850 rounded-2xl p-4 space-y-2.5"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500">#{rowNumber}</span>
                    <h4 className="font-bold text-sm text-zinc-100 font-sans mt-0.5">{e.schemeName}</h4>
                  </div>
                  <span className={`text-[9px] font-semibold tracking-wider px-2 py-0.5 rounded-full ${getTypeStyle(e.schemeType)}`}>
                    {e.schemeType}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs border-y border-zinc-800/80 py-2 my-2">
                  <div>
                    <div className="text-zinc-500 text-[9px] uppercase font-bold">Amount Saved</div>
                    <div className="font-display font-bold text-sm text-emerald-400">₹{e.amount.toLocaleString('en-IN')}</div>
                  </div>
                  <div>
                    <div className="text-zinc-500 text-[9px] uppercase font-bold">Current Value</div>
                    <div className="font-display font-medium text-sm text-blue-400">₹{e.currentValue.toLocaleString('en-IN')}</div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-zinc-400 font-sans">
                  <span>📅 {e.date}</span>
                  <span className="text-zinc-700">•</span>
                  <span>📁 {e.month}</span>
                  <span className="text-zinc-700">•</span>
                  <span>💳 {e.mode}</span>
                  {e.returnPct !== undefined && e.returnPct !== 0 && (
                    <>
                      <span className="text-zinc-700">•</span>
                      <span className="text-emerald-400 font-mono">📈 {e.returnPct}%</span>
                    </>
                  )}
                </div>

                {e.notes && (
                  <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-400 italic">
                    {e.notes}
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    id={`btn-delete-log-mobile-${e.id}`}
                    type="button"
                    onClick={() => onDeleteEntry(e.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-red-500/20 text-red-450 hover:bg-red-500/10 text-xs font-semibold rounded-lg transition-all cursor-pointer min-h-[30px]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Entry</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP TABLE VIEW (Hidden on small mobile screens) */}
      <div className="hidden md:block overflow-x-auto" id="logs-desktop-table-container">
        <table className="w-full text-left border-collapse" id="logs-table">
          <thead>
            <tr className="bg-zinc-850/30 border-b border-zinc-800" id="logs-table-header-row">
              <th className="px-4 py-3.5 text-[11px] font-bold text-zinc-450 uppercase tracking-widest text-center w-12">#</th>
              <th className="px-4 py-3.5 text-[11px] font-bold text-zinc-450 uppercase tracking-widest w-24">Date</th>
              <th className="px-4 py-3.5 text-[11px] font-bold text-zinc-450 uppercase tracking-widest w-20">Month</th>
              <th className="px-4 py-3.5 text-[11px] font-bold text-zinc-450 uppercase tracking-widest max-w-[200px] truncate">Scheme</th>
              <th className="px-4 py-3.5 text-[11px] font-bold text-zinc-450 uppercase tracking-widest w-16">Type</th>
              <th className="px-4 py-3.5 text-[11px] font-bold text-zinc-450 uppercase tracking-widest w-32">Amount</th>
              <th className="px-4 py-3.5 text-[11px] font-bold text-zinc-450 uppercase tracking-widest w-32">Curr. Value</th>
              <th className="px-4 py-3.5 text-[11px] font-bold text-zinc-450 uppercase tracking-widest w-20">Returns</th>
              <th className="px-4 py-3.5 text-[11px] font-bold text-zinc-450 uppercase tracking-widest w-28">Mode</th>
              <th className="px-4 py-3.5 text-[11px] font-bold text-zinc-450 uppercase tracking-widest">Remarks</th>
              <th className="px-4 py-3.5 text-center w-14"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40" id="logs-table-body">
            {filteredEntries.length === 0 ? (
              <tr id="no-logs-desktop-row">
                <td colSpan={11} className="px-4 py-16 text-center text-zinc-550 font-medium">
                  <AlertCircle className="w-10 h-10 text-zinc-700 mx-auto mb-2" id="alert-icon-no-rows" />
                  No payment deposits matching this index.
                </td>
              </tr>
            ) : (
              filteredEntries.map((e, index) => {
                const rowNum = filteredEntries.length - index;
                return (
                  <tr
                    key={e.id}
                    id={`log-row-desktop-${e.id}`}
                    className="hover:bg-zinc-800/40 transition-colors group"
                  >
                    <td className="px-4 py-3 text-center text-xs font-mono text-zinc-550">{rowNum}</td>
                    <td className="px-4 py-3 text-xs text-zinc-300 font-medium">{e.date}</td>
                    <td className="px-4 py-3 text-xs text-zinc-400">{e.month}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-zinc-200 capitalize font-sans max-w-[200px] truncate">
                      {e.schemeName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full ${getTypeStyle(e.schemeType)}`}>
                        {e.schemeType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-emerald-400 font-mono">
                      ₹{e.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-blue-400 font-mono">
                      ₹{e.currentValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-zinc-300">
                      {e.returnPct !== undefined && e.returnPct !== 0 ? (
                        <span className="text-emerald-400 font-semibold">{e.returnPct}%</span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-400 truncate max-w-[100px]">{e.mode}</td>
                    <td className="px-4 py-3 text-xs text-zinc-450 font-mono italic max-w-[150px] truncate" title={e.notes}>
                      {e.notes || '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        id={`btn-delete-log-desktop-${e.id}`}
                        type="button"
                        onClick={() => onDeleteEntry(e.id)}
                        className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-red-500 hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                        title="Delete log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
