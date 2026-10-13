import React from 'react';
import { Radio, Sparkles, Key, Smartphone, HelpCircle } from 'lucide-react';
import { getDeviceNfcInfo } from '../utils/nfc';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings, onOpenHelp }) => {
  const deviceInfo = getDeviceNfcInfo();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 p-0.5 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Radio className="w-5 h-5 text-blue-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                TapReview
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Web NFC
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              NFC Google Review Card Programmer
            </p>
          </div>
        </div>

        {/* Right Status & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* NFC Hardware Status Pill */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              deviceInfo.isSupported
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
            }`}
            title={deviceInfo.message}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                deviceInfo.isSupported ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
              }`}
            />
            <span className="hidden sm:inline">
              {deviceInfo.isSupported ? 'Web NFC Ready' : 'QR / Simulation Mode'}
            </span>
            <span className="sm:hidden">
              {deviceInfo.isSupported ? 'NFC' : 'QR'}
            </span>
          </div>

          {/* Help Button */}
          <button
            onClick={onOpenHelp}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
            title="How it works"
            aria-label="How it works"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* API Key / Settings */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-800 transition-all"
            title="Configure Google Places API Key"
          >
            <Key className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">API Config</span>
          </button>
        </div>
      </div>
    </header>
  );
};
