import React, { useState } from 'react';
import { Download, FileJson, FileSpreadsheet, FileText, Subtitles, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { audioApi } from '../../services/api';
import { ExportOptions } from '../../types';

export const ExportPanel: React.FC = () => {
  const { currentFile, currentProject, qcReport, segments } = useWorkspaceStore();

  const [format, setFormat] = useState<'json' | 'csv' | 'txt' | 'srt' | 'vtt'>('json');
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [includeConfidence, setIncludeConfidence] = useState(true);
  const [includeSpeakerHeader, setIncludeSpeakerHeader] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  if (!currentFile) {
    return <div className="p-8 text-center text-slate-500 text-sm">No active file to export.</div>;
  }

  const handleDownload = async () => {
    setIsExporting(true);
    setExportError(null);

    try {
      const options: ExportOptions = {
        format,
        includeMetadata,
        includeConfidence,
        includeSpeakerHeader
      };

      const resp = await audioApi.export(currentFile.id, options);
      
      // Create download blob
      const blob = new Blob([resp.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const baseName = currentFile.originalName.replace(/\.[^/.]+$/, "");
      link.download = `${baseName}_aligned.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setExportError(err.toString());
    } finally {
      setIsExporting(false);
    }
  };

  const hasBlockingErrors = qcReport && qcReport.errorCount > 0;

  return (
    <div className="p-4 space-y-6 text-[#F5F8FC] overflow-y-auto h-full custom-scrollbar text-xs">
      
      {/* HEADER */}
      <div className="pb-3 border-b border-white/10">
        <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2">
          <Download className="w-4 h-4 text-[#52DDBB]" />
          Export Annotation Data
        </h3>
        <p className="text-[11px] text-[#94A3B8] mt-0.5">
          Generate production-ready transcripts and timestamped word boundaries
        </p>
      </div>

      {/* EXPORT FORMAT SELECTION */}
      <div className="space-y-2">
        <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
          Choose Format
        </label>
        
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'json', label: 'JSON Dataset', desc: 'Full word-level timestamps & metadata', icon: FileJson },
            { id: 'csv', label: 'CSV Table', desc: 'Excel & Data Science pipeline compatible', icon: FileSpreadsheet },
            { id: 'txt', label: 'Plain Text', desc: 'Speaker turns and formatted dialogue', icon: FileText },
            { id: 'srt', label: 'SRT Subtitles', desc: 'Standard video captioning format', icon: Subtitles },
            { id: 'vtt', label: 'WebVTT', desc: 'HTML5 Web video subtitle cues', icon: Subtitles }
          ].map(item => {
            const Icon = item.icon;
            const isSelected = format === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setFormat(item.id as any)}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  isSelected
                    ? 'bg-[#52DDBB]/10 border-[#52DDBB] text-white'
                    : 'bg-[#172538] border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-[#52DDBB]' : 'text-slate-400'}`} />
                <div>
                  <div className="font-semibold text-xs text-white">{item.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* OPTIONS CHECKBOXES */}
      <div className="bg-[#172538] p-3 rounded-xl border border-white/5 space-y-2.5">
        <span className="block text-[11px] font-semibold text-slate-300">
          Export Parameters
        </span>

        <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
          <input
            type="checkbox"
            checked={includeMetadata}
            onChange={(e) => setIncludeMetadata(e.target.checked)}
            className="rounded bg-[#0B1422] border-white/20 text-[#52DDBB] focus:ring-0"
          />
          <span>Include task metadata (file ID, project, duration, QC score)</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
          <input
            type="checkbox"
            checked={includeConfidence}
            onChange={(e) => setIncludeConfidence(e.target.checked)}
            className="rounded bg-[#0B1422] border-white/20 text-[#52DDBB] focus:ring-0"
          />
          <span>Include acoustic confidence scores</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
          <input
            type="checkbox"
            checked={includeSpeakerHeader}
            onChange={(e) => setIncludeSpeakerHeader(e.target.checked)}
            className="rounded bg-[#0B1422] border-white/20 text-[#52DDBB] focus:ring-0"
          />
          <span>Include speaker labels (Speaker 1, Speaker 2)</span>
        </label>
      </div>

      {/* QC SUMMARY BANNER */}
      {hasBlockingErrors ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-200 text-[11px] flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
          <div>
            <strong>Validation Warning:</strong> You have {qcReport?.errorCount} blocking errors in this transcript according to the Hindi Alignment Guidelines. We recommend fixing them in the QC tab before client delivery.
          </div>
        </div>
      ) : (
        <div className="bg-[#10B981]/10 border border-[#10B981]/20 rounded-xl p-3 text-[#10B981] text-[11px] flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#10B981] mt-0.5" />
          <div>
            <strong>Ready for Delivery:</strong> All Page 17 automated checks have passed. You can export clean, structured annotation data.
          </div>
        </div>
      )}

      {exportError && (
        <div className="text-red-400 text-xs bg-red-500/10 p-2 rounded border border-red-500/20">
          {exportError}
        </div>
      )}

      {/* DOWNLOAD BUTTON */}
      <button
        onClick={handleDownload}
        disabled={isExporting}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-[#52DDBB] to-[#64C8FF] text-[#0B1422] font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#52DDBB]/25 transition-all disabled:opacity-50"
      >
        <Download className="w-4 h-4" />
        <span>{isExporting ? 'Generating Export...' : `Download .${format.toUpperCase()} Annotations`}</span>
      </button>

    </div>
  );
};
