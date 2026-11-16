import React from 'react';
import { 
  CheckCircle2, AlertCircle, AlertTriangle, ShieldCheck, 
  HelpCircle, Sparkles, RefreshCw, ArrowRight 
} from 'lucide-react';
import { useWorkspaceStore } from '../../store/workspaceStore';

export const QualityControlPanel: React.FC = () => {
  const {
    qcReport,
    segments,
    refreshQc,
    selectSegment,
    applySuggestedFix
  } = useWorkspaceStore();

  if (!qcReport) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm">
        Quality control data is compiling...
      </div>
    );
  }

  const issuesList = segments.flatMap(s => (s.validationIssues || []).map(issue => ({
    segment: s,
    issue
  })));

  return (
    <div className="p-4 space-y-6 text-[#F5F8FC] overflow-y-auto h-full custom-scrollbar text-xs">
      
      {/* HEADER & SCORE */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#52DDBB]" />
            Page 17 Quality Control Checklist
          </h3>
          <p className="text-[11px] text-[#94A3B8] mt-0.5">
            Hindi (hi_IN) alignment functional specification compliance
          </p>
        </div>

        <button
          onClick={refreshQc}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          title="Re-run validation"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* STATUS OVERVIEW CARDS */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-[#172538] p-2.5 rounded-xl border border-white/5">
          <div className="text-xl font-bold font-mono text-[#52DDBB]">
            {qcReport.passedChecksCount}/{qcReport.checklistItems.length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Checks Passed</div>
        </div>

        <div className="bg-[#172538] p-2.5 rounded-xl border border-white/5">
          <div className={`text-xl font-bold font-mono ${qcReport.errorCount > 0 ? 'text-red-400' : 'text-slate-400'}`}>
            {qcReport.errorCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Errors (Blocks Export)</div>
        </div>

        <div className="bg-[#172538] p-2.5 rounded-xl border border-white/5">
          <div className={`text-xl font-bold font-mono ${qcReport.warningCount > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
            {qcReport.warningCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Warnings</div>
        </div>
      </div>

      {/* IMPORTANT AUDIT NOTICE (FROM GUIDELINES) */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-amber-200 text-[11px] flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
        <p>
          <strong>Human Review Notice:</strong> Never declare a transcript accurate solely because automated validation passed. Annotators must listen to the audio carefully and verify actual spoken cut-offs, acoustic context, and nuances.
        </p>
      </div>

      {/* CHECKLIST ITEMS */}
      <div className="space-y-2">
        <h4 className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">
          Functional Requirements
        </h4>
        <div className="space-y-1.5">
          {qcReport.checklistItems.map(item => (
            <div
              key={item.id}
              className={`p-2.5 rounded-xl border flex items-start justify-between gap-3 ${
                item.passed
                  ? 'bg-[#10B981]/5 border-[#10B981]/20 text-slate-200'
                  : 'bg-red-500/5 border-red-500/30 text-red-200'
              }`}
            >
              <div className="flex items-start gap-2">
                {item.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-medium text-xs text-white">{item.label}</div>
                  <div className="text-[11px] text-slate-400">{item.description}</div>
                </div>
              </div>

              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                item.passed ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-red-500/20 text-red-300'
              }`}>
                {item.passed ? 'PASSED' : 'ACTION REQ'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* FLAGGED ISSUES WITH ONE-CLICK FIXES */}
      {issuesList.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-white/10">
          <h4 className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider flex items-center justify-between">
            <span>Flagged Word Items ({issuesList.length})</span>
          </h4>

          <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
            {issuesList.map((entry, idx) => (
              <div
                key={idx}
                className="bg-[#172538] p-2.5 rounded-xl border border-white/5 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => selectSegment(entry.segment.id)}
                    className="font-medium text-xs text-white hover:text-[#52DDBB] flex items-center gap-1.5 font-mono"
                  >
                    <span>"{entry.segment.text}"</span>
                    <span className="text-[10px] text-slate-400">
                      [{entry.segment.start.toFixed(2)}s]
                    </span>
                  </button>

                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase ${
                    entry.issue.severity === 'error' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {entry.issue.code}
                  </span>
                </div>

                <p className="text-[11px] text-slate-300">{entry.issue.message}</p>

                {entry.issue.suggestedFix && (
                  <div className="pt-1 flex items-center justify-end">
                    <button
                      onClick={() => applySuggestedFix(entry.segment.id, entry.issue.suggestedFix!)}
                      className="px-2 py-1 rounded bg-[#52DDBB]/20 hover:bg-[#52DDBB]/30 text-[#52DDBB] font-semibold text-[10px] flex items-center gap-1 transition-colors"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Auto-Fix: {entry.issue.suggestedFix}</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
