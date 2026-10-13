import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CompatibilityBanner } from './components/CompatibilityBanner';
import { ModeSelector } from './components/ModeSelector';
import { BusinessSearch } from './components/BusinessSearch';
import { CustomUrlInput } from './components/CustomUrlInput';
import { CardMockup } from './components/CardMockup';
import { ActionToolbar } from './components/ActionToolbar';
import { NfcWriterModal } from './components/NfcWriterModal';
import { QrCodeModal } from './components/QrCodeModal';
import { SettingsModal } from './components/SettingsModal';
import { StepsGuide } from './components/StepsGuide';
import { ToastContainer } from './components/Toast';
import { 
  ModeType, 
  BusinessProfile, 
  CustomProfile, 
  ToastMessage, 
  NFC_TAG_SPECS 
} from './types';
import { SAMPLE_BUSINESSES, getStoredApiKey, loadGoogleMapsScript } from './utils/googlePlaces';
import { isWebNfcSupported } from './utils/nfc';
import { Cpu, ShieldCheck, Sparkles, ExternalLink, HelpCircle } from 'lucide-react';

export function App() {
  const [mode, setMode] = useState<ModeType>('places');
  const [currentBusiness, setCurrentBusiness] = useState<BusinessProfile>(SAMPLE_BUSINESSES[0]);
  const [customProfile, setCustomProfile] = useState<CustomProfile>({
    name: 'Maya Studio & Design',
    url: 'https://search.google.com/local/writereview?placeid=ChIJc-2jE_1ZwokRnA0EwR3g37o',
    platform: 'google',
    intentSlug: 'utm_source=nfc_card',
  });
  const [urlFormat, setUrlFormat] = useState<'writereview' | 'cid' | 'searchIntent'>('writereview');

  // Modals & State
  const [isNfcModalOpen, setIsNfcModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [copied, setCopied] = useState(false);

  // Initialize Google Maps script if key exists
  useEffect(() => {
    const key = getStoredApiKey();
    if (key) {
      loadGoogleMapsScript(key);
    }
  }, []);

  const addToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Compute active target URL
  const getActiveTargetUrl = (): string => {
    if (mode === 'places') {
      if (!currentBusiness) return '';
      if (urlFormat === 'writereview') return currentBusiness.reviewUrl;
      if (urlFormat === 'cid' && currentBusiness.alternateUrl) return currentBusiness.alternateUrl;
      if (urlFormat === 'searchIntent' && currentBusiness.searchIntentUrl) return currentBusiness.searchIntentUrl;
      return currentBusiness.reviewUrl;
    } else {
      if (!customProfile.url) return '';
      if (!customProfile.intentSlug) return customProfile.url;
      try {
        const url = new URL(customProfile.url);
        const slug = customProfile.intentSlug.startsWith('?') || customProfile.intentSlug.startsWith('#')
          ? customProfile.intentSlug
          : `?${customProfile.intentSlug}`;
        return `${url.origin}${url.pathname}${url.search ? `${url.search}&${slug.slice(1)}` : slug}`;
      } catch {
        return customProfile.url;
      }
    }
  };

  const getActiveDisplayName = (): string => {
    return mode === 'places'
      ? currentBusiness?.name || 'Verified Google Business'
      : customProfile.name || 'Custom Profile';
  };

  const handleCopyUrl = async () => {
    const url = getActiveTargetUrl();
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      addToast('Review trigger URL copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast('Could not access clipboard.', 'error');
    }
  };

  const activeTargetUrl = getActiveTargetUrl();
  const activeDisplayName = getActiveDisplayName();
  const nfcSupported = isWebNfcSupported();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Header
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenHelp={() => setIsQrModalOpen(true)}
      />

      {/* Browser / Device Compatibility Notice */}
      <CompatibilityBanner />

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 sm:py-8 space-y-6">
        {/* Step-by-Step Workflow Guide */}
        <StepsGuide />

        {/* Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Input and URL Generation Modes */}
          <div className="lg:col-span-7 space-y-4">
            {/* Mode Selector Tabs */}
            <ModeSelector currentMode={mode} onSelectMode={setMode} />

            {/* Mode A / Mode B Content */}
            <div className="bg-slate-900/40 p-4 sm:p-5 rounded-3xl border border-slate-800/80 backdrop-blur-sm shadow-xl">
              {mode === 'places' ? (
                <BusinessSearch
                  currentProfile={currentBusiness}
                  onSelectProfile={setCurrentBusiness}
                  activeUrlFormat={urlFormat}
                  onChangeUrlFormat={setUrlFormat}
                />
              ) : (
                <CustomUrlInput
                  customProfile={customProfile}
                  onChangeProfile={setCustomProfile}
                />
              )}
            </div>

            {/* Physical NFC Tag Chip Specs Info */}
            <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800/80 text-xs">
              <div className="flex items-center gap-2 mb-2.5 text-slate-300 font-semibold">
                <Cpu className="w-4 h-4 text-blue-400" />
                <span>Recommended NFC Tag Chips (NXP NTAG Series)</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
                  <span className="font-bold text-slate-200 block">NTAG213</span>
                  <span className="text-[10px] text-slate-400">144 usable bytes</span>
                  <span className="text-[10px] text-emerald-400 font-medium block mt-1">
                    ✓ Fits direct URLs
                  </span>
                </div>
                <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
                  <span className="font-bold text-slate-200 block">NTAG215</span>
                  <span className="text-[10px] text-slate-400">504 usable bytes</span>
                  <span className="text-[10px] text-blue-400 font-medium block mt-1">
                    ✓ Extra headroom
                  </span>
                </div>
                <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
                  <span className="font-bold text-slate-200 block">NTAG216</span>
                  <span className="text-[10px] text-slate-400">888 usable bytes</span>
                  <span className="text-[10px] text-indigo-400 font-medium block mt-1">
                    ✓ Longest payloads
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Physical Card Mockup & Action Controls */}
          <div className="lg:col-span-5 space-y-5">
            {/* Real-time PVC Card Mockup */}
            <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-800/80 backdrop-blur-sm shadow-xl flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  Live NFC Card Preview
                </span>
                <span className="text-[10px] font-mono text-slate-500">Product Mate Style</span>
              </div>

              <CardMockup
                businessName={activeDisplayName}
                targetUrl={activeTargetUrl}
                rating={mode === 'places' ? currentBusiness?.rating : 5.0}
                isVerified={mode === 'places' ? currentBusiness?.verified : true}
              />
            </div>

            {/* Action Buttons Toolbar */}
            <div className="bg-slate-900/40 p-4 sm:p-5 rounded-3xl border border-slate-800/80 backdrop-blur-sm shadow-xl">
              <ActionToolbar
                targetUrl={activeTargetUrl}
                onProgramNfc={() => setIsNfcModalOpen(true)}
                onOpenQrModal={() => setIsQrModalOpen(true)}
                onCopyUrl={handleCopyUrl}
                copied={copied}
                isNfcSupported={nfcSupported}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} TapReview • Direct Google Review NFC Programmer</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Web NFC API (W3C)</span>
            <span>•</span>
            <span>Google Places API</span>
            <span>•</span>
            <span>NXP NTAG213/215/216</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <NfcWriterModal
        isOpen={isNfcModalOpen}
        onClose={() => setIsNfcModalOpen(false)}
        targetUrl={activeTargetUrl}
        businessName={activeDisplayName}
      />

      <QrCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        targetUrl={activeTargetUrl}
        businessName={activeDisplayName}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSaveKey={() => addToast('Google Places API configuration updated!', 'success')}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default App;
