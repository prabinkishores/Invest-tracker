import React from 'react';
import { PiggyBank, Calendar, Layers, FileSpreadsheet } from 'lucide-react';

interface SummaryCardsProps {
  totalInvested: number;
  thisMonthInvested: number;
  activeSchemesCount: number;
  totalEntriesCount: number;
}

export default function SummaryCards({
  totalInvested,
  thisMonthInvested,
  activeSchemesCount,
  totalEntriesCount,
}: SummaryCardsProps) {
  const formatINR = (value: number) => {
    return '₹' + Math.round(value).toLocaleString('en-IN');
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6" id="summary-cards-grid">
      {/* CARD 1: TOTAL INVESTED */}
      <div id="summary-card-total" className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-300 shadow-xl">
        <div className="flex justify-between items-start mb-3">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Total Invested</span>
          <div className="p-1.5 bg-emerald-500/10 rounded-xl text-emerald-400">
            <PiggyBank className="w-5 h-5" />
          </div>
        </div>
        <div>
          <h4 className="font-display font-bold text-lg md:text-2xl text-emerald-400 font-mono" id="val-total-invested">
            {formatINR(totalInvested)}
          </h4>
          <span className="text-[10px] text-zinc-500 mt-1 block">Cumulative holdings</span>
        </div>
      </div>

      {/* CARD 2: THIS MONTH */}
      <div id="summary-card-month" className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-300 shadow-xl">
        <div className="flex justify-between items-start mb-3">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">This Month</span>
          <div className="p-1.5 bg-emerald-500/10 rounded-xl text-emerald-400">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
        <div>
          <h4 className="font-display font-bold text-lg md:text-2xl text-emerald-400 font-mono" id="val-month-invested">
            {formatINR(thisMonthInvested)}
          </h4>
          <span className="text-[10px] text-zinc-500 mt-1 block">June contributions</span>
        </div>
      </div>

      {/* CARD 3: ACTIVE SCHEMES */}
      <div id="summary-card-schemes" className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 flex flex-col justify-between hover:border-amber-500/30 transition-all duration-300 shadow-xl">
        <div className="flex justify-between items-start mb-3">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Active Schemes</span>
          <div className="p-1.5 bg-amber-500/10 rounded-xl text-amber-500">
            <Layers className="w-5 h-5" />
          </div>
        </div>
        <div>
          <h4 className="font-display font-bold text-lg md:text-2xl text-amber-500 font-mono" id="val-active-schemes">
            {activeSchemesCount}
          </h4>
          <span className="text-[10px] text-zinc-500 mt-1 block">SIP target profiles</span>
        </div>
      </div>

      {/* CARD 4: TOTAL ENTRIES */}
      <div id="summary-card-entries" className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 flex flex-col justify-between hover:border-purple-500/30 transition-all duration-300 shadow-xl">
        <div className="flex justify-between items-start mb-3">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Total Entries</span>
          <div className="p-1.5 bg-purple-500/10 rounded-xl text-purple-400">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
        </div>
        <div>
          <h4 className="font-display font-bold text-lg md:text-2xl text-purple-400 font-mono" id="val-total-entries">
            {totalEntriesCount}
          </h4>
          <span className="text-[10px] text-zinc-500 mt-1 block">Deposits logs</span>
        </div>
      </div>
    </div>
  );
}
