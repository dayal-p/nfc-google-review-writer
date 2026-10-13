import React from 'react';
import { Search, ExternalLink, Radio, CheckCircle2 } from 'lucide-react';

export const StepsGuide: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Find Business or Link',
      desc: 'Search your Google profile or paste your custom review URL.',
      icon: Search,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    },
    {
      step: '02',
      title: 'Verify Direct Pop-Up',
      desc: 'Click "Test Link" to confirm the 5-star Google review box appears directly.',
      icon: ExternalLink,
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    },
    {
      step: '03',
      title: 'Tap Card to Program',
      desc: 'Hold physical NTAG213/215/216 NFC card to your phone to burn the URL.',
      icon: Radio,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {steps.map((s) => {
        const Icon = s.icon;
        return (
          <div
            key={s.step}
            className="p-3.5 bg-slate-900/60 rounded-2xl border border-slate-800/80 flex items-start gap-3 relative overflow-hidden"
          >
            <div className={`p-2 rounded-xl border ${s.color} shrink-0 mt-0.5`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="font-mono text-[10px] font-bold text-slate-500">
                  STEP {s.step}
                </span>
              </div>
              <h4 className="text-xs font-bold text-white leading-tight">
                {s.title}
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                {s.desc}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
