import React, { useState } from 'react';
import { Scheme, SchemeType, Entry } from '../types';
import { Layers, Plus, Trash2, ArrowRightLeft, FolderHeart } from 'lucide-react';

interface SchemesPanelProps {
  schemes: Scheme[];
  entries: Entry[];
  onAddScheme: (scheme: Omit<Scheme, 'id'>) => void;
  onDeleteScheme: (id: string, name: string) => void;
  triggerToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export default function SchemesPanel({
  schemes,
  entries,
  onAddScheme,
  onDeleteScheme,
  triggerToast,
}: SchemesPanelProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<SchemeType>('RD');
  const [sip, setSip] = useState('');
  const [plat, setPlat] = useState('');

  const getTypeStyle = (schemeType: SchemeType) => {
    switch (schemeType) {
      case 'RD':
        return 'bg-blue-500/10 text-[#58a6ff] border border-blue-500/20';
      case 'SSY':
        return 'bg-[#3fb950]/10 text-[#3fb950] border border-[#3fb950]/20';
      case 'Stocks':
        return 'bg-gold/10 text-gold border border-gold/20';
      case 'MF':
        return 'bg-violet-500/10 text-violet-400 border border-violet-500/20';
      case 'Chit':
        return 'bg-red-500/10 text-[#f85149] border border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
    }
  };

  // Dynamically calculate cumulative total for each scheme name
  const getSchemeCumulativeTotal = (schemeId: string) => {
    return entries
      .filter((e) => e.schemeId === schemeId)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      triggerToast('Please provide a scheme name (e.g. PPF SBI)', 'error');
      return;
    }

    const sipNum = parseFloat(sip) || 0;
    if (sipNum < 0) {
      triggerToast('Monthly sip amount cannot be negative', 'error');
      return;
    }

    onAddScheme({
      name: name.trim(),
      type,
      sip: sipNum,
      plat: plat.trim() || 'Self-managed',
    });

    // Reset fields
    setName('');
    setType('RD');
    setSip('');
    setPlat('');
    setIsAddOpen(false);
    triggerToast(`Scheme "${name}" added successfully!`, 'success');
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl shadow-xl overflow-hidden hover:border-emerald-500/20 transition-all duration-300" id="schemes-manager-panel">
      <div className="bg-zinc-900 border-b border-zinc-800 px-5 py-4 flex items-center justify-between" id="schemes-header">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-amber-500" id="schemes-header-icon" />
          <h2 className="font-sans font-bold text-sm md:text-base text-zinc-200" id="schemes-header-title">
            My Saving Schemes
          </h2>
        </div>
        <button
          id="btn-toggle-add-scheme"
          onClick={() => setIsAddOpen(!isAddOpen)}
          className="bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-emerald-400 hover:border-emerald-500/40 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer min-h-[36px]"
        >
          <Plus className={`w-3.5 h-3.5 transition-transform duration-200 ${isAddOpen ? 'rotate-45' : ''}`} />
          {isAddOpen ? 'Close' : 'Add Scheme'}
        </button>
      </div>

      <div className="p-5" id="schemes-body">
        {/* COLLAPSIBLE ADD BOX */}
        {isAddOpen && (
          <form
            onSubmit={handleSubmit}
            id="add-scheme-collapsible-form"
            className="mb-5 p-4 bg-zinc-800/50 border border-zinc-800 rounded-2xl space-y-3.5 animate-in slide-in-from-top-3 duration-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3" id="add-scheme-row1">
              <div className="flex flex-col">
                <label htmlFor="ns-name" className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Scheme Name
                </label>
                <input
                  id="ns-name"
                  type="text"
                  placeholder="e.g. PPF - State Bank of India"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl text-sm px-3 py-2 text-zinc-150 focus:outline-none focus:border-emerald-500 transition-colors min-h-[40px]"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="ns-type" className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Scheme Type
                </label>
                <select
                  id="ns-type"
                  value={type}
                  onChange={(e) => setType(e.target.value as SchemeType)}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl text-sm px-3 py-2 text-zinc-150 focus:outline-none focus:border-emerald-500 transition-colors min-h-[40px]"
                >
                  <option value="RD">RD (Recurring Deposit)</option>
                  <option value="SSY">SSY (Sukanya Samriddhi)</option>
                  <option value="Stocks">Stocks (Equities)</option>
                  <option value="MF">Mutual Fund (SIP)</option>
                  <option value="Chit">Chit (Chit Fund)</option>
                  <option value="Custom">Custom / Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3" id="add-scheme-row2">
              <div className="flex flex-col">
                <label htmlFor="ns-sip" className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Monthly SIP (₹)
                </label>
                <input
                  id="ns-sip"
                  type="number"
                  placeholder="0 (Optional)"
                  value={sip}
                  onChange={(e) => setSip(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl text-sm px-3 py-2 text-zinc-150 focus:outline-none focus:border-emerald-500 transition-colors min-h-[40px]"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="ns-plat" className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Platform / Bank
                </label>
                <input
                  id="ns-plat"
                  type="text"
                  placeholder="e.g. Axis, Groww, Zerodha"
                  value={plat}
                  onChange={(e) => setPlat(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl text-sm px-3 py-2 text-zinc-150 focus:outline-none focus:border-emerald-500 transition-colors min-h-[40px]"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2" id="add-scheme-actions">
              <button
                type="submit"
                id="btn-scheme-submit"
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold py-2 rounded-xl transition-all min-h-[38px] cursor-pointer shadow-md shadow-emerald-500/10"
              >
                Create Scheme
              </button>
              <button
                type="button"
                id="btn-scheme-cancel"
                onClick={() => setIsAddOpen(false)}
                className="bg-zinc-900 hover:bg-zinc-850 hover:text-white text-zinc-400 text-xs font-semibold px-4 rounded-xl border border-zinc-800 transition-all min-h-[38px] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* SCHEMES CONTAINER LIST */}
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1" id="schemes-list-container">
          {schemes.length === 0 ? (
            <div className="text-center text-zinc-500 py-10" id="no-schemes-placeholder">
              <FolderHeart className="w-10 h-10 text-zinc-700 mx-auto mb-2" />
              <p className="text-xs">No saving schemes yet. Add one above to get started!</p>
            </div>
          ) : (
            schemes.map((s) => {
              const cumSaved = getSchemeCumulativeTotal(s.id);
              return (
                <div
                  key={s.id}
                  id={`scheme-row-${s.id}`}
                  className="bg-zinc-800/30 border border-zinc-850 rounded-2xl p-3.5 flex items-center justify-between gap-4 group hover:border-[#3b82f6]/30 transition-all duration-300"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-zinc-100 truncate block font-sans">
                        {s.name}
                      </span>
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0 ${getTypeStyle(s.type)}`}>
                        {s.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-400">
                      <span className="flex items-center gap-1">
                        SIP: <strong className="text-zinc-300">₹{s.sip.toLocaleString('en-IN')}</strong>
                      </span>
                      <span className="text-zinc-700">•</span>
                      <span className="truncate">{s.plat}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right flex-shrink-0" id={`cum-total-${s.id}`}>
                      <div className="text-zinc-550 text-xs font-bold uppercase tracking-wider text-[9px] mb-0.5">Total Saved</div>
                      <div className="font-display font-bold text-sm text-emerald-400" id={`cumulative-value-${s.id}`}>
                        ₹{cumSaved.toLocaleString('en-IN')}
                      </div>
                    </div>
                    
                    <button
                      id={`delete-scheme-${s.id}`}
                      type="button"
                      onClick={() => onDeleteScheme(s.id, s.name)}
                      className="opacity-40 group-hover:opacity-100 text-zinc-400 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer focus:opacity-100"
                      title="Delete profile"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
