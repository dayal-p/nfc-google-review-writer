import React, { useState } from 'react';
import { X, Key, Check, Info, ExternalLink, Trash2 } from 'lucide-react';
import { getStoredApiKey, setStoredApiKey, loadGoogleMapsScript } from '../utils/googlePlaces';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveKey: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSaveKey,
}) => {
  const [apiKey, setApiKey] = useState(getStoredApiKey());
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStoredApiKey(apiKey.trim());
    if (apiKey.trim()) {
      await loadGoogleMapsScript(apiKey.trim());
    }
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onSaveKey();
      onClose();
    }, 800);
  };

  const handleClear = () => {
    setApiKey('');
    setStoredApiKey('');
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onSaveKey();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">
                Google Places API Key
              </h3>
              <p className="text-xs text-slate-400">
                Optional: Enable live global search
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

        {/* Content */}
        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              API Key (Places API Enabled)
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            />
          </div>

          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2 text-xs text-slate-300">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-slate-200">
                  Works out-of-the-box without a key:
                </p>
                <p className="text-slate-400 text-[11px] leading-relaxed mt-0.5">
                  TapReview includes preset verified profiles and an automatic Google Maps URL / Place ID extractor. Adding your personal Google Maps API Key unlocks live worldwide business autocomplete queries.
                </p>
              </div>
            </div>

            <a
              href="https://developers.google.com/maps/documentation/places/web-service/get-api-key"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-medium"
            >
              <span>Get a Google Maps API Key from Google Cloud</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-white text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 transition-all"
            >
              {isSaved ? <Check className="w-4 h-4 text-white" /> : null}
              <span>{isSaved ? 'Key Saved!' : 'Save API Key'}</span>
            </button>

            {apiKey && (
              <button
                type="button"
                onClick={handleClear}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 text-xs font-semibold flex items-center gap-1 transition-colors"
                title="Clear Key"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
