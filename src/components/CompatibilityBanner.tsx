import React, { useState } from 'react';
import { AlertTriangle, Smartphone, QrCode, X, ChevronDown, ChevronUp, ExternalLink, CheckCircle2 } from 'lucide-react';
import { getDeviceNfcInfo } from '../utils/nfc';

export const CompatibilityBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const info = getDeviceNfcInfo();

  if (dismissed || info.isSupported) {
    return null;
  }

  return (
    <div className="relative border-b border-amber-500/20 bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-slate-950 px-4 py-3 text-xs sm:text-sm">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="p-1 rounded-md bg-amber-500/10 text-amber-400 mt-0.5 shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-amber-200">
              Web NFC Notice: {info.isIos ? 'iOS Safari Restriction' : 'Browser Compatibility'}
            </p>
            <p className="text-amber-300/80 leading-relaxed text-xs">
              Web NFC is supported on <strong>Android Chrome</strong>. On iOS Safari or desktop, Web NFC writing is blocked by the browser. You can still test links, preview &amp; download high-res <strong>QR Codes</strong>, or write tags via the free <strong>NFC Tools</strong> app.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
          <button
            onClick={() => setShowIosGuide(!showIosGuide)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-medium text-xs transition-colors"
          >
            {showIosGuide ? 'Hide Workaround' : 'iOS Workaround Guide'}
            {showIosGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded text-amber-400/60 hover:text-amber-200 hover:bg-amber-500/10 transition-colors"
            title="Dismiss notice"
            aria-label="Dismiss notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showIosGuide && (
        <div className="max-w-5xl mx-auto mt-3 pt-3 border-t border-amber-500/20 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-amber-100/90">
          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-amber-500/20">
            <span className="font-bold text-amber-400 block mb-1">Step 1: Copy Review Link</span>
            Click "Copy Review URL" in TapReview once you choose your business.
          </div>
          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-amber-500/20">
            <span className="font-bold text-amber-400 block mb-1">Step 2: Open NFC Tools</span>
            Install free "NFC Tools" from the App Store &rarr; Tap "Write" &rarr; "Add a record" &rarr; "Custom URL / URI".
          </div>
          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-amber-500/20">
            <span className="font-bold text-amber-400 block mb-1">Step 3: Tap NFC Card</span>
            Paste link and tap your physical NFC card to the top edge of your iPhone!
          </div>
        </div>
      )}
    </div>
  );
};
