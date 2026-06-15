import React, { useState, useEffect } from 'react';
import { Sparkles, CloudOff, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { User } from 'firebase/auth';

interface HeaderProps {
  isCloudSyncActive?: boolean;
  currentUser: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
}

export default function Header({
  isCloudSyncActive = false,
  currentUser,
  onSignIn,
  onSignOut,
}: HeaderProps) {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    // Elegant ticking clock showing current date
    const tick = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }) + ' • ' +
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      id="main-app-header"
      className="bg-zinc-900/90 backdrop-blur border-b border-zinc-800 px-4 py-3 md:px-6 sticky top-0 z-40 transition-all shadow-md flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]" id="logo-icon-emoji">
          <span className="font-display font-black text-lg text-zinc-950 select-none pb-0.5" id="logo-rupee-char">र</span>
        </div>
        <h1 className="font-display font-bold text-lg tracking-tight select-none flex items-center gap-1.5" id="logo-title">
          <span className="bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">Saving</span>
          <span className="text-emerald-500">Tracker</span>
        </h1>
      </div>

      <div className="flex items-center gap-2.5 md:gap-3.5" id="header-status-group">
        {/* Digital Clock */}
        <span
          id="digital-clock"
          className="hidden lg:inline-block font-mono text-[11px] text-zinc-400 bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-xl"
        >
          {timeStr}
        </span>

        {/* Sync Mode Pill */}
        <div
          id="sync-status-pill"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold select-none border transition-all ${
            isCloudSyncActive
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-zinc-800 text-zinc-400 border-zinc-700'
          }`}
        >
          <div
            className={`w-1.5 h-1.5 rounded-full ring-2 ${
              isCloudSyncActive
                ? 'bg-emerald-500 ring-emerald-500/20 animate-pulse'
                : 'bg-yellow-500 ring-yellow-500/15'
            }`}
            id="sync-status-dot"
          />
          <span id="sync-status-text" className="hidden sm:inline">
            {isCloudSyncActive ? 'Cloud Synced' : 'Offline Mode'}
          </span>
        </div>

        {/* Auth Interface */}
        {currentUser ? (
          <div className="flex items-center gap-2" id="header-user-badge">
            <div className="flex items-center gap-1.5 bg-zinc-800 border border-zinc-700 pl-1.5 pr-2.5 py-1 rounded-xl max-w-[120px] md:max-w-none">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'Profile'}
                  referrerPolicy="no-referrer"
                  className="w-5 h-5 rounded-full object-cover border border-zinc-700"
                  id="header-user-avatar"
                />
              ) : (
                <div className="w-5 h-5 bg-emerald-500/15 rounded-full flex items-center justify-center border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  <UserIcon className="w-3 h-3" />
                </div>
              )}
              <span className="text-[11px] text-zinc-200 font-semibold truncate hidden sm:inline" id="header-user-name">
                {currentUser.displayName?.split(' ')[0] || 'User'}
              </span>
            </div>
            <button
              id="header-btn-signout"
              onClick={onSignOut}
              className="bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 p-2 rounded-xl transition-all group cursor-pointer min-h-[34px] min-w-[34px] flex items-center justify-center"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5 group-hover:scale-105" />
            </button>
          </div>
        ) : (
          <button
            id="header-btn-signin"
            onClick={onSignIn}
            className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer min-h-[34px]"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Connect Cloud</span>
          </button>
        )}
      </div>
    </header>
  );
}
