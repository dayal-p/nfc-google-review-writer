import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Radio, Wifi, Star, Sparkles, RefreshCw, Layers } from 'lucide-react';
import { CardFinish } from '../types';

interface CardMockupProps {
  businessName: string;
  targetUrl: string;
  rating?: number;
  isVerified?: boolean;
}

export const CardMockup: React.FC<CardMockupProps> = ({
  businessName,
  targetUrl,
  rating = 5.0,
}) => {
  const [finish, setFinish] = useState<CardFinish>('matte-black');
  const [isFlipped, setIsFlipped] = useState(false);

  // Dynamic finish styles
  const finishStyles = {
    'matte-black': {
      cardBg: 'bg-gradient-to-br from-zinc-900 via-neutral-950 to-zinc-900',
      border: 'border-zinc-800 shadow-2xl shadow-black/80',
      textColor: 'text-zinc-100',
      subTextColor: 'text-zinc-400',
      accentColor: 'text-amber-400',
      goldBadge: 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black font-extrabold',
      waveColor: 'text-zinc-400',
      qrBg: '#ffffff',
      qrFg: '#09090b',
    },
    'matte-white': {
      cardBg: 'bg-gradient-to-br from-slate-50 via-white to-slate-100',
      border: 'border-slate-300/80 shadow-2xl shadow-slate-900/40',
      textColor: 'text-slate-900',
      subTextColor: 'text-slate-600',
      accentColor: 'text-blue-600',
      goldBadge: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold',
      waveColor: 'text-slate-700',
      qrBg: '#ffffff',
      qrFg: '#0f172a',
    },
    'brushed-gold': {
      cardBg: 'bg-gradient-to-br from-amber-700 via-yellow-600 to-amber-900',
      border: 'border-amber-400/50 shadow-2xl shadow-amber-950/60',
      textColor: 'text-amber-50',
      subTextColor: 'text-amber-200/80',
      accentColor: 'text-yellow-300',
      goldBadge: 'bg-black text-amber-300 font-extrabold',
      waveColor: 'text-amber-200',
      qrBg: '#ffffff',
      qrFg: '#451a03',
    },
    'midnight-blue': {
      cardBg: 'bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950',
      border: 'border-blue-500/30 shadow-2xl shadow-indigo-950/60',
      textColor: 'text-white',
      subTextColor: 'text-blue-200/80',
      accentColor: 'text-sky-400',
      goldBadge: 'bg-gradient-to-r from-sky-400 to-blue-500 text-slate-950 font-bold',
      waveColor: 'text-sky-400',
      qrBg: '#ffffff',
      qrFg: '#030712',
    },
  }[finish];

  return (
    <div className="flex flex-col items-center">
      {/* Finish Selector & Flip button */}
      <div className="w-full flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setFinish('matte-black')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
              finish === 'matte-black'
                ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-950 border border-zinc-600 inline-block" />
            <span>Matte Black</span>
          </button>
          <button
            onClick={() => setFinish('matte-white')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
              finish === 'matte-white'
                ? 'bg-slate-200 text-slate-900 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-400 inline-block" />
            <span>Pure White</span>
          </button>
          <button
            onClick={() => setFinish('brushed-gold')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 hidden sm:flex ${
              finish === 'brushed-gold'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            <span>Gold PVC</span>
          </button>
        </div>

        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium hover:border-slate-700 transition-colors"
        >
          <RefreshCw className="w-3 h-3 text-blue-400" />
          <span>{isFlipped ? 'Show Front' : 'Flip Card'}</span>
        </button>
      </div>

      {/* 3D NFC Card Container (Standard ISO/IEC 7810 ID-1 proportions 1.586:1) */}
      <div className="relative w-full max-w-[400px] aspect-[1.586/1] perspective-1000 group">
        <div
          className={`relative w-full h-full rounded-2xl border ${finishStyles.border} ${finishStyles.cardBg} p-5 sm:p-6 transition-all duration-500 overflow-hidden select-none flex flex-col justify-between`}
        >
          {/* Subtle tactile texture overlay & holographic sheen */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.04] via-transparent to-white/[0.06] pointer-events-none" />
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          {!isFlipped ? (
            /* FRONT OF CARD */
            <>
              {/* Header row: Google Review banner & Contactless NFC icon */}
              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-2">
                  {/* Google 4-color 'G' icon */}
                  <div className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center p-1.5 shrink-0">
                    <svg viewBox="0 0 24 24" className="w-full h-full">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  </div>
                  <div>
                    <span className={`text-[10px] tracking-wider uppercase font-extrabold ${finishStyles.subTextColor} block`}>
                      Review us on
                    </span>
                    <span className={`text-base font-extrabold tracking-tight ${finishStyles.textColor}`}>
                      Google
                    </span>
                  </div>
                </div>

                {/* Contactless Wave symbol */}
                <div className="flex items-center gap-1 text-right">
                  <div className={`p-1.5 rounded-full ${finishStyles.waveColor} relative`}>
                    <Wifi className="w-5 h-5 rotate-90" />
                    <span className="absolute -inset-0.5 rounded-full border border-current opacity-30 animate-ping" />
                  </div>
                </div>
              </div>

              {/* Middle: 5-Stars & Call-To-Action */}
              <div className="my-auto py-2 relative z-10">
                <div className="flex items-center gap-1.5 mb-1.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400 text-amber-400 drop-shadow-sm"
                    />
                  ))}
                  <span className={`text-xs font-bold ml-1 ${finishStyles.textColor}`}>
                    5.0
                  </span>
                </div>
                <h4 className={`text-base sm:text-lg font-black tracking-tight line-clamp-1 ${finishStyles.textColor}`}>
                  {businessName || 'Your Business Name'}
                </h4>
                <p className={`text-[11px] font-medium ${finishStyles.subTextColor} mt-0.5`}>
                  Tap phone here or scan QR on reverse to review
                </p>
              </div>

              {/* Bottom: Contactless Tap Prompt bar */}
              <div className="relative z-10 pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5 font-semibold tracking-wide uppercase">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className={finishStyles.subTextColor}>Instant Tap to Rate</span>
                </div>
                <div className="font-mono text-[9px] opacity-60 uppercase tracking-widest">
                  NFC • NTAG213/215
                </div>
              </div>
            </>
          ) : (
            /* BACK OF CARD: QR Code & Direct Scan */
            <div className="h-full flex items-center justify-between gap-4 relative z-10">
              <div className="space-y-2 flex-1">
                <span className={`text-[10px] uppercase font-bold tracking-wider ${finishStyles.subTextColor}`}>
                  Backup QR Scanner
                </span>
                <h4 className={`text-sm sm:text-base font-bold ${finishStyles.textColor} leading-tight`}>
                  Scan to leave your feedback
                </h4>
                <p className={`text-[10px] ${finishStyles.subTextColor} leading-relaxed`}>
                  Compatible with all iPhone &amp; Android camera scanners.
                </p>
                <div className="pt-2">
                  <span className={`inline-block text-[9px] font-mono px-2 py-0.5 rounded ${finishStyles.goldBadge}`}>
                    TAP • SCAN • REVIEW
                  </span>
                </div>
              </div>

              {/* Crisp embedded QR code */}
              <div className="bg-white p-2 rounded-xl shadow-lg shrink-0">
                <QRCodeSVG
                  value={targetUrl || 'https://search.google.com'}
                  size={92}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="M"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
        <span>Standard ISO/IEC 7810 ID-1 card (85.6 × 54 mm) format preview</span>
      </p>
    </div>
  );
};
