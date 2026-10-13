import React, { useState } from 'react';
import { 
  Globe, 
  Link2, 
  User, 
  AlertCircle, 
  CheckCircle, 
  Sparkles, 
  Layers, 
  ExternalLink 
} from 'lucide-react';
import { CustomProfile, PlatformType } from '../types';
import { isValidHttps, isValidUrl } from '../utils/urlGenerator';

interface CustomUrlInputProps {
  customProfile: CustomProfile;
  onChangeProfile: (profile: CustomProfile) => void;
}

const PLATFORMS: Array<{
  id: PlatformType;
  name: string;
  placeholder: string;
  defaultName: string;
  color: string;
}> = [
  {
    id: 'google',
    name: 'Google Maps Link',
    placeholder: 'https://maps.app.goo.gl/... or https://g.page/r/.../review',
    defaultName: 'Alex Photography Studio',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    id: 'trustpilot',
    name: 'Trustpilot',
    placeholder: 'https://www.trustpilot.com/evaluate/yourdomain.com',
    defaultName: 'Apex Cloud Solutions',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'tripadvisor',
    name: 'Tripadvisor',
    placeholder: 'https://www.tripadvisor.com/UserReview-...',
    defaultName: 'Villa Azure Boutique Stay',
    color: 'from-amber-500 to-emerald-500',
  },
  {
    id: 'yelp',
    name: 'Yelp Review',
    placeholder: 'https://www.yelp.com/writeareview/biz/...',
    defaultName: 'Classic Barber & Co.',
    color: 'from-red-500 to-orange-500',
  },
  {
    id: 'custom',
    name: 'Direct Website / Linktree',
    placeholder: 'https://linktr.ee/yourbrand or https://yourdomain.com/review',
    defaultName: 'Freelance Design by Maya',
    color: 'from-purple-500 to-pink-500',
  },
];

export const CustomUrlInput: React.FC<CustomUrlInputProps> = ({
  customProfile,
  onChangeProfile,
}) => {
  const isHttps = isValidHttps(customProfile.url);
  const isGeneralUrl = isValidUrl(customProfile.url);

  const handlePlatformChange = (p: typeof PLATFORMS[0]) => {
    onChangeProfile({
      ...customProfile,
      platform: p.id,
      name: customProfile.name || p.defaultName,
    });
  };

  const handleUrlChange = (newUrl: string) => {
    onChangeProfile({
      ...customProfile,
      url: newUrl,
    });
  };

  const handleNameChange = (newName: string) => {
    onChangeProfile({
      ...customProfile,
      name: newName,
    });
  };

  const handleSlugChange = (newSlug: string) => {
    onChangeProfile({
      ...customProfile,
      intentSlug: newSlug,
    });
  };

  // Compute final effective URL with intent slug
  const getComputedUrl = () => {
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
  };

  return (
    <div className="space-y-4">
      {/* Platform Preset Chips */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
          Destination Type / Preset:
        </label>
        <div className="flex flex-wrap gap-1.5">
          {PLATFORMS.map((p) => {
            const isSelected = customProfile.platform === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePlatformChange(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/20'
                    : 'bg-slate-900/90 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                }`}
              >
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Profile/Display Name Input */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
          Display / Business Name
        </label>
        <div className="relative">
          <div className="absolute left-3.5 top-3 text-slate-400">
            <User className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={customProfile.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Maya Photography, John Doe Consulting, Apex Studio..."
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Target URL Input with validation */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Direct Target URL / Review Page
          </label>
          <span className="text-[11px] font-mono text-slate-500">
            Requires secure https://
          </span>
        </div>
        <div className="relative">
          <div className="absolute left-3.5 top-3 text-slate-400">
            <Link2 className="w-4 h-4" />
          </div>
          <input
            type="url"
            value={customProfile.url}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://g.page/r/.../review or https://trustpilot.com/..."
            className={`w-full bg-slate-900/90 border rounded-xl pl-10 pr-24 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all shadow-sm font-mono text-xs ${
              !customProfile.url
                ? 'border-slate-700/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50'
                : isHttps
                ? 'border-emerald-500/70 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30'
                : 'border-rose-500/70 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/30'
            }`}
          />
          <div className="absolute right-3 top-2.5 flex items-center gap-1.5">
            {customProfile.url && isHttps && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <CheckCircle className="w-3 h-3" />
                Valid HTTPS
              </span>
            )}
            {customProfile.url && !isHttps && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                <AlertCircle className="w-3 h-3" />
                Needs HTTPS
              </span>
            )}
          </div>
        </div>

        {customProfile.url && !isHttps && isGeneralUrl && (
          <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            NFC tags and mobile browsers strictly require encrypted HTTPS links. Please use https://.
          </p>
        )}
      </div>

      {/* Optional Tracking / Intent Slug */}
      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300">
            Optional Tracking Slug / Parameter
          </label>
          <span className="text-[10px] text-slate-500">e.g. UTM analytics</span>
        </div>
        <input
          type="text"
          value={customProfile.intentSlug || ''}
          onChange={(e) => handleSlugChange(e.target.value)}
          placeholder="utm_source=nfc_card&utm_medium=offline"
          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 font-mono focus:outline-none focus:border-blue-500"
        />
        {customProfile.intentSlug && (
          <p className="text-[11px] font-mono text-slate-400 truncate">
            Final Link: <span className="text-blue-300">{getComputedUrl()}</span>
          </p>
        )}
      </div>
    </div>
  );
};
