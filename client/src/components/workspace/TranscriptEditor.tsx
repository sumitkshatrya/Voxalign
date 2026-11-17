import React, { useState } from 'react';
import { 
  Check, AlertTriangle, AlertCircle, Undo2, Redo2, 
  Save, Plus, Trash2, Scissors, ArrowRightLeft, Search, Filter, ShieldCheck
} from 'lucide-react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { WordSegment } from '../../types';

export const TranscriptEditor: React.FC = () => {
  const {
    segments,
    speakers,
    selectedSegmentId,
    selectSegment,
    updateSegmentText,
    updateSegmentSpeaker,
    toggleSegmentStatus,
    splitSegmentAtCurrentTime,
    mergeWithNextSegment,
    addSegmentAfter,
    deleteSegment,
    applySuggestedFix,
    undo,
    redo,
    undoStack,
    redoStack,
    saveChanges,
    isSaving,
    saveMessage
  } = useWorkspaceStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'errors' | 'unreviewed' | 'verified'>('all');
  const [editingSpeakerFor, setEditingSpeakerFor] = useState<string | null>(null);

  // Filter segments
  const filteredSegments = segments.filter(seg => {
    const matchesSearch = seg.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          seg.speaker.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterMode === 'errors') {
      return seg.validationIssues && seg.validationIssues.some(i => i.severity === 'error');
    }
    if (filterMode === 'unreviewed') {
      return seg.reviewStatus === 'unreviewed';
    }
    if (filterMode === 'verified') {
      return seg.reviewStatus === 'verified';
    }
    return true;
  });

  const verifiedCount = segments.filter(s => s.reviewStatus === 'verified').length;
  const errorCount = segments.filter(s => s.validationIssues?.some(i => i.severity === 'error')).length;

  return (
    <div className="flex flex-col h-full bg-[#0B1422] text-[#F5F8FC]">
      
      {/* TOOLBAR */}
      <div className="p-3 border-b border-white/10 bg-[#172538]/60 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={undo}
            disabled={undoStack.length === 0}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={redoStack.length === 0}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-white/10 mx-1" />

          {/* Metrics summary */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-mono">
              Total: <strong className="text-white">{segments.length}</strong>
            </span>
            <span className="text-[#52DDBB] font-mono flex items-center gap-1">
              <Check className="w-3 h-3" /> {verifiedCount}
            </span>
            {errorCount > 0 && (
              <span className="text-red-400 font-mono flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errorCount}
              </span>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-2">
          {saveMessage && (
            <span className="text-xs font-mono text-[#52DDBB] animate-pulse">
              {saveMessage}
            </span>
          )}
          <button
            onClick={() => saveChanges()}
            disabled={isSaving}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#52DDBB] to-[#64C8FF] text-[#0B1422] font-semibold text-xs flex items-center gap-1.5 hover:shadow-md hover:shadow-[#52DDBB]/20 transition-all disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="px-3 py-2 border-b border-white/5 bg-[#0F1C2E] flex items-center justify-between gap-2 text-xs">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search transcript words or speakers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#172538] border border-white/10 rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#52DDBB]"
          />
        </div>

        <div className="flex items-center gap-1 bg-[#172538] p-0.5 rounded-lg border border-white/10">
          {(['all', 'errors', 'unreviewed', 'verified'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-2 py-0.5 rounded text-[11px] capitalize transition-colors ${
                filterMode === mode ? 'bg-white/10 text-[#52DDBB] font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* SEGMENTS LIST */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
        {filteredSegments.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No word segments match your filter criteria.
          </div>
        ) : (
          filteredSegments.map((seg, index) => {
            const isSelected = seg.id === selectedSegmentId;
            const errors = seg.validationIssues?.filter(i => i.severity === 'error') || [];
            const warnings = seg.validationIssues?.filter(i => i.severity === 'warning') || [];
            const isVerified = seg.reviewStatus === 'verified';

            return (
              <div
                key={seg.id}
                onClick={() => selectSegment(seg.id)}
                className={`p-3 transition-colors cursor-pointer ${
                  isSelected 
                    ? 'bg-[#172538] border-l-2 border-[#52DDBB]' 
                    : 'hover:bg-white/[0.02]'
                }`}
              >
                {/* Segment Header */}
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-500">#{index + 1}</span>
                    
                    {/* Speaker Selector */}
                    <select
                      value={seg.speaker}
                      onChange={(e) => updateSegmentSpeaker(seg.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-[#0B1422] border border-white/10 rounded px-1.5 py-0.5 text-[11px] text-[#64C8FF] font-medium focus:outline-none focus:border-[#64C8FF]"
                    >
                      {speakers.map(spk => (
                        <option key={spk} value={spk}>{spk}</option>
                      ))}
                      <option value={`Speaker ${speakers.length + 1}`}>+ Add Speaker</option>
                    </select>

                    <span className="font-mono text-[10px] text-slate-400">
                      [{seg.start.toFixed(2)}s - {seg.end.toFixed(2)}s]
                    </span>

                    <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-[#52DDBB] border border-white/10 uppercase" title={`Language: ${seg.language || 'hi'}`}>
                      {seg.language || 'hi'}
                    </span>
                  </div>

                  {/* Review status button */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSegmentStatus(seg.id);
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 border transition-colors ${
                        isVerified
                          ? 'bg-[#52DDBB]/10 border-[#52DDBB]/30 text-[#52DDBB]'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Check className="w-3 h-3" />
                      {isVerified ? 'Verified' : 'Verify'}
                    </button>
                  </div>
                </div>

                {/* Word Input & Actions */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={seg.text}
                    onChange={(e) => updateSegmentText(seg.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className={`flex-1 bg-[#0F1C2E] border rounded px-2.5 py-1.5 text-sm font-medium text-white focus:outline-none transition-colors ${
                      errors.length > 0
                        ? 'border-red-500/60 focus:border-red-500'
                        : warnings.length > 0
                        ? 'border-amber-500/50 focus:border-amber-500'
                        : 'border-white/10 focus:border-[#52DDBB]'
                    }`}
                  />

                  {/* Quick Segment Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        splitSegmentAtCurrentTime(seg.id);
                      }}
                      className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-[#52DDBB]"
                      title="Split segment"
                    >
                      <Scissors className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        mergeWithNextSegment(seg.id);
                      }}
                      className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-[#64C8FF]"
                      title="Merge with next segment"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addSegmentAfter(seg.id);
                      }}
                      className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-emerald-400"
                      title="Add segment after"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSegment(seg.id);
                      }}
                      className="p-1.5 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                      title="Delete segment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Validation Warnings & Suggested Fixes */}
                {(errors.length > 0 || warnings.length > 0) && (
                  <div className="mt-2 space-y-1">
                    {errors.map((err, i) => (
                      <div key={i} className="flex items-start justify-between text-[11px] bg-red-500/10 border border-red-500/20 text-red-300 rounded px-2 py-1">
                        <div className="flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                          <span>{err.message}</span>
                        </div>
                        {err.suggestedFix && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              applySuggestedFix(seg.id, err.suggestedFix!);
                            }}
                            className="text-[10px] bg-red-500/20 hover:bg-red-500/30 text-white font-semibold px-1.5 py-0.5 rounded ml-2 whitespace-nowrap"
                          >
                            Apply: {err.suggestedFix}
                          </button>
                        )}
                      </div>
                    ))}

                    {warnings.map((warn, i) => (
                      <div key={i} className="flex items-start justify-between text-[11px] bg-amber-500/10 border border-amber-500/20 text-amber-200 rounded px-2 py-1">
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                          <span>{warn.message}</span>
                        </div>
                        {warn.suggestedFix && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              applySuggestedFix(seg.id, warn.suggestedFix!);
                            }}
                            className="text-[10px] bg-amber-500/20 hover:bg-amber-500/30 text-white font-semibold px-1.5 py-0.5 rounded ml-2 whitespace-nowrap"
                          >
                            Apply: {warn.suggestedFix}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
