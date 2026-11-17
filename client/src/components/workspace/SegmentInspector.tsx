import React from 'react';
import { 
  Sliders, Clock, Mic, CheckCircle2, AlertCircle, 
  HelpCircle, Sparkles, Tag, ShieldAlert, Globe 
} from 'lucide-react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { CANONICAL_HINDI_HESITATION, CANONICAL_HINDI_THINKING } from '../../utils/hindiValidator';
import { SUPPORTED_LANGUAGES, LanguageCode } from '../../types';

export const SegmentInspector: React.FC = () => {
  const {
    segments,
    speakers,
    selectedSegmentId,
    updateSegmentText,
    updateSegmentTimestamps,
    updateSegmentSpeaker,
    updateSegmentLanguage,
    toggleSegmentStatus
  } = useWorkspaceStore();

  const segment = segments.find(s => s.id === selectedSegmentId);

  if (!segment) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm flex flex-col items-center justify-center h-full">
        <Sliders className="w-8 h-8 mb-2 opacity-30 text-[#52DDBB]" />
        <p>No segment selected.</p>
        <p className="text-xs text-slate-600 mt-1">Click a word in the transcript or waveform to inspect its properties.</p>
      </div>
    );
  }

  const duration = segment.end - segment.start;
  const confidence = segment.confidence || 0.95;

  const getScriptLabel = (text: string) => {
    const clean = text.replace(/[()]/g, '').trim();
    if (!clean) return 'Special Tag';
    if (/^[\u0900-\u097F]+$/.test(clean)) return 'Devanagari (hi/mr)';
    if (/^[\u0980-\u09FF]+$/.test(clean)) return 'Bengali / Assamese (bn/as)';
    if (/^[\u0B80-\u0BFF]+$/.test(clean)) return 'Tamil (ta)';
    if (/^[\u0C00-\u0C7F]+$/.test(clean)) return 'Telugu (te)';
    if (/^[\u0A80-\u0AFF]+$/.test(clean)) return 'Gujarati (gu)';
    if (/^[\u0A00-\u0A7F]+$/.test(clean)) return 'Gurmukhi (pa)';
    if (/^[\u0C80-\u0CFF]+$/.test(clean)) return 'Kannada (kn)';
    if (/^[\u0D00-\u0D7F]+$/.test(clean)) return 'Malayalam (ml)';
    if (/^[\u0B00-\u0B7F]+$/.test(clean)) return 'Odia (or)';
    if (/^[\u0600-\u06FF]+$/.test(clean)) return 'Urdu / Arabic (ur/ar)';
    if (/^[a-zA-Z]+$/.test(clean)) return 'Latin (en)';
    return 'Special Marker / Mixed';
  };

  return (
    <div className="p-4 space-y-5 text-xs text-[#F5F8FC] overflow-y-auto h-full custom-scrollbar">
      
      {/* HEADER */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-[#52DDBB]" />
          <span className="font-semibold text-sm">Segment Properties</span>
        </div>
        <span className="font-mono text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded">
          {segment.id}
        </span>
      </div>

      {/* WORD TEXT & QUICK INSERTS */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
          Spoken Word Text
        </label>
        <input
          type="text"
          value={segment.text}
          onChange={(e) => updateSegmentText(segment.id, e.target.value)}
          className="w-full bg-[#172538] border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-medium focus:outline-none focus:border-[#52DDBB]"
        />

        {/* Quick Canonical Marker Inserts */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] text-slate-400">Insert tag:</span>
          <button
            onClick={() => updateSegmentText(segment.id, CANONICAL_HINDI_HESITATION)}
            className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-[#52DDBB] font-mono"
            title="Hindi/Devanagari Hesitation (अं)"
          >
            {CANONICAL_HINDI_HESITATION}
          </button>
          <button
            onClick={() => updateSegmentText(segment.id, CANONICAL_HINDI_THINKING)}
            className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-[#64C8FF] font-mono"
            title="Hindi Thinking Signal (हम्म)"
          >
            {CANONICAL_HINDI_THINKING}
          </button>
          <button
            onClick={() => updateSegmentText(segment.id, 'um')}
            className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-teal-300 font-mono"
            title="English Hesitation (um)"
          >
            um
          </button>
          <button
            onClick={() => updateSegmentText(segment.id, '(())')}
            className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-amber-300 font-mono"
            title="Unintelligible Speech (Page 14 Guidelines)"
          >
            (())
          </button>
          <button
            onClick={() => updateSegmentText(segment.id, `((${segment.text.replace(/[()]/g, '') || 'guess'}))`)}
            className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-purple-300 font-mono"
            title="Plausible Guess (Page 14 Guidelines)"
          >
            ((guess))
          </button>
        </div>
      </div>

      {/* LANGUAGE & SPEAKER ASSIGNMENT */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-[#52DDBB]" />
            Language
          </label>
          <select
            value={segment.language || 'hi'}
            onChange={(e) => updateSegmentLanguage(segment.id, e.target.value as LanguageCode)}
            className="w-full bg-[#172538] border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#52DDBB]"
          >
            {SUPPORTED_LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name} ({lang.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Mic className="w-3.5 h-3.5 text-[#64C8FF]" />
            Speaker
          </label>
          <select
            value={segment.speaker}
            onChange={(e) => updateSegmentSpeaker(segment.id, e.target.value)}
            className="w-full bg-[#172538] border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#64C8FF]"
          >
            {speakers.map(spk => (
              <option key={spk} value={spk}>{spk}</option>
            ))}
            <option value={`Speaker ${speakers.length + 1}`}>+ Add New</option>
          </select>
        </div>
      </div>

      {/* TIMESTAMPS EDITING */}
      <div className="grid grid-cols-2 gap-3 bg-[#172538]/50 p-3 rounded-xl border border-white/5">
        <div>
          <label className="block text-[11px] text-slate-400 mb-1 font-mono">
            Start Time (sec)
          </label>
          <input
            type="number"
            step="0.01"
            value={segment.start}
            onChange={(e) => updateSegmentTimestamps(segment.id, parseFloat(e.target.value) || 0, segment.end)}
            className="w-full bg-[#0B1422] border border-white/10 rounded px-2.5 py-1.5 font-mono text-xs text-white focus:outline-none focus:border-[#52DDBB]"
          />
        </div>

        <div>
          <label className="block text-[11px] text-slate-400 mb-1 font-mono">
            End Time (sec)
          </label>
          <input
            type="number"
            step="0.01"
            value={segment.end}
            onChange={(e) => updateSegmentTimestamps(segment.id, segment.start, parseFloat(e.target.value) || 0)}
            className="w-full bg-[#0B1422] border border-white/10 rounded px-2.5 py-1.5 font-mono text-xs text-white focus:outline-none focus:border-[#52DDBB]"
          />
        </div>

        <div className="col-span-2 flex items-center justify-between text-[11px] pt-1 border-t border-white/5 text-slate-400 font-mono">
          <span>Duration:</span>
          <span className="text-[#52DDBB] font-semibold">{duration.toFixed(3)}s ({(duration * 1000).toFixed(0)} ms)</span>
        </div>
      </div>

      {/* ACOUSTIC CONFIDENCE METER */}
      <div className="bg-[#172538]/50 p-3 rounded-xl border border-white/5 space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Acoustic Confidence:</span>
          <span className="font-mono font-bold text-[#52DDBB]">
            {(confidence * 100).toFixed(1)}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-[#0B1422] rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#52DDBB] to-[#64C8FF]" 
            style={{ width: `${confidence * 100}%` }} 
          />
        </div>
      </div>

      {/* MULTILINGUAL GUIDELINES COMPLIANCE BREAKDOWN */}
      <div className="bg-[#0F1C2E] p-3 rounded-xl border border-white/5 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#52DDBB]">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Multilingual Speech QC</span>
        </div>

        <div className="space-y-1 text-[11px]">
          <div className="flex items-center justify-between py-1 border-b border-white/5">
            <span className="text-slate-400">Script Verification:</span>
            <span className="text-emerald-400 font-mono">
              {getScriptLabel(segment.text)}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-white/5">
            <span className="text-slate-400">Word Count:</span>
            <span className={!/\s+/.test(segment.text.trim()) ? 'text-emerald-400 font-mono' : 'text-red-400 font-mono'}>
              {!/\s+/.test(segment.text.trim()) ? 'Single Word (Pass)' : 'Multi-word (Violation)'}
            </span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-slate-400">Review Status:</span>
            <button
              onClick={() => toggleSegmentStatus(segment.id)}
              className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#52DDBB] hover:bg-white/10 border border-white/10"
            >
              {segment.reviewStatus.toUpperCase()}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
