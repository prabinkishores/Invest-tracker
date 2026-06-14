import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SummaryCards from './components/SummaryCards';
import LogPaymentForm from './components/LogPaymentForm';
import SchemesPanel from './components/SchemesPanel';
import LogsPanel from './components/LogsPanel';
import Toast, { ToastMessage } from './components/Toast';
import Dialog from './components/Dialog';
import { Scheme, Entry } from './types';
import {
  getCachedSchemes,
  saveCachedSchemes,
  getCachedEntries,
  saveCachedEntries,
} from './lib/storage';
import { CreditCard, Layers, FileSpreadsheet, Sparkles, TrendingUp } from 'lucide-react';

// Firebase imports
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { collection, query, where, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, googleProvider, OperationType, handleFirestoreError, sanitizePayload } from './lib/firebase';

export default function App() {
  // --- CORE STATE ---
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);

  // --- COMPACT NAVIGATION FOR MOBILE ACTIVE VIEW ---
  // On mobile we show sticky bottom nav representing: 'dashboard' (Log payment), 'schemes', 'logs'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'schemes' | 'logs'>('dashboard');

  // --- MODAL DIALOG STATE ---
  const [dialogConfig, setDialogConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmAction: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    confirmAction: () => {},
  });

  // --- LISTENER FOR AUTH CHANGES ---
  useEffect(() => {
    const unsubscribeStatus = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        triggerToast(`Signed in as ${user.displayName || 'Saver'}`, 'success');
      } else {
        // Fallback to local offline cache
        setIsCloudSyncing(false);
        setSchemes(getCachedSchemes());
        setEntries(getCachedEntries());
      }
    });
    return () => unsubscribeStatus();
  }, []);

  // --- REAL-TIME FIRESTORE DATABASING ---
  useEffect(() => {
    if (!currentUser) return;

    setIsCloudSyncing(true);

    const qSchemes = query(collection(db, 'schemes'), where('userId', '==', currentUser.uid));
    const unsubscribeSchemes = onSnapshot(qSchemes, async (snapshot) => {
      const list: Scheme[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as Scheme);
      });

      // Local storage to cloud warmup migration
      if (list.length === 0) {
        const localCached = getCachedSchemes();
        if (localCached.length > 0) {
          triggerToast('Syncing local schemes to the secure cloud...', 'info');
          for (const s of localCached) {
            try {
              const updatedScheme = { ...s, userId: currentUser.uid };
              await setDoc(doc(db, 'schemes', s.id), sanitizePayload(updatedScheme));
            } catch (err) {
              handleFirestoreError(err, OperationType.WRITE, `schemes/${s.id}`);
            }
          }
          return;
        }
      }

      setSchemes(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'schemes');
    });

    const qEntries = query(collection(db, 'entries'), where('userId', '==', currentUser.uid));
    const unsubscribeEntries = onSnapshot(qEntries, async (snapshot) => {
      const list: Entry[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as Entry);
      });

      // Local entries log to cloud warmup migration
      if (list.length === 0) {
        const localCached = getCachedEntries();
        if (localCached.length > 0) {
          triggerToast('Syncing contribution logs to cloud...', 'info');
          for (const e of localCached) {
            try {
              const updatedEntry = { ...e, userId: currentUser.uid };
              await setDoc(doc(db, 'entries', e.id), sanitizePayload(updatedEntry));
            } catch (err) {
              handleFirestoreError(err, OperationType.WRITE, `entries/${e.id}`);
            }
          }
          return;
        }
      }

      // Sort descending
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setEntries(list);
      setIsCloudSyncing(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'entries');
    });

    return () => {
      unsubscribeSchemes();
      unsubscribeEntries();
    };
  }, [currentUser]);

  // --- TOAST TRIGGER HELPER ---
  const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({
      id: Date.now().toString(),
      type,
      message,
    });
  };

  // --- SIGN IN AND SIGNOUT HANDLERS ---
  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Sign In Failed:', err);
      triggerToast('Google Login was cancelled or skipped.', 'error');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      triggerToast('Logged out securely.', 'info');
    } catch (err) {
      console.error('Sign Out Failed:', err);
      triggerToast('Signout error occurred.', 'error');
    }
  };

  // --- FORM STATE SAVE HANDLERS ---
  const handleAddEntry = async (newEntryData: {
    month: string;
    date: string;
    schemeId: string;
    amount: number;
    currentValue: number;
    returnPct?: number;
    mode: string;
    notes: string;
  }) => {
    const associatedScheme = schemes.find((s) => s.id === newEntryData.schemeId);
    if (!associatedScheme) {
      triggerToast('Validation failed: Associated scheme not found', 'error');
      return;
    }

    const payload: Entry = {
      id: 'entry_' + Date.now().toString(),
      ...newEntryData,
      schemeName: associatedScheme.name,
      schemeType: associatedScheme.type,
      createdAt: new Date().toISOString(),
      userId: currentUser ? currentUser.uid : undefined,
    };

    if (currentUser) {
      try {
        await setDoc(doc(db, 'entries', payload.id), sanitizePayload(payload));
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `entries/${payload.id}`);
      }
    } else {
      const updated = [payload, ...entries];
      setEntries(updated);
      saveCachedEntries(updated);
    }
  };

  const handleDeleteEntryRequest = (id: string) => {
    setDialogConfig({
      isOpen: true,
      title: 'Delete Deposit Record?',
      description: 'Are you sure you want to delete this contribution log? This action cannot be undone.',
      confirmAction: async () => {
        if (currentUser) {
          try {
            await deleteDoc(doc(db, 'entries', id));
            setDialogConfig((prev) => ({ ...prev, isOpen: false }));
            triggerToast('Deposit log removed from cloud!', 'success');
          } catch (err) {
            handleFirestoreError(err, OperationType.DELETE, `entries/${id}`);
          }
        } else {
          const updated = entries.filter((e) => e.id !== id);
          setEntries(updated);
          saveCachedEntries(updated);
          setDialogConfig((prev) => ({ ...prev, isOpen: false }));
          triggerToast('Deposit log removed successfully!', 'success');
        }
      },
    });
  };

  const handleAddScheme = async (newSchemeData: Omit<Scheme, 'id'>) => {
    const payload: Scheme = {
      id: 'scheme_' + Date.now(),
      ...newSchemeData,
      createdAt: new Date().toISOString(),
      userId: currentUser ? currentUser.uid : undefined,
    };

    if (currentUser) {
      try {
        await setDoc(doc(db, 'schemes', payload.id), sanitizePayload(payload));
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `schemes/${payload.id}`);
      }
    } else {
      const updated = [...schemes, payload];
      setSchemes(updated);
      saveCachedSchemes(updated);
    }
  };

  const handleDeleteSchemeRequest = (id: string, name: string) => {
    // Audit if any entry depends on this scheme profile
    const dependenciesCount = entries.filter((e) => e.schemeId === id).length;
    const warningMessage = dependenciesCount > 0
      ? `Warning: There are ${dependenciesCount} logged payments cataloged under "${name}". Deleting this profile will leave those entries orphaned.`
      : `Are you sure you want to remove the scheme "${name}"? This stays tracked locally until cleared.`;

    setDialogConfig({
      isOpen: true,
      title: 'Remove Scheme Outline?',
      description: warningMessage,
      confirmAction: async () => {
        if (currentUser) {
          try {
            await deleteDoc(doc(db, 'schemes', id));
            setDialogConfig((prev) => ({ ...prev, isOpen: false }));
            triggerToast(`Scheme "${name}" removed from cloud.`, 'success');
          } catch (err) {
            handleFirestoreError(err, OperationType.DELETE, `schemes/${id}`);
          }
        } else {
          const updated = schemes.filter((s) => s.id !== id);
          setSchemes(updated);
          saveCachedSchemes(updated);
          setDialogConfig((prev) => ({ ...prev, isOpen: false }));
          triggerToast(`Scheme "${name}" removed.`, 'success');
        }
      },
    });
  };

  // --- DYNAMIC SUM STATS CALCULATIONS ---
  const totalInvested = entries.reduce((sum, e) => sum + e.amount, 0);

  // June 2026 Monthly math matching current date
  const thisMonthString = '2026-06';
  const thisMonthInvested = entries
    .filter((e) => e.month === thisMonthString)
    .reduce((sum, e) => sum + e.amount, 0);

  const activeSchemesCount = schemes.length;
  const totalEntriesCount = entries.length;

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 font-sans" id="app-canvas-container">
      {/* BRANDING HEADER */}
      <Header
        isCloudSyncActive={!!currentUser && !isCloudSyncing}
        currentUser={currentUser}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
      />

      {/* DASHBOARD WRAPPER */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-5 pb-24 md:pb-8 space-y-4 md:space-y-6" id="app-main-layout">
        
        {/* SUMMARY STATS GRID */}
        <SummaryCards
          totalInvested={totalInvested}
          thisMonthInvested={thisMonthInvested}
          activeSchemesCount={activeSchemesCount}
          totalEntriesCount={totalEntriesCount}
        />

        {/* --- MOBILE VIEW: TABBED ENGINE | DESKTOP VIEW: BENTO COLUMN MATRIX --- */}
        <div className="md:grid md:grid-cols-12 md:gap-6" id="desktop-grid-control">
          
          {/* COLUMN MATRIX (LEFT ON DESKTOP - INPUT CONTROLS) */}
          <div className="md:col-span-5 space-y-6" id="controls-column-left">
            
            {/* VIEWPORT CONTROLLER FOR MOBILE PORT */}
            <div className="md:hidden flex bg-zinc-905 border border-zinc-800 p-1 rounded-2xl gap-1 mb-4" id="mobile-tab-pill-box">
              <button
                id="tab-btn-dashboard"
                onClick={() => setActiveTab('dashboard')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold min-h-[40px] transition-all cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-emerald-500 text-zinc-950 shadow-md font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Log Pay</span>
              </button>
              
              <button
                id="tab-btn-schemes"
                onClick={() => setActiveTab('schemes')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold min-h-[40px] transition-all cursor-pointer ${
                  activeTab === 'schemes'
                    ? 'bg-amber-500 text-zinc-950 shadow-md font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Schemes</span>
              </button>

              <button
                id="tab-btn-logs"
                onClick={() => setActiveTab('logs')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold min-h-[40px] transition-all cursor-pointer ${
                  activeTab === 'logs'
                    ? 'bg-blue-550 text-white shadow-md font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Ledger</span>
              </button>
            </div>

            {/* TAB SECTIONS & RESPONSIVE CONDITIONAL WRAP */}
            <div className={`md:block ${activeTab === 'dashboard' ? 'block' : 'hidden'}`} id="form-form-wrapper">
              <LogPaymentForm
                schemes={schemes}
                onAddEntry={handleAddEntry}
                triggerToast={triggerToast}
              />
            </div>

            <div className={`md:block ${activeTab === 'schemes' ? 'block' : 'hidden'}`} id="scheme-scheme-wrapper">
              <SchemesPanel
                schemes={schemes}
                entries={entries}
                onAddScheme={handleAddScheme}
                onDeleteScheme={handleDeleteSchemeRequest}
                triggerToast={triggerToast}
              />
            </div>
          </div>

          {/* COLUMN MATRIX (RIGHT ON DESKTOP - MAIN ENHANCED RECORDS) */}
          <div className={`md:col-span-7 md:block ${activeTab === 'logs' ? 'block' : 'hidden'}`} id="ledger-column-right">
            <LogsPanel
              entries={entries}
              schemes={schemes}
              onDeleteEntry={handleDeleteEntryRequest}
              triggerToast={triggerToast}
            />
          </div>
        </div>
      </main>

      {/* --- PREMIUM MOBILE BOTTOM NAV BUTTON TAB BAR (Only Visible on Mobile viewports) --- */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-md border-t border-zinc-800 py-2 px-6 flex items-center justify-around z-30 shadow-xl" id="mobile-sticky-dock">
        <button
          id="dock-btn-dashboard"
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 transition-all focus:outline-none min-w-[50px] ${
            activeTab === 'dashboard' ? 'text-emerald-400 scale-105 font-bold' : 'text-zinc-500 hover:text-zinc-350'
          }`}
        >
          <CreditCard className="w-5 h-5" id="dock-icon-dashboard" />
          <span className="text-[10px] font-semibold">Log Pay</span>
        </button>

        <button
          id="dock-btn-schemes"
          onClick={() => setActiveTab('schemes')}
          className={`flex flex-col items-center gap-1 transition-all focus:outline-none min-w-[50px] ${
            activeTab === 'schemes' ? 'text-amber-400 scale-105 font-bold' : 'text-zinc-500 hover:text-zinc-350'
          }`}
        >
          <Layers className="w-5 h-5" id="dock-icon-schemes" />
          <span className="text-[10px] font-semibold">Schemes</span>
        </button>

        <button
          id="dock-btn-logs"
          onClick={() => setActiveTab('logs')}
          className={`flex flex-col items-center gap-1 transition-all focus:outline-none min-w-[50px] ${
            activeTab === 'logs' ? 'text-blue-450 scale-105 font-bold' : 'text-zinc-500 hover:text-zinc-350'
          }`}
        >
          <FileSpreadsheet className="w-5 h-5" id="dock-icon-logs" />
          <span className="text-[10px] font-semibold">Ledger</span>
        </button>
      </footer>

      {/* --- FLOATING TOAST FEEDBACKS --- */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* --- CUSTOM DIALOGS FOR CONSTRAINED CONFIRMS --- */}
      <Dialog
        isOpen={dialogConfig.isOpen}
        title={dialogConfig.title}
        description={dialogConfig.description}
        onConfirm={dialogConfig.confirmAction}
        onCancel={() => setDialogConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
