import React from 'react';
import { CheckCircle2, ShieldCheck, Sparkles, FileText } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/10 bg-[#0B1422] text-[#94A3B8] py-8 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <img src="/brand/voxalign-icon.svg" alt="VoxAlign Icon" className="w-6 h-6" />
            <span className="font-heading font-semibold text-white">VoxAlign</span>
            <span className="text-xs text-[#94A3B8]">
              — "Every Word. Every Second. Aligned."
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-[#52DDBB] bg-[#52DDBB]/10 px-2.5 py-1 rounded-full border border-[#52DDBB]/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Hindi hi_IN Guidelines Engine Active
            </span>
            <span className="flex items-center gap-1.5 text-[#64C8FF] bg-[#64C8FF]/10 px-2.5 py-1 rounded-full border border-[#64C8FF]/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Page 17 Checklist Compliant
            </span>
            <span className="text-xs text-[#64748B]">
              v2.4 Production Edition
            </span>
          </div>

        </div>
      </div>
    </footer>
  );
};
