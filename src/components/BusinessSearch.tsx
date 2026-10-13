import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  MapPin, 
  Star, 
  CheckCircle, 
  Sparkles, 
  ChevronRight, 
  ExternalLink, 
  Copy, 
  RotateCcw,
  SlidersHorizontal,
  Link as LinkIcon,
  HelpCircle,
  Building2
} from 'lucide-react';
import { BusinessProfile } from '../types';
import { 
  searchBusinessPredictions, 
  fetchPlaceDetails, 
  SAMPLE_BUSINESSES,
  getStoredApiKey
} from '../utils/googlePlaces';
import { parseGoogleMapsUrl, buildDirectReviewUrl, buildCidReviewUrl } from '../utils/urlGenerator';

interface BusinessSearchProps {
  currentProfile: BusinessProfile | null;
  onSelectProfile: (profile: BusinessProfile) => void;
  activeUrlFormat: 'writereview' | 'cid' | 'searchIntent';
  onChangeUrlFormat: (format: 'writereview' | 'cid' | 'searchIntent') => void;
}

export const BusinessSearch: React.FC<BusinessSearchProps> = ({
  currentProfile,
  onSelectProfile,
  activeUrlFormat,
  onChangeUrlFormat,
}) => {
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState<Array<{
    description: string;
    placeId: string;
    mainText: string;
    secondaryText: string;
    isPreset?: boolean;
  }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [manualPlaceId, setManualPlaceId] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Search when query changes
  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchBusinessPredictions(query, getStoredApiKey());
      if (active) {
        setPredictions(results);
        setIsSearching(false);
      }
    }, 200);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  // Handle outside clicks to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectPrediction = async (placeId: string, mainText: string) => {
    setIsSearching(true);
    setIsDropdownOpen(false);
    const profile = await fetchPlaceDetails(placeId, mainText);
    onSelectProfile(profile);
    setIsSearching(false);
  };

  const handleManualPlaceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPlaceId.trim()) return;

    // Check if pasted value is a URL
    const parsed = parseGoogleMapsUrl(manualPlaceId.trim());
    if (parsed.placeId) {
      handleSelectPrediction(parsed.placeId, 'Custom Business Location');
      setManualPlaceId('');
      setShowManualInput(false);
      return;
    }

    if (parsed.cid) {
      const profile: BusinessProfile = {
        name: 'Custom Google Business (CID)',
        placeId: `CID_${parsed.cid}`,
        cid: parsed.cid,
        verified: true,
        address: `Google Maps CID: ${parsed.cid}`,
        rating: 5.0,
        userRatingsTotal: 100,
        reviewUrl: buildCidReviewUrl(parsed.cid),
        alternateUrl: `https://maps.google.com/?cid=${parsed.cid}`,
      };
      onSelectProfile(profile);
      setManualPlaceId('');
      setShowManualInput(false);
      return;
    }

    // Direct string as placeId
    handleSelectPrediction(manualPlaceId.trim(), 'Custom Business Location');
    setManualPlaceId('');
    setShowManualInput(false);
  };

  return (
    <div className="space-y-4">
      {/* Search Input Box */}
      <div className="relative" ref={dropdownRef}>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
          Step 1: Search Your Google Business Profile
        </label>
        <div className="relative flex items-center">
          <div className="absolute left-3.5 text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            placeholder="e.g. Joe's Coffee NYC, Apex Dental, or your business name..."
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-20 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
          />
          {isSearching && (
            <div className="absolute right-3 flex items-center gap-1.5 text-xs text-blue-400">
              <span className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-[11px] font-mono">Searching</span>
            </div>
          )}
        </div>

        {/* Autocomplete Predictions Dropdown */}
        {isDropdownOpen && predictions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto divide-y divide-slate-800/60 backdrop-blur-xl">
            <div className="px-3 py-1.5 bg-slate-950/70 text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Google Places Matches</span>
              <span className="font-mono text-slate-500">{predictions.length} found</span>
            </div>
            {predictions.map((p) => (
              <button
                key={p.placeId}
                onClick={() => handleSelectPrediction(p.placeId, p.mainText)}
                className="w-full text-left px-3.5 py-2.5 hover:bg-slate-800/80 flex items-start gap-3 transition-colors group"
              >
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 mt-0.5 shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-100 truncate group-hover:text-blue-300 transition-colors">
                      {p.mainText}
                    </span>
                    {p.isPreset && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        Demo
                      </span>
                    )}
                  </div>
                  {p.secondaryText && (
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {p.secondaryText}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-600 font-mono mt-0.5 truncate">
                    ID: {p.placeId}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 self-center shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Demo Preset Chips */}
      <div>
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span className="text-[11px] font-medium text-slate-400">Quick Test Profiles:</span>
          <button
            type="button"
            onClick={() => setShowManualInput(!showManualInput)}
            className="text-[11px] text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
          >
            <SlidersHorizontal className="w-3 h-3" />
            {showManualInput ? 'Hide Place ID / URL Input' : 'Paste Maps Link / Place ID'}
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SAMPLE_BUSINESSES.map((b) => {
            const isSelected = currentProfile?.placeId === b.placeId;
            return (
              <button
                key={b.placeId}
                onClick={() => onSelectProfile(b)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-400 shadow-sm shadow-blue-500/30'
                    : 'bg-slate-900/80 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                }`}
              >
                <Building2 className="w-3 h-3 opacity-70" />
                <span>{b.name.split(' ')[0]} {b.name.split(' ')[1] || ''}</span>
                <span className="text-[10px] opacity-75 font-mono">★{b.rating}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Optional Manual Place ID or URL Parser Accordion */}
      {showManualInput && (
        <form onSubmit={handleManualPlaceSubmit} className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200">
              Direct Google Maps Link or Place ID
            </span>
            <span className="text-[10px] text-slate-500">Auto-detects Place ID &amp; CID</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualPlaceId}
              onChange={(e) => setManualPlaceId(e.target.value)}
              placeholder="Paste Google Maps URL (maps.google.com/...) or Place ID (ChIJ...)"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
            >
              Parse &amp; Apply
            </button>
          </div>
        </form>
      )}

      {/* Current Verified Business Summary Card */}
      {currentProfile && (
        <div className="bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950 p-4 rounded-2xl border border-slate-800 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-3 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Business Header with Rating */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base text-white tracking-tight">
                  {currentProfile.name}
                </h3>
                {currentProfile.verified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    Verified Profile
                  </span>
                )}
              </div>

              {currentProfile.address && (
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{currentProfile.address}</span>
                </p>
              )}
            </div>

            {/* Rating Badge */}
            {currentProfile.rating && (
              <div className="bg-slate-950/80 px-2.5 py-1.5 rounded-xl border border-slate-800 text-right shrink-0">
                <div className="flex items-center gap-1 text-amber-400 font-bold text-sm">
                  <span>{currentProfile.rating.toFixed(1)}</span>
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                </div>
                {currentProfile.userRatingsTotal && (
                  <span className="text-[10px] text-slate-500 font-mono block">
                    {currentProfile.userRatingsTotal.toLocaleString()} reviews
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Place ID & URL Format Chooser */}
          <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Target Review Link Format:
              </span>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
                <button
                  type="button"
                  onClick={() => onChangeUrlFormat('writereview')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    activeUrlFormat === 'writereview'
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Direct 1-tap review pop-up dialog (Recommended)"
                >
                  writereview (Recommended)
                </button>
                {currentProfile.cid && (
                  <button
                    type="button"
                    onClick={() => onChangeUrlFormat('cid')}
                    className={`px-2 py-0.5 rounded font-medium transition-colors ${
                      activeUrlFormat === 'cid'
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Legacy Maps CID URL"
                  >
                    CID Format
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onChangeUrlFormat('searchIntent')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    activeUrlFormat === 'searchIntent'
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Search Intent URL"
                >
                  Search Intent
                </button>
              </div>
            </div>

            {/* Active URL string snippet */}
            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <LinkIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="text-xs font-mono text-blue-200/90 truncate">
                  {activeUrlFormat === 'writereview'
                    ? currentProfile.reviewUrl
                    : activeUrlFormat === 'cid' && currentProfile.alternateUrl
                    ? currentProfile.alternateUrl
                    : currentProfile.searchIntentUrl || currentProfile.reviewUrl}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono shrink-0">
                Place ID: {currentProfile.placeId.slice(0, 8)}...
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
