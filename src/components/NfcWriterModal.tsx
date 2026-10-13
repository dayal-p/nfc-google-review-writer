import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  Radio, 
  Wifi, 
  Smartphone, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Unlock, 
  RotateCcw, 
  ShieldAlert,
  Play,
  Volume2
} from 'lucide-react';
import { NfcWriteState } from '../types';
import { isWebNfcSupported, writeUrlToNfc, getDeviceNfcInfo } from '../utils/nfc';
import { soundEffects } from '../utils/audio';

interface NfcWriterModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUrl: string;
  businessName: string;
}

export const NfcWriterModal: React.FC<NfcWriterModalProps> = ({
  isOpen,
  onClose,
  targetUrl,
  businessName,
}) => {
  const [state, setState] = useState<NfcWriteState>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('Ready to begin');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [lockTag, setLockTag] = useState<boolean>(false);
  const [showLockConfirm, setShowLockConfirm] = useState<boolean>(false);
  const [isSimulated, setIsSimulated] = useState<boolean>(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const deviceInfo = getDeviceNfcInfo();

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setState('idle');
      setErrorMessage('');
      setStatusMessage('Click "Start NFC Write" and hold your card against the device.');
      setIsSimulated(!isWebNfcSupported());
    } else {
      // Abort any ongoing write if closed
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    }
  }, [isOpen]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#6366f1'],
    });
  };

  const handleStartWrite = async () => {
    setErrorMessage('');
    soundEffects.playScanTone();

    // Check if simulation mode (desktop or Web NFC unsupported)
    if (!isWebNfcSupported() || isSimulated) {
      setState('ready');
      setStatusMessage('Simulating Web NFC: Waiting for NFC card tap...');

      const timer1 = setTimeout(() => {
        setState('writing');
        setStatusMessage('Writing NDEF URL record to simulated NTAG213 tag...');
      }, 1200);

      const timer2 = setTimeout(() => {
        setState('success');
        setStatusMessage(
          lockTag
            ? 'Success! Tag programmed & permanently locked.'
            : 'Success! NDEF Review URL programmed onto tag.'
        );
        soundEffects.playSuccessChime();
        soundEffects.triggerHaptic();
        triggerConfetti();
      }, 2400);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }

    // Real Web NFC API execution
    try {
      const controller = new AbortController();
      abortControllerRef.current = controller;
      setState('ready');
      setStatusMessage('Hold your NFC card or tag against the back of your phone...');

      const result = await writeUrlToNfc(targetUrl, {
        lockTag,
        signal: controller.signal,
        onStatusChange: (status) => {
          if (status === 'writing') {
            setState('writing');
            setStatusMessage('Writing NDEF URL record to physical tag...');
          } else if (status === 'locking') {
            setStatusMessage('Finalizing: Locking NFC tag as read-only...');
          }
        },
      });

      if (result.success) {
        setState('success');
        setStatusMessage(
          result.locked
            ? 'Success! Tag programmed & permanently locked.'
            : 'Success! Tag programmed with direct review trigger!'
        );
        soundEffects.playSuccessChime();
        soundEffects.triggerHaptic();
        triggerConfetti();
      } else {
        setState('error');
        setErrorMessage(result.error || 'Failed to program NFC tag.');
        soundEffects.playErrorTone();
      }
    } catch (err: unknown) {
      const error = err as Error;
      setState('error');
      setErrorMessage(error.message || 'Unexpected NFC communication failure.');
      soundEffects.playErrorTone();
    } finally {
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setState('idle');
    setStatusMessage('Operation cancelled.');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">
                Web NFC Programmer
              </h3>
              <p className="text-xs text-slate-400">
                {businessName || 'Google Review Card'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target URL Payload Preview */}
        <div className="mt-4 p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              Writing NDEF Payload:
            </span>
            <span className="font-mono text-[10px] text-blue-400">Type: URI</span>
          </div>
          <div className="font-mono text-blue-200 text-xs truncate bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800">
            {targetUrl}
          </div>
        </div>

        {/* State Machine Visualizer */}
        <div className="my-6 flex flex-col items-center justify-center text-center">
          {/* Animated Graphic based on state */}
          {state === 'idle' && (
            <div className="relative my-4">
              <div className="w-24 h-24 rounded-full bg-slate-800/80 border-2 border-slate-700 flex items-center justify-center">
                <Smartphone className="w-10 h-10 text-slate-400" />
              </div>
            </div>
          )}

          {(state === 'ready' || state === 'writing') && (
            <div className="relative my-4">
              {/* Pulsing NFC Ripple Waves */}
              <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
              <div className="absolute -inset-4 rounded-full bg-indigo-500/10 animate-pulse" />
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/40 relative z-10">
                <Wifi className="w-10 h-10 text-white rotate-90 animate-pulse" />
              </div>
            </div>
          )}

          {state === 'success' && (
            <div className="relative my-4">
              <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-400/50 flex items-center justify-center shadow-xl shadow-emerald-500/30">
                <CheckCircle2 className="w-12 h-12 text-emerald-400" />
              </div>
            </div>
          )}

          {state === 'error' && (
            <div className="relative my-4">
              <div className="w-24 h-24 rounded-full bg-rose-500/20 border-2 border-rose-500/50 flex items-center justify-center shadow-xl shadow-rose-500/30">
                <AlertTriangle className="w-12 h-12 text-rose-400" />
              </div>
            </div>
          )}

          {/* Status Message */}
          <h4 className="text-base font-bold text-white mt-2">
            {state === 'idle' && 'Ready to Write NFC Tag'}
            {state === 'ready' && 'Ready to Tap! Hold Card to Phone'}
            {state === 'writing' && 'Writing NDEF Record...'}
            {state === 'success' && 'NFC Tag Programmed Successfully!'}
            {state === 'error' && 'NFC Write Failed'}
          </h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            {errorMessage || statusMessage}
          </p>

          {/* Non-supported simulation flag */}
          {!deviceInfo.isSupported && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]">
              <span>Hardware Notice: Operating in Interactive Simulation Mode</span>
            </div>
          )}
        </div>

        {/* Lock Tag Warning & Toggle */}
        <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2 mb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
                {lockTag ? <Lock className="w-4 h-4 text-rose-400" /> : <Unlock className="w-4 h-4 text-slate-400" />}
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-200 block">
                  Lock Tag (Make Permanently Read-Only)
                </span>
                <span className="text-[10px] text-slate-500">
                  Prevents customers or competitors from overwriting your card
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!lockTag) {
                  setShowLockConfirm(true);
                } else {
                  setLockTag(false);
                }
              }}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                lockTag ? 'bg-rose-600' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                  lockTag ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {lockTag && (
            <p className="text-[11px] text-rose-400 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20 flex items-start gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>
                <strong>Warning:</strong> Locking is irreversible! Once locked, this physical NFC card can never be rewritten or modified.
              </span>
            </p>
          )}
        </div>

        {/* Confirmation Modal for Permanent Lock */}
        {showLockConfirm && (
          <div className="p-3.5 bg-rose-950/80 border border-rose-500/40 rounded-2xl mb-4 space-y-2.5 animate-fade-in text-xs">
            <div className="flex items-center gap-2 text-rose-300 font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Confirm Permanent NFC Tag Lock?</span>
            </div>
            <p className="text-rose-200/80 text-[11px] leading-relaxed">
              Standard NTAG213/215/216 chips contain permanent lock bits. Once written with read-only flags, <strong>no app or reader can ever unlock it</strong>.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setLockTag(true);
                  setShowLockConfirm(false);
                }}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs"
              >
                Yes, Lock Permanently
              </button>
              <button
                type="button"
                onClick={() => setShowLockConfirm(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {state === 'idle' || state === 'error' ? (
            <button
              onClick={handleStartWrite}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 font-bold text-white shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 text-sm transition-all"
            >
              <Play className="w-4 h-4" />
              <span>Start NFC Write</span>
            </button>
          ) : state === 'ready' || state === 'writing' ? (
            <button
              onClick={handleCancel}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-colors"
            >
              Cancel Operation
            </button>
          ) : (
            <button
              onClick={handleStartWrite}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 text-sm transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Program Another Card</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
