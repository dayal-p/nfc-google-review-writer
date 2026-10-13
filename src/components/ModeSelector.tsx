import React from 'react';
import { Store, Globe, CheckCircle2, Sparkles } from 'lucide-react';
import { ModeType } from '../types';

interface ModeSelectorProps {
  currentMode: ModeType;
  onSelectMode: (mode: ModeType) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, onSelectMode }) => {
  return (
    <div className="bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/80 backdrop-blur-sm shadow-inner grid grid-cols-2 gap-1.5">
      {/* Mode A: Google Business Profile */}
      <button
        onClick={() => onSelectMode('places')}
        className={`relative flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 ${
          currentMode === 'places'
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border border-blue-400/30'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
        }`}
      >
        <div className="relative">
          {/* Custom Google 'G' icon or Store */}
          <Store className="w-4 h-4 sm:w-5 sm:h-5" />
          {currentMode === 'places' && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          )}
        </div>
        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <span>Verified Business</span>
            <span className="text-[10px] hidden sm:inline-block px-1.5 py-0.2 rounded bg-white/20 text-white font-mono">
              Mode A
            </span>
          </div>
          <p className={`text-[10px] font-normal leading-tight hidden xs:block ${
            currentMode === 'places' ? 'text-blue-100' : 'text-slate-500'
          }`}>
            Places API Autocomplete
          </p>
        </div>
      </button>

      {/* Mode B: Custom / Manual / Freelancer */}
      <button
        onClick={() => onSelectMode('custom')}
        className={`relative flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 ${
          currentMode === 'custom'
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border border-blue-400/30'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
        }`}
      >
        <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <span>Custom / Manual URL</span>
            <span className="text-[10px] hidden sm:inline-block px-1.5 py-0.2 rounded bg-white/20 text-white font-mono">
              Mode B
            </span>
          </div>
          <p className={`text-[10px] font-normal leading-tight hidden xs:block ${
            currentMode === 'custom' ? 'text-blue-100' : 'text-slate-500'
          }`}>
            Freelancer, Trustpilot, Direct link
          </p>
        </div>
      </button>
    </div>
  );
};
