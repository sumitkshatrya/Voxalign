import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Project, AudioFile, WordSegment, QualityChecklistReport } from '../types';
import { validateClientSegment, generateClientQcReport } from '../utils/hindiValidator';
import { audioApi } from '../services/api';

interface WorkspaceState {
  currentProject: Project | null;
  currentFile: AudioFile | null;
  segments: WordSegment[];
  speakers: string[];
  selectedSegmentId: string | null;
  currentTime: number;
  isPlaying: boolean;
  duration: number;
  zoomLevel: number;
  playbackRate: number;
  activeTab: 'editor' | 'properties' | 'qc' | 'export';
  isSaving: boolean;
  saveMessage: string | null;
  undoStack: WordSegment[][];
  redoStack: WordSegment[][];
  qcReport: QualityChecklistReport | null;

  setCurrentProject: (project: Project | null) => void;
  setCurrentFile: (file: AudioFile | null) => void;
  selectSegment: (segmentId: string | null) => void;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setZoom: (zoom: number) => void;
  setPlaybackRate: (rate: number) => void;
  setActiveTab: (tab: 'editor' | 'properties' | 'qc' | 'export') => void;

  updateSegmentText: (id: string, text: string) => void;
  updateSegmentTimestamps: (id: string, start: number, end: number) => void;
  updateSegmentSpeaker: (id: string, speaker: string) => void;
  toggleSegmentStatus: (id: string) => void;
  splitSegmentAtCurrentTime: (segmentId?: string) => void;
  mergeWithNextSegment: (segmentId: string) => void;
  addSegmentAfter: (segmentId?: string) => void;
  deleteSegment: (segmentId: string) => void;
  applySuggestedFix: (segmentId: string, fixText: string) => void;

  undo: () => void;
  redo: () => void;
  saveChanges: () => Promise<void>;
  refreshQc: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  currentProject: null,
  currentFile: null,
  segments: [],
  speakers: ['Speaker 1'],
  selectedSegmentId: null,
  currentTime: 0,
  isPlaying: false,
  duration: 0,
  zoomLevel: 50,
  playbackRate: 1.0,
  activeTab: 'editor',
  isSaving: false,
  saveMessage: null,
  undoStack: [],
  redoStack: [],
  qcReport: null,

  setCurrentProject: (project) => set({ currentProject: project }),

  setCurrentFile: (file) => {
    if (!file) {
      set({ currentFile: null, segments: [], speakers: ['Speaker 1'], qcReport: null });
      return;
    }
    const validated = (file.segments || []).map(s => ({
      ...s,
      validationIssues: validateClientSegment(s, file.segments)
    }));
    const qc = generateClientQcReport(validated, file.id);
    const speakers = file.speakers?.length ? file.speakers : Array.from(new Set(validated.map(s => s.speaker)));

    set({
      currentFile: file,
      segments: validated,
      speakers: speakers.length ? speakers : ['Speaker 1'],
      duration: file.metadata?.duration || 10,
      selectedSegmentId: validated[0]?.id || null,
      undoStack: [],
      redoStack: [],
      qcReport: qc
    });
  },

  selectSegment: (segmentId) => set({ selectedSegmentId: segmentId }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setZoom: (zoom) => set({ zoomLevel: zoom }),
  setPlaybackRate: (rate) => set({ playbackRate: rate }),
  setActiveTab: (tab) => set({ activeTab: tab }),

  updateSegmentText: (id, text) => {
    const { segments, undoStack } = get();
    const currentSnapshot = JSON.parse(JSON.stringify(segments));
    
    const updated = segments.map(seg => {
      if (seg.id === id) {
        const modified = { ...seg, text: text.trim() };
        modified.validationIssues = validateClientSegment(modified, segments);
        return modified;
      }
      return seg;
    });

    const qc = generateClientQcReport(updated, get().currentFile?.id || '');
    set({
      segments: updated,
      undoStack: [...undoStack, currentSnapshot],
      redoStack: [],
      qcReport: qc
    });
  },

  updateSegmentTimestamps: (id, start, end) => {
    const { segments, undoStack } = get();
    const currentSnapshot = JSON.parse(JSON.stringify(segments));

    const updated = segments.map(seg => {
      if (seg.id === id) {
        const modified = { ...seg, start: Math.max(0, start), end: Math.max(start + 0.05, end) };
        modified.validationIssues = validateClientSegment(modified, segments);
        return modified;
      }
      return seg;
    }).sort((a, b) => a.start - b.start);

    const qc = generateClientQcReport(updated, get().currentFile?.id || '');
    set({
      segments: updated,
      undoStack: [...undoStack, currentSnapshot],
      redoStack: [],
      qcReport: qc
    });
  },

  updateSegmentSpeaker: (id, speaker) => {
    const { segments, speakers, undoStack } = get();
    const currentSnapshot = JSON.parse(JSON.stringify(segments));

    const updated = segments.map(seg => {
      if (seg.id === id) {
        const modified = { ...seg, speaker };
        modified.validationIssues = validateClientSegment(modified, segments);
        return modified;
      }
      return seg;
    });

    const updatedSpeakers = Array.from(new Set([...speakers, speaker]));
    const qc = generateClientQcReport(updated, get().currentFile?.id || '');
    set({
      segments: updated,
      speakers: updatedSpeakers,
      undoStack: [...undoStack, currentSnapshot],
      redoStack: [],
      qcReport: qc
    });
  },

  toggleSegmentStatus: (id) => {
    const { segments, undoStack } = get();
    const currentSnapshot = JSON.parse(JSON.stringify(segments));

    const updated = segments.map(seg => {
      if (seg.id === id) {
        const nextStatus = seg.reviewStatus === 'verified' ? 'unreviewed' : 'verified';
        return { ...seg, reviewStatus: nextStatus as any };
      }
      return seg;
    });

    const qc = generateClientQcReport(updated, get().currentFile?.id || '');
    set({
      segments: updated,
      undoStack: [...undoStack, currentSnapshot],
      redoStack: [],
      qcReport: qc
    });
  },

  splitSegmentAtCurrentTime: (targetId) => {
    const { segments, currentTime, selectedSegmentId, undoStack } = get();
    const segId = targetId || selectedSegmentId;
    const segIndex = segments.findIndex(s => s.id === segId);
    if (segIndex === -1) return;

    const seg = segments[segIndex];
    // Must have enough duration to split
    const splitPoint = (currentTime > seg.start + 0.05 && currentTime < seg.end - 0.05) 
      ? currentTime 
      : seg.start + (seg.end - seg.start) / 2;

    const currentSnapshot = JSON.parse(JSON.stringify(segments));

    const seg1: WordSegment = {
      ...seg,
      end: parseFloat(splitPoint.toFixed(3)),
      text: seg.text || 'अं'
    };

    const seg2: WordSegment = {
      id: `seg_${uuidv4().substring(0, 8)}`,
      start: parseFloat(splitPoint.toFixed(3)),
      end: seg.end,
      text: 'हम्म',
      speaker: seg.speaker,
      confidence: 0.95,
      language: seg.language,
      reviewStatus: 'unreviewed'
    };

    seg1.validationIssues = validateClientSegment(seg1, segments);
    seg2.validationIssues = validateClientSegment(seg2, segments);

    const newSegments = [...segments];
    newSegments.splice(segIndex, 1, seg1, seg2);

    const qc = generateClientQcReport(newSegments, get().currentFile?.id || '');
    set({
      segments: newSegments,
      selectedSegmentId: seg2.id,
      undoStack: [...undoStack, currentSnapshot],
      redoStack: [],
      qcReport: qc
    });
  },

  mergeWithNextSegment: (segmentId) => {
    const { segments, undoStack } = get();
    const idx = segments.findIndex(s => s.id === segmentId);
    if (idx === -1 || idx === segments.length - 1) return;

    const cur = segments[idx];
    const next = segments[idx + 1];

    const currentSnapshot = JSON.parse(JSON.stringify(segments));

    const merged: WordSegment = {
      id: cur.id,
      text: `${cur.text} ${next.text}`.trim(),
      start: cur.start,
      end: next.end,
      speaker: cur.speaker,
      confidence: Math.min(cur.confidence || 0.9, next.confidence || 0.9),
      language: cur.language,
      reviewStatus: 'unreviewed'
    };
    merged.validationIssues = validateClientSegment(merged, segments);

    const newSegments = [...segments];
    newSegments.splice(idx, 2, merged);

    const qc = generateClientQcReport(newSegments, get().currentFile?.id || '');
    set({
      segments: newSegments,
      selectedSegmentId: merged.id,
      undoStack: [...undoStack, currentSnapshot],
      redoStack: [],
      qcReport: qc
    });
  },

  addSegmentAfter: (segmentId) => {
    const { segments, selectedSegmentId, undoStack } = get();
    const segId = segmentId || selectedSegmentId;
    const idx = segments.findIndex(s => s.id === segId);
    if (idx === -1) return;

    const cur = segments[idx];
    const nextStart = cur.end + 0.05;
    const nextEnd = cur.end + 0.45;

    const currentSnapshot = JSON.parse(JSON.stringify(segments));

    const newSeg: WordSegment = {
      id: `seg_${uuidv4().substring(0, 8)}`,
      text: 'नया_शब्द',
      start: parseFloat(nextStart.toFixed(3)),
      end: parseFloat(nextEnd.toFixed(3)),
      speaker: cur.speaker,
      confidence: 1.0,
      language: cur.language || 'hi',
      reviewStatus: 'unreviewed'
    };
    newSeg.validationIssues = validateClientSegment(newSeg, segments);

    const newSegments = [...segments];
    newSegments.splice(idx + 1, 0, newSeg);

    const qc = generateClientQcReport(newSegments, get().currentFile?.id || '');
    set({
      segments: newSegments,
      selectedSegmentId: newSeg.id,
      undoStack: [...undoStack, currentSnapshot],
      redoStack: [],
      qcReport: qc
    });
  },

  deleteSegment: (segmentId) => {
    const { segments, undoStack } = get();
    const currentSnapshot = JSON.parse(JSON.stringify(segments));
    const newSegments = segments.filter(s => s.id !== segmentId);
    const qc = generateClientQcReport(newSegments, get().currentFile?.id || '');

    set({
      segments: newSegments,
      selectedSegmentId: newSegments[0]?.id || null,
      undoStack: [...undoStack, currentSnapshot],
      redoStack: [],
      qcReport: qc
    });
  },

  applySuggestedFix: (segmentId, fixText) => {
    get().updateSegmentText(segmentId, fixText);
  },

  undo: () => {
    const { undoStack, redoStack, segments } = get();
    if (undoStack.length === 0) return;

    const previous = undoStack[undoStack.length - 1];
    const newUndo = undoStack.slice(0, -1);
    const qc = generateClientQcReport(previous, get().currentFile?.id || '');

    set({
      segments: previous,
      undoStack: newUndo,
      redoStack: [...redoStack, segments],
      qcReport: qc
    });
  },

  redo: () => {
    const { redoStack, undoStack, segments } = get();
    if (redoStack.length === 0) return;

    const next = redoStack[redoStack.length - 1];
    const newRedo = redoStack.slice(0, -1);
    const qc = generateClientQcReport(next, get().currentFile?.id || '');

    set({
      segments: next,
      redoStack: newRedo,
      undoStack: [...undoStack, segments],
      qcReport: qc
    });
  },

  saveChanges: async () => {
    const { currentFile, segments, speakers } = get();
    if (!currentFile) return;

    set({ isSaving: true, saveMessage: null });
    try {
      const resp = await audioApi.updateSegments(currentFile.id, segments, speakers);
      set({
        isSaving: false,
        saveMessage: 'Changes saved & verified successfully!',
        currentFile: resp.data.file,
        qcReport: resp.data.qcReport
      });
      setTimeout(() => set({ saveMessage: null }), 3000);
    } catch (err: any) {
      set({ isSaving: false, saveMessage: `Save error: ${err.toString()}` });
    }
  },

  refreshQc: () => {
    const { segments, currentFile } = get();
    const qc = generateClientQcReport(segments, currentFile?.id || '');
    set({ qcReport: qc });
  }
}));
