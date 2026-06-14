import React, { useState, useEffect } from 'react';
import { Scheme } from '../types';
import { CreditCard, Landmark, Check, Plus } from 'lucide-react';

interface LogPaymentFormProps {
  schemes: Scheme[];
  onAddEntry: (entry: {
    month: string;
    date: string;
    schemeId: string;
    amount: number;
    currentValue: number;
    returnPct?: number;
    mode: string;
    notes: string;
  }) => void;
  triggerToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export default function LogPaymentForm({ schemes, onAddEntry, triggerToast }: LogPaymentFormProps) {
  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const getTodayMonthString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    return `${yyyy}-${mm}`;
  };

  const [month, setMonth] = useState(getTodayMonthString());
  const [date, setDate] = useState(getTodayDateString());
  const [schemeId, setSchemeId] = useState('');
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState('UPI');
  const [currentValue, setCurrentValue] = useState('');
  const [returnPct, setReturnPct] = useState('');
  const [notes, setNotes] = useState('');

  // Auto select first scheme when active schemes load
  useEffect(() => {
    if (schemes.length > 0 && !schemeId) {
      setSchemeId(schemes[0].id);
    }
  }, [schemes, schemeId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!schemeId) {
      triggerToast('Please select a valid scheme', 'error');
      return;
    }

    const amtNum = parseFloat(amount);
    if (isNaN(amtNum) || amtNum <= 0) {
      triggerToast('Please enter a valid investment amount (> 0)', 'error');
      return;
    }

    const curValNum = currentValue ? parseFloat(currentValue) : amtNum;
    if (isNaN(curValNum) || curValNum < 0) {
      triggerToast('Current value must be a positive number', 'error');
      return;
    }

    const retNum = returnPct ? parseFloat(returnPct) : undefined;
    if (retNum !== undefined && isNaN(retNum)) {
      triggerToast('Return % must be a number', 'error');
      return;
    }

    onAddEntry({
      month,
      date,
      schemeId,
      amount: amtNum,
      currentValue: curValNum,
      returnPct: retNum,
      mode,
      notes,
    });

    // Reset inputs
    setAmount('');
    setCurrentValue('');
    setReturnPct('');
    setNotes('');
    triggerToast('Payment logged securely!', 'success');
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl shadow-xl overflow-hidden hover:border-emerald-500/30 transition-all duration-300" id="log-payment-panel">
      <div className="bg-zinc-900 border-b border-zinc-800 px-5 py-4 flex items-center justify-between" id="log-payment-header">
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-emerald-500" id="log-header-icon" />
          <h2 className="font-sans font-bold text-sm md:text-base text-zinc-200" id="log-header-title">
            Log Scheme Payment
          </h2>
        </div>
        <span className="text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full" id="log-header-status">
          Auto-debit Ready
        </span>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4" id="log-payment-form">
        {/* ROW 1: MONTH & DATE */}
        <div className="grid grid-cols-2 gap-3" id="log-row-dates">
          <div className="flex flex-col" id="log-input-grp-month">
            <label htmlFor="input-month" className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
              Budget Month
            </label>
            <input
              id="input-month"
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="bg-zinc-800/80 border border-zinc-800 rounded-xl text-zinc-100 px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/20 transition-all min-h-[44px]"
              required
            />
          </div>

          <div className="flex flex-col" id="log-input-grp-date">
            <label htmlFor="input-date" className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
              Payment Date
            </label>
            <input
              id="input-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-zinc-800/80 border border-zinc-800 rounded-xl text-zinc-100 px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/20 transition-all min-h-[44px]"
              required
            />
          </div>
        </div>

        {/* ROW 2: SCHEME SELECTION */}
        <div className="flex flex-col" id="log-input-grp-scheme">
          <label htmlFor="input-scheme" className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
            Saving Scheme
          </label>
          <select
            id="input-scheme"
            value={schemeId}
            onChange={(e) => setSchemeId(e.target.value)}
            className="bg-zinc-800/80 border border-zinc-800 rounded-xl text-zinc-100 px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/20 transition-all appearance-none min-h-[44px]"
            required
          >
            {schemes.length === 0 ? (
              <option value="">-- No Schemes Available (Add first) --</option>
            ) : (
              schemes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.type}) - {s.plat}
                </option>
              ))
            )}
          </select>
        </div>

        {/* ROW 3: AMOUNT & PAYMENT MODE */}
        <div className="grid grid-cols-2 gap-3" id="log-row-amount-mode">
          <div className="flex flex-col" id="log-input-grp-amount">
            <label htmlFor="input-amount" className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
              Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-semibold">₹</span>
              <input
                id="input-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0.01"
                step="0.01"
                className="bg-zinc-800/80 border border-zinc-800 rounded-xl text-zinc-100 pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/20 transition-all w-full min-h-[44px]"
                required
              />
            </div>
          </div>

          <div className="flex flex-col" id="log-input-grp-mode">
            <label htmlFor="input-mode" className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
              Payment Mode
            </label>
            <select
              id="input-mode"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="bg-zinc-800/80 border border-zinc-800 rounded-xl text-zinc-100 px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/20 transition-all min-h-[44px]"
            >
              <option value="UPI">UPI</option>
              <option value="DBS Remit">DBS Remit</option>
              <option value="NEFT/IMPS">NEFT/IMPS</option>
              <option value="Auto-debit">Auto-debit</option>
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* ROW 4: CURRENT VALUE & EXPECTED RETURNS (OPTIONAL) */}
        <div className="grid grid-cols-2 gap-3" id="log-row-valuation">
          <div className="flex flex-col" id="log-input-grp-currval">
            <label htmlFor="input-currval" className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5 flex items-center justify-between">
              <span>Current Value ₹</span>
              <span className="text-[9px] text-[#3b82f6] normal-case font-normal">(Optional)</span>
            </label>
            <input
              id="input-currval"
              type="number"
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
              placeholder="Same as amount"
              min="0"
              step="0.01"
              className="bg-zinc-800/80 border border-zinc-800 rounded-xl text-zinc-100 px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/20 transition-all min-h-[44px]"
            />
          </div>

          <div className="flex flex-col" id="log-input-grp-return">
            <label htmlFor="input-return" className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5 flex items-center justify-between">
              <span>Return %</span>
              <span className="text-[9px] text-[#3b82f6] normal-case font-normal">(Optional)</span>
            </label>
            <input
              id="input-return"
              type="number"
              value={returnPct}
              onChange={(e) => setReturnPct(e.target.value)}
              placeholder="e.g. 7.5"
              step="0.01"
              className="bg-zinc-800/80 border border-zinc-800 rounded-xl text-zinc-100 px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/20 transition-all min-h-[44px]"
            />
          </div>
        </div>

        {/* NOTES TEXTAREA */}
        <div className="flex flex-col" id="log-input-grp-notes">
          <label htmlFor="input-notes" className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
            Remarks & Transaction Notes
          </label>
          <textarea
            id="input-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Reference number, bank details, remarks..."
            className="bg-zinc-800/80 border border-zinc-800 rounded-xl text-zinc-100 px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/20 transition-all min-h-[60px] resize-none"
          />
        </div>

        {/* SUBMIT BUTTON */}
        <button
          id="btn-submit-entry"
          type="submit"
          disabled={schemes.length === 0}
          className="w-full bg-emerald-500 hover:bg-emerald-450 text-zinc-950 font-bold text-sm tracking-wide rounded-xl py-3 shadow-lg hover:shadow-emerald-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed selection:bg-black/10 min-h-[46px]"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" id="submit-btn-icon" />
          <span id="submit-btn-text">Save Deposit Log</span>
        </button>
      </form>
    </div>
  );
}
