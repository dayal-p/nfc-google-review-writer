import React from 'react';
import { 
  Radio, 
  ExternalLink, 
  Copy, 
  QrCode, 
  Check, 
  Sparkles,
  Zap,
  HardDrive
} from 'lucide-react';
import { estimateNdefByteSize } from '../utils/urlGenerator';
import { NFC_TAG_SPECS } from '../types';

interface ActionToolbarProps {
  targetUrl: string;
  onProgramNfc: () => void;
  onOpenQrModal: () => void;
  onCopyUrl: () => void;
  copied: boolean;
  isNfcSupported: boolean;
}

export const ActionToolbar: React.FC<ActionToolbarProps> = ({
  targetUrl,
  onProgramNfc,
  onOpenQrModal,
  onCopyUrl,
  copied,
  isNfcSupported,
}) => {
  const byteSize = estimateNdefByteSize(targetUrl);
  const ntag213Max = NFC_TAG_SPECS.NTAG213.userMemory;
  const isOverNtag213 = byteSize > ntag213Max;

  const handleTestLink = () => {
    if (!targetUrl) return;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-3">
      {/* Primary Big Glowing NFC Action Button */}
      <button
        onClick={onProgramNfc}
        disabled={!targetUrl}
        className="w-full relative group overflow-hidden rounded-2xl p-0.5 font-bold text-white shadow-xl shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/35 active:scale-[0.99]"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-400 group-hover:opacity-100 transition-opacity" />
        <span className="relative block px-6 py-4 rounded-[14px] bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-sky-500/90 group-hover:bg-opacity-90 flex items-center justify-center gap-3 text-base sm:text-lg">
          <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm">
            <Radio className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span>Program NFC Card</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white">
                Write NDEF
              </span>
            </div>
            <p className="text-xs text-blue-100 font-normal">
              {isNfcSupported
                ? 'Ready to tap NTAG213 / 215 / 216 card'
                : 'Tap to launch NFC Writer (Web NFC / Simulator)'}
            </p>
          </div>
        </span>
      </button>

      {/* Secondary Quick Action Buttons */}
      <div className="grid grid-cols-3 gap-2">
        {/* Test Review Link */}
        <button
          onClick={handleTestLink}
          disabled={!targetUrl}
          className="flex flex-col sm:flex-row items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/80 hover:border-slate-700 transition-all text-xs font-semibold disabled:opacity-50"
          title="Opens direct review dialog in a new tab"
        >
          <ExternalLink className="w-4 h-4 text-sky-400 shrink-0" />
          <span>Test Review Link</span>
        </button>

        {/* Copy URL */}
        <button
          onClick={onCopyUrl}
          disabled={!targetUrl}
          className="flex flex-col sm:flex-row items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/80 hover:border-slate-700 transition-all text-xs font-semibold disabled:opacity-50"
          title="Copy direct URL to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-emerald-400 font-bold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Copy URL</span>
            </>
          )}
        </button>

        {/* View / Download QR */}
        <button
          onClick={onOpenQrModal}
          disabled={!targetUrl}
          className="flex flex-col sm:flex-row items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/80 hover:border-slate-700 transition-all text-xs font-semibold disabled:opacity-50"
          title="Generate printable vector QR code"
        >
          <QrCode className="w-4 h-4 text-amber-400 shrink-0" />
          <span>QR Code</span>
        </button>
      </div>

      {/* Memory Tag Compatibility Bar */}
      <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <HardDrive className="w-3.5 h-3.5 text-slate-500" />
          <span>NDEF Payload:</span>
          <span className="font-mono font-bold text-slate-200">
            {byteSize} bytes
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className={isOverNtag213 ? 'text-amber-400' : 'text-emerald-400'}>
            NTAG213: {Math.round((byteSize / ntag213Max) * 100)}%
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400">
            NTAG215: {Math.round((byteSize / NFC_TAG_SPECS.NTAG215.userMemory) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};
